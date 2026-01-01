# User Login Endpoint - Documentation

## ✅ Successfully Implemented

### Endpoint Details

**URL:** `POST /api/v1/users/login`  
**Purpose:** Authenticate a user with username and password  
**Content-Type:** `application/json`

---

## Request

### Request Body
```json
{
  "username": "johndoe",
  "password": "password123"
}
```

**Fields:**
- `username` (String, required) - The user's username
- `password` (String, required) - The user's plain text password

**Note:** Only username and password fields are needed. Other fields in the User object are ignored.

---

## Response

### Success Response (200 OK)

**Status Code:** `200 OK`

**Response Body:**
```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "email": "john@example.com",
  "username": "johndoe",
  "password": null,
  "name": "John Doe",
  "picture": null,
  "projects": []
}
```

**Note:** The password field is always `null` in the response for security.

---

### Error Responses

#### 1. Invalid Credentials (401 Unauthorized)

**Status Code:** `401 UNAUTHORIZED`

**Response Body:**
```
Invalid username or password
```

**When it occurs:**
- Username doesn't exist in the database
- Password doesn't match the stored hashed password

---

#### 2. Missing Fields (400 Bad Request)

**Status Code:** `400 BAD_REQUEST`

**Response Body:**
```
Username and password are required
```

**When it occurs:**
- Username is null or empty
- Password is null or empty

---

## cURL Examples

### Successful Login
```bash
curl -X POST http://localhost:8080/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "email": "john@example.com",
  "username": "johndoe",
  "password": null,
  "name": "John Doe",
  "picture": null,
  "projects": []
}
```

---

### Invalid Username
```bash
curl -X POST http://localhost:8080/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "nonexistent",
    "password": "password123"
  }'
```

**Response (401):**
```
Invalid username or password
```

---

### Invalid Password
```bash
curl -X POST http://localhost:8080/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "wrongpassword"
  }'
```

**Response (401):**
```
Invalid username or password
```

---

### Missing Fields
```bash
curl -X POST http://localhost:8080/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe"
  }'
```

**Response (400):**
```
Username and password are required
```

---

## Implementation Details

### UserService.authenticateUser()

**Method Signature:**
```java
public Optional<User> authenticateUser(String username, String password)
```

**Logic:**
1. Find user by username in the database
2. If user exists:
   - Hash the provided password using MD5
   - Compare hashed password with stored password
   - If match: Return user with password masked (set to null)
   - If no match: Return empty Optional
3. If user doesn't exist: Return empty Optional

**Code:**
```java
public Optional<User> authenticateUser(String username, String password) {
    Optional<User> userOpt = userRepository.findByUsername(username);
    
    if (userOpt.isPresent()) {
        User user = userOpt.get();
        String hashedPassword = hashPasswordMD5(password);
        
        // Compare hashed password with stored password
        if (user.getPassword() != null && user.getPassword().equals(hashedPassword)) {
            return Optional.of(maskPassword(user));
        }
    }
    
    return Optional.empty();
}
```

---

### UserController.loginUser()

**Method Signature:**
```java
@PostMapping("/login")
public ResponseEntity<?> loginUser(@RequestBody User loginRequest)
```

**Logic:**
1. Extract username and password from request body
2. Validate both fields are present and not empty
   - If missing: Return 400 BAD_REQUEST
3. Call `userService.authenticateUser(username, password)`
4. If authentication successful: Return 200 OK with user object
5. If authentication failed: Return 401 UNAUTHORIZED

**Code:**
```java
@PostMapping("/login")
public ResponseEntity<?> loginUser(@RequestBody User loginRequest) {
    String username = loginRequest.getUsername();
    String password = loginRequest.getPassword();
    
    if (username == null || username.isEmpty() || password == null || password.isEmpty()) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username and password are required");
    }
    
    Optional<User> authenticatedUser = userService.authenticateUser(username, password);
    
    if (authenticatedUser.isPresent()) {
        return ResponseEntity.ok(authenticatedUser.get());
    } else {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
    }
}
```

---

## Security Features

✅ **Password Hashing:** Passwords are hashed with MD5 before comparison  
✅ **Password Masking:** Password is always null in response  
✅ **No Information Leak:** Same error message for invalid username or password  
✅ **Input Validation:** Checks for empty/null username and password  

---

## Testing Workflow

### 1. Create a Test User
```bash
curl -X POST http://localhost:8080/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "testpass123",
    "name": "Test User"
  }'
```

### 2. Login with Created User
```bash
curl -X POST http://localhost:8080/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123"
  }'
```

### 3. Test Invalid Credentials
```bash
curl -X POST http://localhost:8080/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "wrongpassword"
  }'
```

Expected: 401 Unauthorized

---

## JavaScript/Fetch Example

```javascript
async function loginUser(username, password) {
    try {
        const response = await fetch('http://localhost:8080/api/v1/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        if (response.ok) {
            const user = await response.json();
            console.log('Login successful:', user);
            return user;
        } else if (response.status === 401) {
            const errorMsg = await response.text();
            console.error('Authentication failed:', errorMsg);
            throw new Error('Invalid credentials');
        } else if (response.status === 400) {
            const errorMsg = await response.text();
            console.error('Bad request:', errorMsg);
            throw new Error('Username and password required');
        }
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// Usage
loginUser('johndoe', 'password123')
    .then(user => {
        console.log('Logged in as:', user.name);
    })
    .catch(error => {
        console.error('Failed to login:', error.message);
    });
```

---

## Updated API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users` | Get all users |
| GET | `/api/v1/users/{id}` | Get user by ID |
| GET | `/api/v1/users/email/{email}` | Get user by email |
| GET | `/api/v1/users/username/{username}` | Get user by username |
| POST | `/api/v1/users` | Create new user |
| **POST** | **`/api/v1/users/login`** | **Authenticate user** ← **NEW** |
| PUT | `/api/v1/users/{id}` | Update user |
| DELETE | `/api/v1/users/{id}` | Delete user |
| HEAD | `/api/v1/users/{id}` | Check if user exists |

---

## Status

✅ **Implementation Complete**  
✅ **Compilation Successful (BUILD SUCCESS)**  
✅ **No Errors**  
✅ **Ready for Testing**  

---

**Date:** December 27, 2025  
**Endpoint:** `POST /api/v1/users/login`  
**Files Modified:** 2 (UserController.java, UserService.java)  
**New Method:** `authenticateUser(username, password)`

