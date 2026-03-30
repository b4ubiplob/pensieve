# Pensieve API Documentation

## Base URL
```
http://localhost:8080/api/v1
```

## Authentication

The API uses JWT (JSON Web Token) for authentication. After logging in, include the access token in the Authorization header for protected endpoints:

```
Authorization: Bearer <access_token>
```

---

## Authentication Endpoints

### 1. Login
Authenticate a user and receive JWT tokens.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "username": "string",  // username or email
  "password": "string"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 3600,
  "user": {
    "id": "string",
    "email": "string",
    "username": "string",
    "name": "string",
    "picture": "string",
    "provider": "string",
    "pictureUrl": "string"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials

---

### 2. Refresh Token
Get a new access token using a refresh token.

**Endpoint:** `POST /auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "string",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid refresh token

---

### 3. Logout
Clear the authentication context.

**Endpoint:** `POST /auth/logout`

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

### 4. Get Current User
Get the currently authenticated user's information.

**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": "string",
  "email": "string",
  "username": "string",
  "name": "string",
  "picture": "string",
  "provider": "string",
  "pictureUrl": "string"
}
```

**Error Responses:**
- `401 Unauthorized` - Not authenticated

---

## User Endpoints

### 1. Get All Users
Retrieve all users.

**Endpoint:** `GET /users`

**Response (200 OK):**
```json
[
  {
    "id": "string",
    "email": "string",
    "username": "string",
    "name": "string",
    "password": "string",
    "picture": "string",
    "provider": "string",
    "pictureUrl": "string",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

---

### 2. Get User by ID
Retrieve a specific user by ID.

**Endpoint:** `GET /users/{id}`

**Response (200 OK):**
```json
{
  "id": "string",
  "email": "string",
  "username": "string",
  "name": "string",
  "picture": "string",
  "provider": "string",
  "pictureUrl": "string"
}
```

**Error Responses:**
- `404 Not Found` - User not found

---

### 3. Get User by Email
Retrieve a user by email address.

**Endpoint:** `GET /users/email/{email}`

**Response (200 OK):**
```json
{
  "id": "string",
  "email": "string",
  "username": "string",
  "name": "string"
}
```

**Error Responses:**
- `404 Not Found` - User not found

---

### 4. Get User by Username
Retrieve a user by username.

**Endpoint:** `GET /users/username/{username}`

**Response (200 OK):**
```json
{
  "id": "string",
  "email": "string",
  "username": "string",
  "name": "string"
}
```

**Error Responses:**
- `404 Not Found` - User not found

---

### 5. Create User
Create a new user account.

**Endpoint:** `POST /users`

**Request Body:**
```json
{
  "email": "string",
  "username": "string",
  "password": "string",
  "name": "string",
  "picture": "string",
  "provider": "string"
}
```

**Response (201 Created):**
```json
{
  "id": "string",
  "email": "string",
  "username": "string",
  "name": "string",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Error Responses:**
- `409 Conflict` - User already exists

---

### 6. Update User
Update an existing user.

**Endpoint:** `PUT /users/{id}`

**Request Body:**
```json
{
  "email": "string",
  "username": "string",
  "name": "string",
  "picture": "string"
}
```

**Response (200 OK):**
```json
{
  "id": "string",
  "email": "string",
  "username": "string",
  "name": "string"
}
```

**Error Responses:**
- `404 Not Found` - User not found

---

### 7. Delete User
Delete a user account.

**Endpoint:** `DELETE /users/{id}`

**Response (200 OK):**
```json
"User deleted successfully"
```

**Error Responses:**
- `404 Not Found` - User not found

---

### 8. Check User Exists
Check if a user exists by ID.

**Endpoint:** `HEAD /users/{id}`

**Response:**
- `200 OK` - User exists
- `404 Not Found` - User does not exist

---

## Project Endpoints

### 1. Get Projects by User
Retrieve all projects for a specific user.

**Endpoint:** `GET /projects?userId={userId}`

**Query Parameters:**
- `userId` (required) - The user ID

**Response (200 OK):**
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "userId": "string",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

---

### 2. Get Project by ID
Retrieve a specific project by ID.

**Endpoint:** `GET /projects/{id}`

**Response (200 OK):**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "userId": "string",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Error Responses:**
- `404 Not Found` - Project not found

---

### 3. Create Project
Create a new project for a user.

**Endpoint:** `POST /projects?userId={userId}`

**Query Parameters:**
- `userId` (required) - The user ID

**Request Body:**
```json
{
  "name": "string",
  "description": "string"
}
```

**Response (201 Created):**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "userId": "string",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid request data

---

### 4. Update Project
Update an existing project.

**Endpoint:** `PUT /projects/{id}`

**Request Body:**
```json
{
  "name": "string",
  "description": "string"
}
```

**Response (200 OK):**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "userId": "string"
}
```

**Error Responses:**
- `404 Not Found` - Project not found

---

### 5. Delete Project
Delete a project.

**Endpoint:** `DELETE /projects/{id}`

**Response:**
- `204 No Content` - Project deleted successfully

**Error Responses:**
- `404 Not Found` - Project not found

---

## List Endpoints

Lists are containers for tasks within a project.

### 1. Get Lists by Project
Retrieve all lists for a specific project.

**Endpoint:** `GET /lists?projectId={projectId}`

**Query Parameters:**
- `projectId` (required) - The project ID

**Response (200 OK):**
```json
[
  {
    "id": "string",
    "name": "string",
    "projectId": "string",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

---

### 2. Get List by ID
Retrieve a specific list by ID.

**Endpoint:** `GET /lists/{id}`

**Response (200 OK):**
```json
{
  "id": "string",
  "name": "string",
  "projectId": "string",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Error Responses:**
- `404 Not Found` - List not found

---

### 3. Create List
Create a new list within a project.

**Endpoint:** `POST /lists?projectId={projectId}`

**Query Parameters:**
- `projectId` (required) - The project ID

**Request Body:**
```json
{
  "name": "string"
}
```

**Response (201 Created):**
```json
{
  "id": "string",
  "name": "string",
  "projectId": "string",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid request data

---

### 4. Update List
Update an existing list.

**Endpoint:** `PUT /lists/{id}`

**Request Body:**
```json
{
  "name": "string"
}
```

**Response (200 OK):**
```json
{
  "id": "string",
  "name": "string",
  "projectId": "string"
}
```

**Error Responses:**
- `404 Not Found` - List not found

---

### 5. Delete List
Delete a list.

**Endpoint:** `DELETE /lists/{id}`

**Response:**
- `204 No Content` - List deleted successfully

**Error Responses:**
- `404 Not Found` - List not found

---

## Task Endpoints

### 1. Get Tasks
Retrieve tasks by list or by user and status.

**Endpoint:** `GET /tasks`

**Query Parameters (Option 1 - By List):**
- `listId` (required) - The list ID

**Query Parameters (Option 2 - By User and Status):**
- `userId` (required) - The user ID
- `status` (required) - Task status: `CREATED`, `IN_PROGRESS`, `BLOCKED`, or `COMPLETED`

**Response (200 OK) - By List:**
```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "status": "CREATED",
    "priority": "MEDIUM",
    "dueDate": "2024-01-01",
    "listId": "string",
    "parentTaskId": "string",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

**Response (200 OK) - By User and Status:**
```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "dueDate": "2024-01-01",
    "projectName": "string",
    "listName": "string"
  }
]
```

**Error Responses:**
- `400 Bad Request` - Missing required parameters or invalid status

---

### 2. Get Task by ID
Retrieve a specific task by ID with its child tasks (subtasks).

**Endpoint:** `GET /tasks/{id}`

**Response (200 OK):**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "status": "CREATED",
  "priority": "MEDIUM",
  "dueDate": "2024-01-01",
  "listId": "string",
  "parentTaskId": "string",
  "childTasks": [
    {
      "id": "string",
      "title": "string",
      "status": "CREATED"
    }
  ],
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Error Responses:**
- `404 Not Found` - Task not found

---

### 3. Create Task
Create a new task within a list or as a subtask.

**Endpoint:** `POST /tasks`

**Query Parameters (Option 1 - Create Task in List):**
- `listId` (required) - The list ID

**Query Parameters (Option 2 - Create Subtask):**
- `parentTaskId` (required) - The parent task ID

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "status": "CREATED",
  "priority": "MEDIUM",
  "dueDate": "2024-01-01"
}
```

**Task Status Values:**
- `CREATED` - To Do
- `IN_PROGRESS` - In Progress
- `BLOCKED` - Blocked
- `COMPLETED` - Done

**Task Priority Values:**
- `LOW`
- `MEDIUM`
- `HIGH`
- `VERY_HIGH`

**Response (201 Created):**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "status": "CREATED",
  "priority": "MEDIUM",
  "dueDate": "2024-01-01",
  "listId": "string",
  "parentTaskId": "string",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Missing required parameters or invalid data

---

### 4. Update Task
Update an existing task.

**Endpoint:** `PUT /tasks/{id}`

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "dueDate": "2024-01-01"
}
```

**Response (200 OK):**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "dueDate": "2024-01-01"
}
```

**Error Responses:**
- `404 Not Found` - Task not found

---

### 5. Delete Task
Delete a task and all its child tasks (subtasks).

**Endpoint:** `DELETE /tasks/{id}`

**Response:**
- `204 No Content` - Task deleted successfully

**Error Responses:**
- `404 Not Found` - Task not found

---

## Data Models

### User
```json
{
  "id": "string",
  "email": "string",
  "username": "string",
  "name": "string",
  "password": "string",
  "picture": "string",
  "provider": "string",
  "pictureUrl": "string",
  "createdAt": "timestamp"
}
```

### Project
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "userId": "string",
  "createdAt": "timestamp"
}
```

### List (ProjectList)
```json
{
  "id": "string",
  "name": "string",
  "projectId": "string",
  "createdAt": "timestamp"
}
```

### Task
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "status": "enum[CREATED, IN_PROGRESS, BLOCKED, COMPLETED]",
  "priority": "enum[LOW, MEDIUM, HIGH, VERY_HIGH]",
  "dueDate": "date",
  "listId": "string",
  "parentTaskId": "string",
  "childTasks": "array",
  "createdAt": "timestamp"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request data"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 409 Conflict
```json
{
  "error": "Resource already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Notes

1. **CORS**: All endpoints support CORS with origin `http://localhost:5173` (development frontend) or `*` for most endpoints.

2. **Authentication**: Most endpoints require JWT authentication. Include the access token in the Authorization header.

3. **Date Format**: Dates are in ISO 8601 format (e.g., `2024-01-01T00:00:00Z`).

4. **Hierarchical Tasks**: Tasks support parent-child relationships for creating subtasks.

5. **Password Migration**: The system supports automatic migration from MD5 to bcrypt password hashing on login.

6. **OAuth Support**: The system supports OAuth authentication via Google (indicated by the `provider` field).
