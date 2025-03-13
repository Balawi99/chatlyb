const express = require('express');
const { protect } = require('../middlewares/auth');
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();
const router = express.Router();

// Apply authentication middleware to all conversation routes
router.use(protect);

// Get all conversations for the authenticated user
router.get('/', async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        tenantId: req.tenantId
      },
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    res.status(200).json({
      data: conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      message: 'Error fetching conversations',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Get a specific conversation with messages
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        tenantId: req.tenantId // Ensure tenant isolation
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({
        message: 'Conversation not found'
      });
    }

    res.status(200).json({
      data: conversation
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      message: 'Error fetching conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Add a new message to a conversation with AI response
router.post('/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    // Verify conversation exists and belongs to tenant
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        tenantId: req.tenantId
      }
    });

    if (!conversation) {
      return res.status(404).json({
        message: 'Conversation not found'
      });
    }

    // Create the new message
    const userMessage = await prisma.message.create({
      data: {
        content,
        sender: 'user',
        conversationId: id
      }
    });

    // Get widget settings for AI configuration
    const widget = await prisma.widget.findUnique({
      where: { tenantId: req.tenantId }
    });

    let aiSettings = null;
    if (widget && widget.aiSettings) {
      try {
        aiSettings = JSON.parse(widget.aiSettings);
      } catch (e) {
        console.error('Error parsing AI settings:', e);
      }
    }

    // Get knowledge base entries for context
    const knowledgeEntries = await prisma.knowledgeBase.findMany({
      where: { tenantId: req.tenantId },
      take: 20, // Limit to most recent entries
      orderBy: { updatedAt: 'desc' }
    });

    // Generate context from knowledge base
    let context = '';
    if (knowledgeEntries.length > 0 && (!aiSettings || aiSettings.knowledgeBaseEnabled !== false)) {
      context = knowledgeEntries.map(entry => {
        if (entry.type === 'qa') {
          return `Question: ${entry.question}\nAnswer: ${entry.answer}`;
        } else {
          return entry.content;
        }
      }).join('\n\n');
    }

    // Get previous messages for context
    const previousMessages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
      take: 10 // Limit for context window
    });

    // Simulate AI response for now (in a real app, you would call your AI provider)
    let aiResponse = "I understand your question. Let me check what I know about this.";
    
    try {
      // Prepare context and prompt for AI
      const conversationHistory = previousMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      
      // Add user's message
      conversationHistory.push({
        role: 'user',
        content: content
      });
      
      // If you have an OpenAI API key or other AI provider
      if (process.env.OPENAI_API_KEY) {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: aiSettings?.aiModel || 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a helpful customer support AI assistant. Use the following knowledge base information to answer the user's questions:\n\n${context}`
            },
            ...conversationHistory
          ],
          temperature: aiSettings?.temperature || 0.7,
          max_tokens: aiSettings?.maxTokens || 1000
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        
        aiResponse = response.data.choices[0].message.content;
      } else {
        // Provide a simple response when no AI API is available
        const questions = ["what", "how", "why", "when", "where", "who", "can", "could", "would", "will"];
        const startsWithQuestion = questions.some(q => content.toLowerCase().startsWith(q));
        
        if (content.includes("help")) {
          aiResponse = "I'd be happy to help! What specific assistance do you need today?";
        } else if (content.includes("thank")) {
          aiResponse = "You're welcome! Is there anything else I can help you with?";
        } else if (startsWithQuestion) {
          aiResponse = "That's a good question. Based on the information I have, " + 
                      (context ? "I can provide some insights from our knowledge base." : "I don't have specific information about that in my knowledge base yet.");
        } else {
          aiResponse = "I understand. Let me know if you have any specific questions I can help with.";
        }
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      // Use fallback responses if AI call fails
      const fallbacks = aiSettings?.defaultResponses || [
        "I'm sorry, I couldn't process that request right now.",
        "It seems I'm having trouble connecting to my knowledge base. Could you try again?"
      ];
      aiResponse = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
    
    // Create AI response message
    const botMessage = await prisma.message.create({
      data: {
        content: aiResponse,
        sender: 'bot',
        conversationId: id
      }
    });

    // Update conversation updatedAt timestamp
    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() }
    });

    res.status(201).json({
      message: 'Messages added successfully',
      data: {
        userMessage,
        botMessage
      }
    });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({
      message: 'Error adding message',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Update message status
router.patch('/messages/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['sent', 'delivered', 'seen'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Must be sent, delivered, or seen.'
      });
    }

    // Update the message status
    const updatedMessage = await prisma.message.update({
      where: { id },
      data: { status }
    });

    res.status(200).json({
      message: 'Message status updated',
      data: updatedMessage
    });
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({
      message: 'Error updating message status',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router; 