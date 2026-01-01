# Username Field Implementation - Summary

## ✅ Successfully Implemented

### Changes Made

#### 1. User Entity (User.java)
**Location:** `src/main/java/com/tan90/projects/pensieve/entity/User.java`

**Added username field:**
```java
@Column(name = "username", length = 256, nullable = false)
private String username;
```

**Updated constructor:**
```java
public User(String id, String email, String username, String password, String name) {
    this.id = id;
    this.email = email;
    this.username = username;  // ← Added
    this.password = password;
    this.name = name;
}
```

**Added getter and setter:**
```java
public String getUsername() {
    return username;
}

public void setUsername(String username) {
    this.username = username;
}
```

---

#### 2. UserRepository (UserRepository.java)
**Location:** `src/main/java/com/tan90/projects/pensieve/repository/UserRepository.java`

**Added repository methods:**
```java
Optional<User> findByUsername(String username);
boolean existsByUsername(String username);
```

---

#### 3. UserService (UserService.java)
**Location:** `src/main/java/com/tan90/projects/pensieve/service/UserService.java`

**Updated maskPassword helper method:**
```java
private User maskPassword(User user) {
    if (user == null) return null;
    User masked = new User();
    masked.setId(user.getId());
    masked.setEmail(user.getEmail());
    masked.setUsername(user.getUsername());  // ← Added
    masked.setName(user.getName());
    masked.setPicture(user.getPicture());
    masked.setPassword(null);
    masked.setProjects(user.getProjects());
    return masked;
}
```

**Updated createUser method:**
```java
public User createUser(User user) {
    if (userRepository.existsByEmail(user.getEmail())) {
        throw new IllegalArgumentException("User with email " + user.getEmail() + " already exists");
    }
    
    // ← Added username uniqueness check
    if (userRepository.existsByUsername(user.getUsername())) {
        throw new IllegalArgumentException("User with username " + user.getUsername() + " already exists");
    }
    
    // ... rest of method
}
```

**Updated updateUser method:**
```java
public User updateUser(String id, User userDetails) {
    User user = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

    user.setEmail(userDetails.getEmail());
    user.setUsername(userDetails.getUsername());  // ← Added
    // ... rest of method
}
```

**Added new method:**
```java
public Optional<User> getUserByUsername(String username) {
    return userRepository.findByUsername(username)
            .map(this::maskPassword);
}
```

---

#### 4. UserController (UserController.java)
**Location:** `src/main/java/com/tan90/projects/pensieve/controller/UserController.java`

**Added new endpoint:**
```java
/**
 * GET /users/username/{username} - Get user by username
 */
@GetMapping("/username/{username}")
public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
    return userService.getUserByUsername(username)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}
```

---

## API Usage Examples

### Create User with Username

**Request:**
```bash
curl -X POST http://localhost:8080/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "username": "johndoe",
    "password": "password123",
    "name": "John Doe"
  }'
```

**Response (201 Created):**
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

### Get User by Username

**Request:**
```bash
curl -X GET http://localhost:8080/api/v1/users/username/johndoe
```

**Response (200 OK):**
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

### Update User with Username

**Request:**
```bash
curl -X PUT http://localhost:8080/api/v1/users/f47ac10b-58cc-4372-a567-0e02b2c3d479 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "username": "john_doe_updated",
    "password": "newpassword456",
    "name": "John Doe Updated"
  }'
```

---

### Validation Errors

**Duplicate Username:**
```bash
curl -X POST http://localhost:8080/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "another@example.com",
    "username": "johndoe",
    "password": "password123",
    "name": "Another User"
  }'
```

**Response (409 Conflict):**
```
User with username johndoe already exists
```

---

## Database Schema Update

You need to update your PostgreSQL database schema to include the username column:

```sql
ALTER TABLE users ADD COLUMN username VARCHAR(256) NOT NULL DEFAULT '';
```

Or if creating the table from scratch:

```sql
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(256) NOT NULL,
    username VARCHAR(256) NOT NULL,
    password VARCHAR(256) NOT NULL,
    picture BYTEA,
    name VARCHAR(256) NOT NULL
);

-- Add unique constraint on username
CREATE UNIQUE INDEX idx_users_username ON users(username);
```

---

## Updated API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users` | Get all users |
| GET | `/api/v1/users/{id}` | Get user by ID |
| GET | `/api/v1/users/email/{email}` | Get user by email |
| GET | `/api/v1/users/username/{username}` | Get user by username ← **NEW** |
| POST | `/api/v1/users` | Create new user (requires username) |
| PUT | `/api/v1/users/{id}` | Update user (can update username) |
| DELETE | `/api/v1/users/{id}` | Delete user |
| HEAD | `/api/v1/users/{id}` | Check if user exists |

---

## Features Implemented

✅ Username field added to User entity (max length 256)  
✅ Username field is NOT NULL  
✅ Username uniqueness validation in createUser  
✅ Username can be updated via updateUser  
✅ New repository method: findByUsername  
✅ New repository method: existsByUsername  
✅ New service method: getUserByUsername  
✅ New REST endpoint: GET /users/username/{username}  
✅ Password masking includes username field  
✅ All existing functionality preserved  
✅ Compilation successful  

---

## Testing Checklist

- [ ] Create user with username
- [ ] Verify username uniqueness constraint
- [ ] Get user by username
- [ ] Update user username
- [ ] Verify username appears in getAllUsers response
- [ ] Verify password is still masked (null) in responses
- [ ] Test duplicate username error handling

---

## Status

✅ **Implementation Complete**  
✅ **Compilation Successful**  
✅ **No Errors**  
✅ **Ready for Database Migration**  
✅ **Ready for Testing**  

---

**Date:** December 27, 2025  
**Files Modified:** 4 (User.java, UserService.java, UserRepository.java, UserController.java)  
**New Fields:** 1 (username)  
**New Endpoints:** 1 (GET /users/username/{username})  
**New Methods:** 3 (findByUsername, existsByUsername, getUserByUsername)

