const express = require('express');
const bcrypt = require('bcrypt');
const { protect } = require('../middlewares/auth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Apply authentication middleware to all settings routes
router.use(protect);

// Get user profile settings
router.get('/', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id
      },
      select: {
        id: true,
        email: true,
        name: true,
        companyName: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.status(200).json({
      data: user
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({
      message: 'Error fetching user settings',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Update user profile settings
router.put('/', async (req, res) => {
  try {
    const { name, email, companyName, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // If email is being changed, check if it's already in use
    if (email && email !== req.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({
          message: 'Email is already in use'
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (companyName) updateData.companyName = companyName;

    // Handle password change if requested
    if (newPassword) {
      // Verify current password
      if (!currentPassword) {
        return res.status(400).json({
          message: 'Current password is required to set a new password'
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(newPassword, salt);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        companyName: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      message: 'Settings updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({
      message: 'Error updating user settings',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router; 