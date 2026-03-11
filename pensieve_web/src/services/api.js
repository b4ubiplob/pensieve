// API Configuration
const API_BASE_URL = 'http://localhost:8080/api/v1';

// Import auth functions
import { getAccessToken, refreshAccessToken, clearTokens } from './auth.js';

// Helper function for making HTTP requests with JWT
const apiRequest = async (endpoint, options = {}) => {
  const token = getAccessToken();
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  let response = await fetch(url, config);

  // Auto-refresh on 401 Unauthorized
  if (response.status === 401 && !options._retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry the request with new token
      options._retry = true;
      return apiRequest(endpoint, options);
    } else {
      // Refresh failed, clear tokens and redirect to login
      clearTokens();
      window.location.href = '/login';
    }
  }

  return response;
};

// User API
export const userAPI = {
  login: async (username, password) => {
    return apiRequest('/users/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  register: async (userData) => {
    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};

// Project API
export const projectAPI = {
  getProjects: async (userId) => {
    return apiRequest(`/projects?userId=${userId}`);
  },

  createProject: async (userId, projectData) => {
    return apiRequest(`/projects?userId=${userId}`, {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },
};

// List API
export const listAPI = {
  getLists: async (projectId) => {
    return apiRequest(`/lists?projectId=${projectId}`);
  },

  createList: async (projectId, listData) => {
    return apiRequest(`/lists?projectId=${projectId}`, {
      method: 'POST',
      body: JSON.stringify(listData),
    });
  },

  updateList: async (listId, listData) => {
    return apiRequest(`/lists/${listId}`, {
      method: 'PUT',
      body: JSON.stringify(listData),
    });
  },

  deleteList: async (listId) => {
    return apiRequest(`/lists/${listId}`, {
      method: 'DELETE',
    });
  },
};

// Task API
export const taskAPI = {
  getTasks: async (listId) => {
    return apiRequest(`/tasks?listId=${listId}`);
  },

  createTask: async (listId, taskData) => {
    return apiRequest(`/tasks?listId=${listId}`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  updateTask: async (taskId, taskData) => {
    return apiRequest(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  },

  deleteTask: async (taskId) => {
    return apiRequest(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },
};

// Export API_BASE_URL for configuration purposes
export { API_BASE_URL };
