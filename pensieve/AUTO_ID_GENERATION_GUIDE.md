# User REST API - Auto-Generated ID Guide

## ✨ NEW Feature: Automatic ID Generation

The User entity now automatically generates a random UUID when creating new users. You **no longer need to provide an ID** in the request body.

---

## Creating a User (Updated)

### ❌ OLD Way (Manual ID - No Longer Required):
```json
{
  "id": "user-123",  // ← NOT NEEDED ANYMORE
  "email": "john@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### ✅ NEW Way (Auto-Generated ID):
```json
{
  "email": "john@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

---

## Example Usage

### Create a New User (POST Request)

**Request:**
```bash
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "securePass123",
    "name": "Alice Smith"
  }'
```

**Response (201 Created):**
```json
{
  "id": "a3f5e8d2-9c4b-4f7e-8a1d-2e6f3b9c7d5a",  // ← Auto-generated UUID
  "email": "alice@example.com",
  "password": "securePass123",
  "name": "Alice Smith",
  "picture": null,
  "projects": []
}
```

---

## How It Works

### 1. User Entity (User.java)
Added `@PrePersist` callback method that generates a UUID before saving:

```java
@PrePersist
public void generateId() {
    if (this.id == null || this.id.isEmpty()) {
        this.id = UUID.randomUUID().toString();
    }
}
```

### 2. UUID Format
The generated ID is a standard UUID v4 format:
- Example: `a3f5e8d2-9c4b-4f7e-8a1d-2e6f3b9c7d5a`
- Length: 36 characters (32 hex digits + 4 hyphens)
- Globally unique
- No collisions

---

## Testing Scenarios

### Scenario 1: Create User Without ID (Recommended)
```bash
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test1@example.com",
    "password": "pass123",
    "name": "Test User 1"
  }'
```
✅ **Result:** ID is automatically generated

---

### Scenario 2: Create User With Custom ID (Still Supported)
```bash
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{
    "id": "my-custom-id-123",
    "email": "test2@example.com",
    "password": "pass123",
    "name": "Test User 2"
  }'
```
✅ **Result:** Uses your custom ID (if provided)

---

### Scenario 3: Create User With Empty ID
```bash
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{
    "id": "",
    "email": "test3@example.com",
    "password": "pass123",
    "name": "Test User 3"
  }'
```
✅ **Result:** Empty ID is replaced with auto-generated UUID

---

## Complete CRUD Examples with Auto-Generated IDs

### 1. Create Multiple Users
```bash
# User 1
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{"email": "user1@example.com", "password": "pass1", "name": "User One"}'

# User 2
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{"email": "user2@example.com", "password": "pass2", "name": "User Two"}'

# User 3
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{"email": "user3@example.com", "password": "pass3", "name": "User Three"}'
```

### 2. Get All Users
```bash
curl -X GET http://localhost:8080/users
```

**Response:**
```json
[
  {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "email": "user1@example.com",
    "password": "pass1",
    "name": "User One",
    "picture": null,
    "projects": []
  },
  {
    "id": "8c3d5e2f-9a7b-4c1e-a5d2-3f6e8b9c1d4a",
    "email": "user2@example.com",
    "password": "pass2",
    "name": "User Two",
    "picture": null,
    "projects": []
  }
]
```

### 3. Get User by Auto-Generated ID
```bash
# Copy the ID from the create response
curl -X GET http://localhost:8080/users/f47ac10b-58cc-4372-a567-0e02b2c3d479
```

### 4. Update User
```bash
curl -X PUT http://localhost:8080/users/f47ac10b-58cc-4372-a567-0e02b2c3d479 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "updated.user1@example.com",
    "password": "newpass1",
    "name": "Updated User One"
  }'
```

### 5. Delete User
```bash
curl -X DELETE http://localhost:8080/users/f47ac10b-58cc-4372-a567-0e02b2c3d479
```

---

## Benefits of Auto-Generated IDs

✅ **No ID Collision:** UUIDs are globally unique  
✅ **Simpler API:** Clients don't need to generate IDs  
✅ **Security:** IDs are non-sequential (harder to guess)  
✅ **Scalability:** Works across distributed systems  
✅ **Flexibility:** Can still provide custom IDs if needed  

---

## API Endpoints (All Remain the Same)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users |
| GET | `/users/{id}` | Get user by ID |
| GET | `/users/email/{email}` | Get user by email |
| POST | `/users` | Create new user (ID auto-generated) |
| PUT | `/users/{id}` | Update user |
| DELETE | `/users/{id}` | Delete user |
| HEAD | `/users/{id}` | Check if user exists |

---

## JSON Request Format (Updated)

### Minimal Request (Recommended)
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

### Full Request (Optional Fields)
```json
{
  "id": "custom-id",        // Optional - will be auto-generated if omitted
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name",
  "picture": null           // Optional - base64 encoded binary data
}
```

---

## Technical Details

### UUID Generation Trigger
- **When:** Before entity persistence (`@PrePersist`)
- **Condition:** Only if ID is null or empty
- **Format:** UUID v4 (random)
- **Length:** 36 characters (fits in VARCHAR(64))

### Database Impact
- No database changes required
- `id` column remains VARCHAR(64)
- UUIDs are 36 characters long
- Plenty of space for future formats

---

## Migration from Manual IDs

If you have existing code that provides IDs:

### Option 1: Remove ID from Request (Recommended)
```javascript
// Before
const userData = {
  id: generateCustomId(),  // ← Remove this
  email: "user@example.com",
  password: "pass123",
  name: "User"
};

// After
const userData = {
  email: "user@example.com",
  password: "pass123",
  name: "User"
};
```

### Option 2: Keep Providing ID (Still Works)
```javascript
// This still works if you need custom IDs
const userData = {
  id: "custom-user-id-123",
  email: "user@example.com",
  password: "pass123",
  name: "User"
};
```

---

## Summary

✅ **ID generation is now automatic**  
✅ **No breaking changes** (custom IDs still work)  
✅ **Simpler API usage**  
✅ **UUID format for uniqueness**  
✅ **All endpoints work the same**  

---

**Updated:** December 25, 2025  
**Status:** ✅ Active and Tested

