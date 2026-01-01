# User REST API Documentation

## Base URL
```
http://localhost:8080/users
```

## Endpoints

### 1. Get All Users
**GET** `/users`

Retrieves a list of all users.

**Response:**
- Status: 200 OK
- Body: Array of User objects

**Example:**
```bash
curl -X GET http://localhost:8080/users
```

**Response Example:**
```json
[
  {
    "id": "user-123",
    "email": "john@example.com",
    "password": "hashedpassword",
    "name": "John Doe",
    "picture": null,
    "projects": []
  }
]
```

---

### 2. Get User by ID
**GET** `/users/{id}`

Retrieves a specific user by their ID.

**Parameters:**
- `id` (path) - User ID (String)

**Response:**
- Status: 200 OK - User found
- Status: 404 Not Found - User not found

**Example:**
```bash
curl -X GET http://localhost:8080/users/user-123
```

---

### 3. Get User by Email
**GET** `/users/email/{email}`

Retrieves a user by their email address.

**Parameters:**
- `email` (path) - User email (String)

**Response:**
- Status: 200 OK - User found
- Status: 404 Not Found - User not found

**Example:**
```bash
curl -X GET http://localhost:8080/users/email/john@example.com
```

---

### 4. Create New User
**POST** `/users`

Creates a new user.

**Request Body:**
```json
{
  "id": "user-123",
  "email": "john@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "picture": null
}
```

**Response:**
- Status: 201 Created - User created successfully
- Status: 409 Conflict - User with email already exists

**Example:**
```bash
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{
    "id": "user-123",
    "email": "john@example.com",
    "password": "securePassword123",
    "name": "John Doe"
  }'
```

---

### 5. Update User
**PUT** `/users/{id}`

Updates an existing user.

**Parameters:**
- `id` (path) - User ID (String)

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "newPassword123",
  "name": "John Doe Updated",
  "picture": null
}
```

**Response:**
- Status: 200 OK - User updated successfully
- Status: 404 Not Found - User not found

**Example:**
```bash
curl -X PUT http://localhost:8080/users/user-123 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "newPassword123",
    "name": "John Doe Updated"
  }'
```

---

### 6. Delete User
**DELETE** `/users/{id}`

Deletes a user by ID.

**Parameters:**
- `id` (path) - User ID (String)

**Response:**
- Status: 200 OK - User deleted successfully
- Status: 404 Not Found - User not found

**Example:**
```bash
curl -X DELETE http://localhost:8080/users/user-123
```

---

### 7. Check if User Exists
**HEAD** `/users/{id}`

Checks if a user exists without returning the user data.

**Parameters:**
- `id` (path) - User ID (String)

**Response:**
- Status: 200 OK - User exists
- Status: 404 Not Found - User does not exist

**Example:**
```bash
curl -I http://localhost:8080/users/user-123
```

---

## Error Responses

### 404 Not Found
```json
"User not found with id: user-123"
```

### 409 Conflict
```json
"User with email john@example.com already exists"
```

---

## Components Created

### 1. UserRepository
- Interface extending `JpaRepository<User, String>`
- Custom methods:
  - `findByEmail(String email)` - Find user by email
  - `existsByEmail(String email)` - Check if email exists

### 2. UserService
- Business logic layer
- Methods:
  - `getAllUsers()` - Get all users
  - `getUserById(String id)` - Get user by ID
  - `getUserByEmail(String email)` - Get user by email
  - `createUser(User user)` - Create new user
  - `updateUser(String id, User userDetails)` - Update user
  - `deleteUser(String id)` - Delete user
  - `existsById(String id)` - Check if user exists

### 3. UserController
- REST API endpoints at `/users`
- CRUD operations fully implemented
- Proper HTTP status codes
- Exception handling

---

## Testing with cURL

### Create a user
```bash
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{
    "id": "user-001",
    "email": "alice@example.com",
    "password": "password123",
    "name": "Alice Smith"
  }'
```

### Get all users
```bash
curl -X GET http://localhost:8080/users
```

### Get user by ID
```bash
curl -X GET http://localhost:8080/users/user-001
```

### Update user
```bash
curl -X PUT http://localhost:8080/users/user-001 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice.smith@example.com",
    "password": "newpassword456",
    "name": "Alice Johnson"
  }'
```

### Delete user
```bash
curl -X DELETE http://localhost:8080/users/user-001
```

---

## Running the Application

### Start the Spring Boot application:
```bash
./mvnw spring-boot:run
```

The API will be available at `http://localhost:8080/users`

---

## Notes

1. **Password Security**: In production, passwords should be hashed using BCrypt or similar before storing
2. **Validation**: Consider adding `@Valid` annotation and validation constraints to User entity
3. **DTOs**: Consider using Data Transfer Objects to separate API models from entities
4. **Authentication**: Add Spring Security for authentication and authorization
5. **CORS**: Currently set to allow all origins (`*`) - configure appropriately for production
6. **Picture Upload**: For binary data (pictures), consider using multipart/form-data instead of JSON

