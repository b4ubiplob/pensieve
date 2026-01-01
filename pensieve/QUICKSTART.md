# Quick Start Guide - User REST API

## Prerequisites
1. PostgreSQL database running
2. Database `db_pensieve` created
3. Java 17 installed
4. Maven installed (or use the included Maven wrapper)

## Setup Steps

### 1. Create PostgreSQL Database
```sql
CREATE DATABASE db_pensieve;
GRANT ALL PRIVILEGES ON DATABASE db_pensieve TO postgres;
```

### 2. Configure Database Connection
Edit `src/main/resources/application.yml` (or `application.properties`) and update:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/db_pensieve
    username: postgres
    password: your_password
```

### 3. Build the Project
```bash
cd /Users/i320626/work/workspaces/personal/workspace_01/pensieve
./mvnw clean install
```

### 4. Run the Application
```bash
./mvnw spring-boot:run
```

The application will start on `http://localhost:8080`

---

## Quick Test

### 1. Create a User
```bash
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-user-001",
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": "test-user-001",
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User",
  "picture": null,
  "projects": []
}
```

### 2. Get All Users
```bash
curl -X GET http://localhost:8080/users
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "test-user-001",
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "picture": null,
    "projects": []
  }
]
```

### 3. Get User by ID
```bash
curl -X GET http://localhost:8080/users/test-user-001
```

### 4. Update User
```bash
curl -X PUT http://localhost:8080/users/test-user-001 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "updated@example.com",
    "password": "newpassword456",
    "name": "Updated Test User"
  }'
```

### 5. Delete User
```bash
curl -X DELETE http://localhost:8080/users/test-user-001
```

---

## Project Structure

```
pensieve/
├── src/main/java/com/tan90/projects/pensieve/
│   ├── PensieveApplication.java          # Main application class
│   ├── controller/
│   │   └── UserController.java           # REST endpoints
│   ├── service/
│   │   └── UserService.java              # Business logic
│   ├── repository/
│   │   └── UserRepository.java           # Data access layer
│   └── entity/
│       ├── User.java                      # User entity
│       ├── Project.java
│       ├── ProjectList.java
│       ├── Task.java
│       └── Attachment.java
└── src/main/resources/
    ├── application.yml                    # Configuration
    ├── META-INF/
    │   └── persistence.xml                # JPA configuration
    └── db/
        └── schema.sql                     # Database schema
```

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users |
| GET | `/users/{id}` | Get user by ID |
| GET | `/users/email/{email}` | Get user by email |
| POST | `/users` | Create new user |
| PUT | `/users/{id}` | Update user |
| DELETE | `/users/{id}` | Delete user |
| HEAD | `/users/{id}` | Check if user exists |

---

## Features Implemented

✅ **Repository Layer** (UserRepository)
- JPA Repository with custom query methods
- Find by email functionality
- Email existence check

✅ **Service Layer** (UserService)
- Business logic and validation
- Transaction management
- Duplicate email prevention
- Proper error handling

✅ **Controller Layer** (UserController)
- RESTful endpoints at `/users`
- Complete CRUD operations
- Proper HTTP status codes
- Exception handling
- CORS enabled

✅ **Entity** (User)
- JPA annotations
- Relationships to Projects
- All required fields

---

## Troubleshooting

### Port Already in Use
If port 8080 is already in use, change it in `application.yml`:
```yaml
server:
  port: 8081
```

### Database Connection Issues
- Verify PostgreSQL is running: `pg_isready`
- Check database exists: `psql -l | grep db_pensieve`
- Verify credentials in application.yml

### Tables Not Created
The `persistence.xml` is configured with `hibernate.hbm2ddl.auto=update`, which will create tables automatically on startup.

---

## Next Steps

1. Add validation annotations (@NotNull, @Email, @Size)
2. Implement password encryption (BCrypt)
3. Add Spring Security for authentication
4. Create DTOs to separate API models from entities
5. Add pagination for GET all users
6. Implement proper error response objects
7. Add API documentation with Swagger/OpenAPI
8. Write unit and integration tests

---

## Complete Documentation

For detailed API documentation, see: `API_DOCUMENTATION.md`
For database and entities documentation, see: `README_ENTITIES.md`

