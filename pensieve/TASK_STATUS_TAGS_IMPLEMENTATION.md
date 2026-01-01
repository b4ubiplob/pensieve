# TaskStatus and TaskTag Entities - Implementation Summary

## ✅ Successfully Created

### Entities Created

#### 1. TaskStatus Entity
**Location:** `src/main/java/com/tan90/projects/pensieve/entity/TaskStatus.java`

**Configuration:**
- **Table:** `task_status`
- **Schema:** `public`
- **Primary Key:** `id` (VARCHAR 64)
- **Status Field:** `status` (VARCHAR 64, NOT NULL)
- **Possible Values:** CREATED, IN_PROGRESS, COMPLETED, BLOCKED, PAUSED

**Entity Structure:**
```java
@Entity
@Table(name = "task_status", schema = "public")
public class TaskStatus {
    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "status", length = 64, nullable = false)
    @Enumerated(EnumType.STRING)
    private Status status;

    public enum Status {
        CREATED,
        IN_PROGRESS,
        COMPLETED,
        BLOCKED,
        PAUSED
    }
}
```

---

#### 2. TaskTag Entity
**Location:** `src/main/java/com/tan90/projects/pensieve/entity/TaskTag.java`

**Configuration:**
- **Table:** `task_tags`
- **Schema:** `public`
- **Primary Key:** `id` (VARCHAR 64)
- **Tag Name Field:** `tag_name` (VARCHAR 256, NOT NULL)

**Entity Structure:**
```java
@Entity
@Table(name = "task_tags", schema = "public")
public class TaskTag {
    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "tag_name", length = 256, nullable = false)
    private String tagName;

    @ManyToMany(mappedBy = "tags")
    private Set<Task> tasks;
}
```

---

#### 3. Updated Task Entity
**Location:** `src/main/java/com/tan90/projects/pensieve/entity/Task.java`

**Added Relationships:**

