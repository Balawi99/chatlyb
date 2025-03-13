const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { PrismaClient } = require('@prisma/client');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Prisma client
const prisma = new PrismaClient();

// Setup middlewares
app.use(cors({
  origin: true, // السماح بالطلبات من أي مصدر
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Access-Control-Allow-Private-Network']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// ميدلوير لإضافة رأس الوصول للشبكة الخاصة لجميع الاستجابات
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  next();
});

// Special CORS handling for widget routes
app.options('/widget.js', cors({ 
  origin: true,
  exposedHeaders: ['Access-Control-Allow-Private-Network']
}));
app.options('/api/widget/public/:tenantId', cors({ 
  origin: true,
  exposedHeaders: ['Access-Control-Allow-Private-Network']
}));

// Serve widget.js file
app.get('/widget.js', cors({ 
  origin: true,
  exposedHeaders: ['Access-Control-Allow-Private-Network']
}), (req, res) => {
  // Get the host and protocol from the request
  const host = req.get('host') || 'localhost:8000';
  const protocol = req.protocol || 'http';
  const apiBaseUrl = `${protocol}://${host}/api`;
  
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`
    (function(window) {
      // Widget initialization code
      window.ChatlyWidget = window.ChatlyWidget || {};
      
      // Create widget container
      function createWidget(tenantId) {
        // Extract tenant ID from URL or init configuration
        const widgetTenantId = tenantId || window.chatlyEmbed?.tenantId;
        if (!widgetTenantId) {
          console.error('Chatly Widget: No tenant ID provided');
          return;
        }

        console.log('Initializing widget with tenantId:', widgetTenantId);
        
        // Fetch widget configuration from server - using absolute URL to avoid CORS issues
        fetch(\`${apiBaseUrl}/widget/public/\${widgetTenantId}\`, {
          method: 'GET',
          mode: 'cors',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Request-Private-Network': 'true'
          }
        })
          .then(response => {
            console.log('Widget config response:', response);
            return response.json();
          })
          .then(data => {
            console.log('Widget config data:', data);
            const widgetConfig = data.data || {
              color: '#3B82F6',
              position: 'right',
              welcomeText: 'Hello! How can I help you today?',
              logoUrl: null
            };
            
            buildWidgetUI(widgetConfig, widgetTenantId);
          })
          .catch(error => {
            console.error('Error fetching widget config:', error);
            // Use default configuration if fetch fails
            buildWidgetUI({
              color: '#3B82F6',
              position: 'right',
              welcomeText: 'Hello! How can I help you today?',
              logoUrl: null
            }, widgetTenantId);
          });
      }

      function buildWidgetUI(config, tenantId) {
        console.log('Building widget UI with config:', config);
        
        // Remove any existing widget containers to prevent duplicates
        const existingContainer = document.getElementById('chatly-widget-container');
        if (existingContainer) {
          existingContainer.remove();
        }
        
        // Create widget container
        const container = document.createElement('div');
        container.id = 'chatly-widget-container';
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style[config.position || 'right'] = '20px';
        container.style.zIndex = '9999';
        document.body.appendChild(container);

        // Create widget button with modern styling
        const button = document.createElement('button');
        button.id = 'chatly-widget-button';
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
        button.style.width = '60px';
        button.style.height = '60px';
        button.style.borderRadius = '50%';
        button.style.backgroundColor = config.color || '#3B82F6';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.cursor = 'pointer';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        button.style.transition = 'all 0.2s ease-in-out';
        container.appendChild(button);
        
        // Add hover effect for button
        button.addEventListener('mouseover', function() {
          this.style.transform = 'scale(1.05)';
          this.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
        });
        
        button.addEventListener('mouseout', function() {
          this.style.transform = 'scale(1)';
          this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        });

        // Create chat container (initially hidden) with modern styling
        const chatContainer = document.createElement('div');
        chatContainer.id = 'chatly-chat-container';
        chatContainer.style.position = 'absolute';
        chatContainer.style.bottom = '80px';
        chatContainer.style[config.position || 'right'] = '0';
        chatContainer.style.width = '320px';
        chatContainer.style.height = '450px';
        chatContainer.style.backgroundColor = 'white';
        chatContainer.style.borderRadius = '10px';
        chatContainer.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.2)';
        chatContainer.style.display = 'none';
        chatContainer.style.flexDirection = 'column';
        chatContainer.style.overflow = 'hidden';
        chatContainer.style.transition = 'all 0.3s ease-in-out';
        chatContainer.style.transform = 'translateY(20px)';
        chatContainer.style.border = '1px solid rgba(0, 0, 0, 0.1)';
        
        // Modern chat interface
        chatContainer.innerHTML = \`
          <div style="padding: 16px; background-color: \${config.color || '#3B82F6'}; color: white; border-top-left-radius: 10px; border-top-right-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-size: 16px; font-weight: 600;">Chat Support</h3>
            <button id="chatly-close-btn" style="background: none; border: none; color: white; cursor: pointer; width: 24px; height: 24px; font-size: 20px; display: flex; align-items: center; justify-content: center; padding: 0;">×</button>
          </div>
          <div id="chatly-messages" style="flex: 1; padding: 16px; overflow-y: auto; background-color: #f8fafc;">
            <!-- Messages will appear here -->
          </div>
          <div style="padding: 12px; border-top: 1px solid #eee; background-color: white;">
            <div style="display: flex; align-items: center;">
              <input id="chatly-input" type="text" placeholder="Type a message..." style="flex: 1; padding: 10px; border: 1px solid #e2e8f0; border-radius: 24px; margin-right: 8px; font-size: 14px; outline: none; transition: border-color 0.2s ease;">
              <button id="chatly-send-btn" style="background-color: \${config.color || '#3B82F6'}; color: white; border: none; border-radius: 50%; width: 36px; height: 36px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: opacity 0.2s ease;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </div>
          </div>
          \${config.showBranding !== false ? '<div style="text-align: center; padding: 6px; font-size: 11px; color: #94a3b8; background-color: white;">Powered by Chatly</div>' : ''}
        \`;
        container.appendChild(chatContainer);

        // Add event listeners
        button.addEventListener('click', function() {
          if (chatContainer.style.display === 'none') {
            chatContainer.style.display = 'flex';
            chatContainer.style.opacity = '1';
            chatContainer.style.transform = 'translateY(0)';
            
            // Show welcome message
            if (document.getElementById('chatly-messages').children.length === 0) {
              const welcomeMsg = document.createElement('div');
              welcomeMsg.style.backgroundColor = '#f1f5f9';
              welcomeMsg.style.color = '#4b5563';
              welcomeMsg.style.padding = '12px 16px';
              welcomeMsg.style.borderRadius = '12px';
              welcomeMsg.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
              welcomeMsg.style.marginBottom = '12px';
              welcomeMsg.style.maxWidth = '80%';
              welcomeMsg.style.fontSize = '14px';
              welcomeMsg.style.lineHeight = '1.5';
              welcomeMsg.textContent = config.welcomeText || 'Hello! How can I help you today?';
              document.getElementById('chatly-messages').appendChild(welcomeMsg);
            }
          } else {
            chatContainer.style.opacity = '0';
            chatContainer.style.transform = 'translateY(20px)';
            setTimeout(() => {
              chatContainer.style.display = 'none';
            }, 300);
          }
        });

        // Close button
        document.getElementById('chatly-close-btn').addEventListener('click', function(e) {
          e.stopPropagation();
          chatContainer.style.opacity = '0';
          chatContainer.style.transform = 'translateY(20px)';
          setTimeout(() => {
            chatContainer.style.display = 'none';
          }, 300);
        });

        // Input focus styling
        const input = document.getElementById('chatly-input');
        input.addEventListener('focus', function() {
          this.style.borderColor = config.color || '#3B82F6';
          this.style.boxShadow = \`0 0 0 2px \${config.color}33 || rgba(59, 130, 246, 0.2)\`;
        });
        
        input.addEventListener('blur', function() {
          this.style.borderColor = '#e2e8f0';
          this.style.boxShadow = 'none';
        });

        // Send button
        document.getElementById('chatly-send-btn').addEventListener('click', sendMessage);
        
        // Enter key in input
        document.getElementById('chatly-input').addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
            sendMessage();
          }
        });

        function sendMessage() {
          const input = document.getElementById('chatly-input');
          const message = input.value.trim();
          
          if (message) {
            // Add user message
            const userMsg = document.createElement('div');
            userMsg.style.backgroundColor = config.color || '#3B82F6';
            userMsg.style.color = 'white';
            userMsg.style.padding = '12px 16px';
            userMsg.style.borderRadius = '12px';
            userMsg.style.marginBottom = '12px';
            userMsg.style.marginLeft = 'auto';
            userMsg.style.maxWidth = '80%';
            userMsg.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.1)';
            userMsg.style.fontSize = '14px';
            userMsg.style.lineHeight = '1.5';
            userMsg.textContent = message;
            
            const messagesContainer = document.getElementById('chatly-messages');
            messagesContainer.appendChild(userMsg);
            
            // Clear input
            input.value = '';
            input.focus();
            
            // Simulate response
            setTimeout(() => {
              const botMsg = document.createElement('div');
              botMsg.style.backgroundColor = '#f1f5f9';
              botMsg.style.color = '#4b5563';
              botMsg.style.padding = '12px 16px';
              botMsg.style.borderRadius = '12px';
              botMsg.style.marginBottom = '12px';
              botMsg.style.maxWidth = '80%';
              botMsg.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
              botMsg.style.fontSize = '14px';
              botMsg.style.lineHeight = '1.5';
              botMsg.textContent = 'Thank you for your message. This is a demo widget for your local environment.';
              messagesContainer.appendChild(botMsg);
              
              // Scroll to bottom
              messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 1000);
            
            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        }
      }

      // Initialize when DOM is loaded
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
          console.log('DOM loaded, checking for chatly widget');
          if (window.chatlyEmbed && window.chatlyEmbed.tenantId) {
            createWidget(window.chatlyEmbed.tenantId);
          } else if (window.ChatlyWidget && typeof window.ChatlyWidget === 'function') {
            // Continue with initialization if using the function-style initialization
            console.log('Using function-style initialization');
          }
        });
      } else {
        console.log('DOM already loaded, initializing immediately');
        if (window.chatlyEmbed && window.chatlyEmbed.tenantId) {
          createWidget(window.chatlyEmbed.tenantId);
        } else if (window.ChatlyWidget && typeof window.ChatlyWidget === 'function') {
          // Continue with initialization if using the function-style initialization
          console.log('Using function-style initialization');
        }
      }

      // Public API
      window.chatly = function(method, options) {
        console.log('chatly API called with method:', method, 'options:', options);
        if (method === 'init' && options && options.tenantId) {
          createWidget(options.tenantId);
        }
      };
    })(window);
  `);
});

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:3000', 'http://127.0.0.1:3001', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  }
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a tenant room for isolated messaging
  socket.on('join-tenant', (tenantId) => {
    socket.join(tenantId);
    console.log(`Socket ${socket.id} joined tenant: ${tenantId}`);
  });

  // Handle new message
  socket.on('message:new', (data) => {
    const { tenantId, message } = data;
    // Broadcast the message to all clients in the same tenant
    io.to(tenantId).emit('message:new', message);
    console.log(`New message in tenant ${tenantId}: ${message.content}`);
  });

  // Handle message status update
  socket.on('message:update', (data) => {
    const { tenantId, messageId, status } = data;
    // Broadcast the update to all clients in the same tenant
    io.to(tenantId).emit('message:update', { messageId, status });
    console.log(`Message ${messageId} status updated to ${status} in tenant ${tenantId}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Import routes (we'll create these files next)
const authRoutes = require('./routes/auth');
const conversationRoutes = require('./routes/conversations');
const knowledgeBaseRoutes = require('./routes/knowledgeBase');
const widgetRoutes = require('./routes/widget');
const settingsRoutes = require('./routes/settings');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/knowledge-base', knowledgeBaseRoutes);
app.use('/api/widget', widgetRoutes);
app.use('/api/settings', settingsRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Chatly API is running' });
});

// Serve test widget HTML file
app.get('/test-widget', (req, res) => {
  res.sendFile('test-widget.html', { root: process.cwd().replace(/\\backend$/, '') });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Export Prisma client for use in other files
module.exports = { prisma }; 