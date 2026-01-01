# Pensieve - JPA Entities and Persistence Configuration

## Overview
This project contains JPA entities and persistence configuration for the Pensieve database schema.

## Database Schema
The database uses PostgreSQL with schema name `db_pensieve`.

### Tables
1. **users** - User information
2. **projects** - Projects owned by users
3. **list** - Lists within projects
4. **task** - Tasks within lists (supports parent-child hierarchy)
5. **attachment** - File attachments for tasks

## Created Files

### Entity Classes (src/main/java/com/tan90/projects/pensieve/entity/)
- `User.java` - User entity
- `Project.java` - Project entity
- `ProjectList.java` - List entity (renamed from 'list' to avoid Java keyword conflict)
- `Task.java` - Task entity with self-referencing parent-child relationship
- `Attachment.java` - Attachment entity

### Configuration Files
- `src/main/resources/META-INF/persistence.xml` - JPA persistence unit configuration
- `src/main/resources/application.yml` - Spring Boot database configuration
- `src/main/resources/db/schema.sql` - PostgreSQL database schema creation script

### Dependencies Added
- PostgreSQL JDBC Driver (added to pom.xml)

## Entity Relationships

```
User (1) -----> (*) Project
Project (1) -----> (*) ProjectList
ProjectList (1) -----> (*) Task
Task (1) -----> (*) Task (self-referencing for sub-tasks)
Task (1) -----> (*) Attachment
```

## Configuration

### Database Connection (application.yml)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/pensieve_db
    username: postgres
    password: postgres
```

Update these values according to your PostgreSQL setup.

### Persistence Unit (persistence.xml)
- Persistence unit name: `pensievePU`
- Hibernate dialect: PostgreSQL
- Default schema: `db_pensieve`
- DDL auto: validate (set to `update` or `create` if needed)

## Database Setup

### Create the Database Schema
Run the SQL script to create the database schema:

```bash
psql -U postgres -d pensieve_db -f src/main/resources/db/schema.sql
```

Or use any PostgreSQL client to execute the `schema.sql` file.

### Database Creation
First create the database if it doesn't exist:

```sql
CREATE DATABASE pensieve_db;
```

## Features

### Entity Features
- All entities use String IDs (VARCHAR 64)
- Date fields use `LocalDateTime` (maps to TIMESTAMP in PostgreSQL)
- Binary data (pictures, attachments) use `byte[]` with `@Lob` annotation
- Lazy loading for relationships to optimize performance
- Bidirectional relationships properly mapped

### Schema Features
- Foreign key constraints
- Indexes on foreign keys for query optimization
- Indexes on frequently queried date fields
- Self-referencing foreign key for task parent-child relationship

## Usage Example

```java
@Autowired
private EntityManager entityManager;

// Create a new user
User user = new User();
user.setId("user-123");
user.setEmail("user@example.com");
user.setPassword("hashedPassword");
user.setName("John Doe");
entityManager.persist(user);

// Create a project
Project project = new Project();
project.setId("project-123");
project.setName("My Project");
project.setDescription("Project description");
project.setCreatedDate(LocalDateTime.now());
project.setUser(user);
entityManager.persist(project);
```

## Build and Test

### Compile
```bash
./mvnw clean compile
```

### Run Tests
```bash
./mvnw test
```

### Run Application
```bash
./mvnw spring-boot:run
```

## Notes

1. Make sure PostgreSQL is running before starting the application
2. Update database credentials in `application.yml`
3. The `hibernate.hbm2ddl.auto` is set to `validate` - change to `update` or `create` if you want Hibernate to manage schema
4. Entity IDs are manually assigned (not auto-generated) - implement ID generation strategy as needed
5. Consider adding `@JsonIgnore` on bidirectional relationships to avoid serialization issues
6. Add proper validation annotations (e.g., `@NotNull`, `@Size`) as needed

