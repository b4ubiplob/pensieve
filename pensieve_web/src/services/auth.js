// Authentication service for managing JWT tokens and auth operations

const API_BASE_URL = 'http://localhost:8083/api/v1';

// In-memory storage for access token (prevents XSS attacks)
let accessToken = null;

// Token management
export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};

export const setRefreshToken = (token) => {
  localStorage.setItem('refreshToken', token);
};

export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

export const clearTokens = () => {
  accessToken = null;
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// Login with username/password
export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();

    // Store tokens and user data
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Logout
export const logout = async () => {
  try {
    const token = getAccessToken();
    if (token) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearTokens();
  }
};

// Refresh access token
export const refreshAccessToken = async () => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return false;
    }

    const data = await response.json();
    setAccessToken(data.accessToken);
    return true;
  } catch (error) {
    console.error('Token refresh error:', error);
    clearTokens();
    return false;
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error('No access token');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get current user');
    }

    const user = await response.json();
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

// Handle OAuth2 redirect
export const handleOAuth2Redirect = (token, refresh) => {
  setAccessToken(token);
  setRefreshToken(refresh);
};

// Get stored user from localStorage
export const getStoredUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Initialize session on app load
export const initializeSession = async () => {
  try {
    // If we already have an access token in memory, we're good
    if (accessToken) {
      return true;
    }

    // Try to refresh the session using stored refresh token
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    // Attempt to get a new access token
    const success = await refreshAccessToken();
    if (success) {
      // Fetch current user data
      await getCurrentUser();
      return true;
    }

    return false;
  } catch (error) {
    console.error('Session initialization error:', error);
    clearTokens();
    return false;
  }
};
