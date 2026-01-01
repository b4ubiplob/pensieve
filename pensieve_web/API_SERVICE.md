# API Service Configuration

This document explains how to configure and modify the REST API endpoints in the Pensieve application.

## API Service Location

All REST API calls are abstracted in the following file:
- **File**: `src/services/api.js`

## Changing the API Base URL

To change the API endpoint (e.g., when deploying to production or using a different server), simply update the `API_BASE_URL` constant in `src/services/api.js`:

```javascript
// Change this line to point to your API server
const API_BASE_URL = 'http://localhost:8080/api/v1';

// Example for production:
// const API_BASE_URL = 'https://api.pensieve.com/v1';
// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';
```

## API Structure

The API service is organized into the following modules:

### User API (`userAPI`)
- `login(username, password)` - User login
- `register(userData)` - User registration

### Project API (`projectAPI`)
- `getProjects(userId)` - Get all projects for a user
- `createProject(userId, projectData)` - Create a new project

### List API (`listAPI`)
- `getLists(projectId)` - Get all lists for a project
- `createList(projectId, listData)` - Create a new list

### Task API (`taskAPI`)
- `getTasks(listId)` - Get all tasks for a list
- `createTask(listId, taskData)` - Create a new task

## Usage in Components

Components import and use the API service as follows:

```javascript
import { userAPI, projectAPI, listAPI, taskAPI } from '../services/api';

// Example: Login
const response = await userAPI.login(username, password);

// Example: Create project
const response = await projectAPI.createProject(userId, { name: 'My Project', description: 'Description' });

// Example: Get tasks
const response = await taskAPI.getTasks(listId);
```

## Adding New API Endpoints

To add a new API endpoint:

1. Open `src/services/api.js`
2. Add your method to the appropriate API module (or create a new one)
3. Follow the existing pattern:

```javascript
export const myAPI = {
  getItems: async (id) => {
    return apiRequest(`/items?id=${id}`);
  },

  createItem: async (data) => {
    return apiRequest('/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
```

## Benefits of This Approach

1. **Single Point of Configuration**: Change API endpoints in one place
2. **Easy Testing**: Mock the API service for testing
3. **Consistent Error Handling**: Centralize error handling logic
4. **Type Safety**: Easy to add TypeScript types if needed
5. **Maintainability**: Clear separation of concerns between UI and API logic
