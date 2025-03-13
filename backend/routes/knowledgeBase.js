const express = require('express');
const { protect } = require('../middlewares/auth');
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const cheerio = require('cheerio');

const prisma = new PrismaClient();
const router = express.Router();

// Apply authentication middleware to all knowledge base routes
router.use(protect);

// Get all knowledge base entries for the authenticated user
router.get('/', async (req, res) => {
  try {
    const knowledgeBase = await prisma.knowledgeBase.findMany({
      where: {
        tenantId: req.tenantId
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    res.status(200).json({
      data: knowledgeBase
    });
  } catch (error) {
    console.error('Error fetching knowledge base:', error);
    res.status(500).json({
      message: 'Error fetching knowledge base',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Add a new knowledge base entry
router.post('/', async (req, res) => {
  try {
    const { type, question, answer, content } = req.body;

    // Validate request
    if (!type || !['text', 'qa'].includes(type)) {
      return res.status(400).json({
        message: 'Invalid type. Must be "text" or "qa".'
      });
    }

    if (type === 'qa' && (!question || !answer)) {
      return res.status(400).json({
        message: 'Question and answer are required for QA type'
      });
    }

    if (type === 'text' && !content) {
      return res.status(400).json({
        message: 'Content is required for text type'
      });
    }

    // Create new knowledge base entry
    const newEntry = await prisma.knowledgeBase.create({
      data: {
        type,
        question: type === 'qa' ? question : null,
        answer: type === 'qa' ? answer : null,
        content: type === 'text' ? content : null,
        tenantId: req.tenantId
      }
    });

    res.status(201).json({
      message: 'Knowledge base entry created successfully',
      data: newEntry
    });
  } catch (error) {
    console.error('Error creating knowledge base entry:', error);
    res.status(500).json({
      message: 'Error creating knowledge base entry',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Update a knowledge base entry
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, question, answer, content } = req.body;

    // Find the entry to ensure it belongs to the tenant
    const entry = await prisma.knowledgeBase.findFirst({
      where: {
        id,
        tenantId: req.tenantId
      }
    });

    if (!entry) {
      return res.status(404).json({
        message: 'Knowledge base entry not found'
      });
    }

    // Validate request
    if (type && !['text', 'qa'].includes(type)) {
      return res.status(400).json({
        message: 'Invalid type. Must be "text" or "qa".'
      });
    }

    // Update the entry
    const updatedEntry = await prisma.knowledgeBase.update({
      where: { id },
      data: {
        type: type || entry.type,
        question: type === 'qa' ? question : null,
        answer: type === 'qa' ? answer : null,
        content: type === 'text' ? content : null
      }
    });

    res.status(200).json({
      message: 'Knowledge base entry updated successfully',
      data: updatedEntry
    });
  } catch (error) {
    console.error('Error updating knowledge base entry:', error);
    res.status(500).json({
      message: 'Error updating knowledge base entry',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Delete a knowledge base entry
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the entry to ensure it belongs to the tenant
    const entry = await prisma.knowledgeBase.findFirst({
      where: {
        id,
        tenantId: req.tenantId
      }
    });

    if (!entry) {
      return res.status(404).json({
        message: 'Knowledge base entry not found'
      });
    }

    // Delete the entry
    await prisma.knowledgeBase.delete({
      where: { id }
    });

    res.status(200).json({
      message: 'Knowledge base entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting knowledge base entry:', error);
    res.status(500).json({
      message: 'Error deleting knowledge base entry',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Crawl website and extract content
router.post('/crawl', async (req, res) => {
  try {
    const { url, selector } = req.body;
    
    if (!url) {
      return res.status(400).json({
        message: 'URL is required'
      });
    }
    
    // Fetch the website content
    const response = await axios.get(url);
    const html = response.data;
    
    // Use cheerio to parse the HTML
    const $ = cheerio.load(html);
    
    // Extract content based on selector or default to body text
    let content = '';
    if (selector) {
      content = $(selector).text().trim();
    } else {
      // Extract meaningful content (paragraphs, headings, lists)
      $('p, h1, h2, h3, h4, h5, h6, li').each((i, el) => {
        const text = $(el).text().trim();
        if (text) {
          content += text + '\n\n';
        }
      });
    }
    
    // Get page title for better identification
    const title = $('title').text().trim() || 'Untitled Page';
    
    // Create metadata JSON
    const metadata = JSON.stringify({
      source: 'website_crawler',
      url: url,
      title: title,
      crawledAt: new Date().toISOString(),
      selector: selector || null
    });
    
    // Create knowledge base entry with the extracted content
    const entry = await prisma.knowledgeBase.create({
      data: {
        type: 'text',
        content,
        metadata,
        tenantId: req.tenantId,
      }
    });
    
    res.status(201).json({
      message: 'Website content extracted successfully',
      data: entry
    });
  } catch (error) {
    console.error('Error crawling website:', error);
    res.status(500).json({
      message: 'Error crawling website',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router; 