import { io } from 'socket.io-client';

// Create a socket instance
let socket;

// Initialize socket connection
export const initSocket = (tenantId) => {
  // Close existing connection if any
  if (socket) {
    socket.disconnect();
  }

  // Create new connection
  socket = io('http://localhost:8000', {
    auth: {
      token: localStorage.getItem('token')
    },
    withCredentials: true
  });

  // Connect and join tenant room
  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    
    // Join tenant room for isolated messaging
    if (tenantId) {
      socket.emit('join-tenant', tenantId);
    }
  });

  // Handle connection errors
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  return socket;
};

// Get the socket instance
export const getSocket = () => {
  if (!socket) {
    console.warn('Socket not initialized. Call initSocket first.');
  }
  return socket;
};

// Send a new message
export const sendMessage = (tenantId, message) => {
  if (!socket) {
    console.warn('Socket not initialized. Call initSocket first.');
    return;
  }
  socket.emit('message:new', { tenantId, message });
};

// Update message status
export const updateMessageStatus = (tenantId, messageId, status) => {
  if (!socket) {
    console.warn('Socket not initialized. Call initSocket first.');
    return;
  }
  socket.emit('message:update', { tenantId, messageId, status });
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}; 