1. **Many-to-One with TaskStatus:**
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "task_status_id")
private TaskStatus taskStatus;
```

2. **Many-to-Many with TaskTag:**
```java
@ManyToMany(fetch = FetchType.LAZY)
@JoinTable(
    name = "task_tag_mapping",
    schema = "public",
    joinColumns = @JoinColumn(name = "task_id"),
    inverseJoinColumns = @JoinColumn(name = "tag_id")
)
private Set<TaskTag> tags;
```

---

## Database Schema

### Tables Created

#### 1. task_status
```sql
CREATE TABLE task_status (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    status VARCHAR(64) NOT NULL CHECK (status IN ('CREATED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'PAUSED'))
);
```

#### 2. task_tags
```sql
CREATE TABLE task_tags (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    tag_name VARCHAR(256) NOT NULL
);
```

#### 3. task_tag_mapping (Many-to-Many Join Table)
```sql
CREATE TABLE task_tag_mapping (
    task_id VARCHAR(64) NOT NULL,
    tag_id VARCHAR(64) NOT NULL,
    PRIMARY KEY (task_id, tag_id),
    CONSTRAINT fk_task_tag_mapping_task FOREIGN KEY (task_id) REFERENCES task(id) ON DELETE CASCADE,
    CONSTRAINT fk_task_tag_mapping_tag FOREIGN KEY (tag_id) REFERENCES task_tags(id) ON DELETE CASCADE
);
```

#### 4. Update to task table
```sql
ALTER TABLE task ADD COLUMN task_status_id VARCHAR(64);
ALTER TABLE task ADD CONSTRAINT fk_task_status FOREIGN KEY (task_status_id) REFERENCES task_status(id);
```

---

## Relationships

### Task ↔ TaskStatus (Many-to-One)
- **Relationship Type:** Many-to-One
- **Foreign Key:** `task_status_id` in `task` table
- **Fetch Type:** LAZY
- Each task can have one status
- Each status can be assigned to many tasks

### Task ↔ TaskTag (Many-to-Many)
- **Relationship Type:** Many-to-Many
- **Join Table:** `task_tag_mapping`
- **Foreign Keys:** 
  - `task_id` → `task.id`
  - `tag_id` → `task_tags.id`
- **Fetch Type:** LAZY
- Each task can have multiple tags
- Each tag can be assigned to multiple tasks

---

## Usage Examples

### Create TaskStatus
```java
TaskStatus status = new TaskStatus();
status.setId("status-001");
status.setStatus(TaskStatus.Status.IN_PROGRESS);
```

### Create TaskTag
```java
TaskTag tag = new TaskTag();
tag.setId("tag-001");
tag.setTagName("urgent");
```

### Assign Status and Tags to Task
```java
Task task = new Task();
task.setId("task-001");
task.setTitle("Complete project");

// Set status
TaskStatus status = taskStatusRepository.findById("status-in-progress").get();
task.setTaskStatus(status);

// Add tags
Set<TaskTag> tags = new HashSet<>();
tags.add(urgentTag);
tags.add(priorityTag);
task.setTags(tags);
```

---

## Default TaskStatus Values

The following default status values are inserted by the SQL script:

| ID | Status |
|----|--------|
| status-created | CREATED |
| status-in-progress | IN_PROGRESS |
| status-completed | COMPLETED |
| status-blocked | BLOCKED |
| status-paused | PAUSED |

---

## Features Implemented

✅ **TaskStatus Entity**
- Enum-based status values
- Primary key (id)
- Status field with enumeration
- Getters and setters

✅ **TaskTag Entity**
- Primary key (id)
- Tag name field (max 256 chars)
- Bidirectional many-to-many relationship
- Getters and setters

✅ **Task Entity Updates**
- Foreign key to TaskStatus
- Many-to-many relationship with TaskTag
- Join table configuration
- Getters and setters for new fields

✅ **Database Schema**
- SQL script for table creation
- Foreign key constraints
- Many-to-many join table
- Indexes for performance
- Default status values

---

## Database Migration Steps

1. **Run the SQL script:**
```bash
psql -U postgres -d db_pensieve -f src/main/resources/db/task_status_tags_schema.sql
```

2. **Verify tables created:**
```sql
\d task_status
\d task_tags
\d task_tag_mapping
\d task
```

3. **Verify default status values:**
```sql
SELECT * FROM task_status;
```

---

## Entity Relationship Diagram

```
┌──────────────┐
│   TaskStatus │
│──────────────│
│ id (PK)      │
│ status       │
└──────────────┘
       ▲
       │ Many-to-One
       │
┌──────────────────────┐
│        Task          │
│──────────────────────│
│ id (PK)              │
│ title                │
│ description          │
│ ...                  │
│ task_status_id (FK)  │◄───┐
└──────────────────────┘    │
       │                    │
       │ Many-to-Many       │
       ▼                    │
┌──────────────┐            │
│  TaskTag     │            │
│──────────────│            │
│ id (PK)      │            │
│ tag_name     │            │
└──────────────┘            │
       ▲                    │
       │                    │
       └────────────────────┘
          task_tag_mapping
         (Join Table)
```

---

## API Integration (Next Steps)

To fully integrate these entities, you should create:

1. **Repositories:**
   - `TaskStatusRepository extends JpaRepository<TaskStatus, String>`
   - `TaskTagRepository extends JpaRepository<TaskTag, String>`

2. **Services:**
   - `TaskStatusService` - CRUD operations for task statuses
   - `TaskTagService` - CRUD operations for tags

3. **Controllers:**
   - `TaskStatusController` - REST endpoints for statuses
   - `TaskTagController` - REST endpoints for tags

4. **Update TaskService:**
   - Add methods to assign status to task
   - Add methods to add/remove tags from task

---

## Testing Checklist

- [ ] Create TaskStatus entity
- [ ] Create TaskTag entity
- [ ] Assign status to task
- [ ] Add multiple tags to task
- [ ] Remove tags from task
- [ ] Query tasks by status
- [ ] Query tasks by tag
- [ ] Test cascade delete for many-to-many relationship

---

## Status

✅ **Implementation Complete**  
✅ **Compilation Successful (BUILD SUCCESS)**  
✅ **No Errors**  
✅ **Ready for Database Migration**  
✅ **Ready for Service/Controller Implementation**  

---

**Date:** December 27, 2025  
**Files Created:** 2 (TaskStatus.java, TaskTag.java)  
**Files Modified:** 1 (Task.java)  
**New Tables:** 3 (task_status, task_tags, task_tag_mapping)  
**New Relationships:** 2 (Task→TaskStatus Many-to-One, Task↔TaskTag Many-to-Many)

