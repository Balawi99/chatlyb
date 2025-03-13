import { authAPI } from './api';

// Store user data in local storage
export const setUserData = (userData) => {
  localStorage.setItem('user', JSON.stringify(userData));
  localStorage.setItem('token', userData.token);
};

// Get user data from local storage
export const getUserData = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Get tenant ID from local storage
export const getTenantId = () => {
  const user = getUserData();
  return user ? user.user.tenantId : null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

// Register a new user
export const register = async (userData) => {
  try {
    const response = await authAPI.register(userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Login a user
export const login = async (credentials) => {
  try {
    const response = await authAPI.login(credentials);
    setUserData(response.data);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Logout a user
export const logout = async () => {
  try {
    await authAPI.logout();
    localStorage.clear();
    return true;
  } catch (error) {
    // Clear local storage even if the API call fails
    localStorage.clear();
    throw error.response ? error.response.data : error;
  }
}; 