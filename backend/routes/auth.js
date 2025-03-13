const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, companyName } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with unique tenant ID
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        companyName,
        // tenantId will be generated automatically with @default(uuid())
      }
    });

    // Create default widget for the new user
    await prisma.widget.create({
      data: {
        tenantId: newUser.tenantId,
        // Other fields will use default values as defined in the schema
      }
    });

    // Return success response (don't send password back)
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        companyName: newUser.companyName,
        tenantId: newUser.tenantId
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Error registering new user',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, tenantId: user.tenantId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set token as cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Return success response with token
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        companyName: user.companyName,
        tenantId: user.tenantId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Logout user
router.post('/logout', (req, res) => {
  // Clear token cookie
  res.clearCookie('token');
  res.status(200).json({
    message: 'Logged out successfully'
  });
});

module.exports = router; 