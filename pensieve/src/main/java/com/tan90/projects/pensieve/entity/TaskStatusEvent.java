package com.tan90.projects.pensieve.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "task_status_event", schema = "public")
public class TaskStatusEvent {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "task_id", nullable = false, length = 64)
    private String taskId;

    @Column(name = "from_status", length = 64)
    @Enumerated(EnumType.STRING)
    private Task.Status fromStatus;

    @Column(name = "to_status", length = 64, nullable = false)
    @Enumerated(EnumType.STRING)
    private Task.Status toStatus;

    @Column(name = "event_timestamp", nullable = false)
    private LocalDateTime eventTimestamp;

    @Column(name = "user_id", length = 64)
    private String userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", insertable = false, updatable = false)
    private Task task;

    // Constructors
    public TaskStatusEvent() {
    }

    public TaskStatusEvent(String id, String taskId, Task.Status fromStatus, Task.Status toStatus,
                           LocalDateTime eventTimestamp, String userId) {
        this.id = id;
        this.taskId = taskId;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.eventTimestamp = eventTimestamp;
        this.userId = userId;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTaskId() {
        return taskId;
    }

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }

    public Task.Status getFromStatus() {
        return fromStatus;
    }

    public void setFromStatus(Task.Status fromStatus) {
        this.fromStatus = fromStatus;
    }

    public Task.Status getToStatus() {
        return toStatus;
    }

    public void setToStatus(Task.Status toStatus) {
        this.toStatus = toStatus;
    }

    public LocalDateTime getEventTimestamp() {
        return eventTimestamp;
    }

    public void setEventTimestamp(LocalDateTime eventTimestamp) {
        this.eventTimestamp = eventTimestamp;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Task getTask() {
        return task;
    }

    public void setTask(Task task) {
        this.task = task;
    }
}
