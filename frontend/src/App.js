import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

// Import pages (we'll create these next)
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Conversations from './pages/Conversations';
import ConversationDetail from './pages/ConversationDetail';
import KnowledgeBase from './pages/KnowledgeBase';
import WidgetSettings from './pages/WidgetSettings';
import Profile from './pages/Profile';

// Custom theme
const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6f7ff',
      100: '#b3e0ff',
      200: '#80caff',
      300: '#4db3ff',
      400: '#1a9dff',
      500: '#0080ff', // Primary color
      600: '#0066cc',
      700: '#004d99',
      800: '#003366',
      900: '#001a33',
    },
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  },
});

// Auth check function
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/conversations" element={
            <PrivateRoute>
              <Conversations />
            </PrivateRoute>
          } />
          <Route path="/conversations/:id" element={
            <PrivateRoute>
              <ConversationDetail />
            </PrivateRoute>
          } />
          <Route path="/knowledge-base" element={
            <PrivateRoute>
              <KnowledgeBase />
            </PrivateRoute>
          } />
          <Route path="/widget-settings" element={
            <PrivateRoute>
              <WidgetSettings />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          
          {/* Redirect to dashboard if authenticated, otherwise to login */}
          <Route path="/" element={
            localStorage.getItem('token') ? 
            <Navigate to="/dashboard" /> : 
            <Navigate to="/login" />
          } />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
