const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Middleware to protect routes
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      // Or check if token exists in cookies
      token = req.cookies.token;
    }

    // If no token, return unauthorized
    if (!token) {
      return res.status(401).json({
        message: 'You are not logged in. Please log in to get access.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(401).json({
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // Add user and tenantId to request
    req.user = user;
    req.tenantId = user.tenantId;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid token. Please log in again.'
    });
  }
};

module.exports = { protect }; 