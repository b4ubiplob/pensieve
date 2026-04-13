package com.tan90.projects.pensieve.dto;

import com.tan90.projects.pensieve.entity.Task;
import java.time.LocalDateTime;

public class TaskSummaryDto {

    private String taskId;
    private String title;
    private String description;
    private Task.Status status;
    private Task.Priority priority;
    private LocalDateTime createdDate;
    private LocalDateTime lastEventDate;
    private String projectName;
    private String listName;

    // Constructors
    public TaskSummaryDto() {
    }

    public TaskSummaryDto(String taskId, String title, String description,
                          Task.Status status, Task.Priority priority,
                          LocalDateTime createdDate, LocalDateTime lastEventDate,
                          String projectName, String listName) {
        this.taskId = taskId;
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.createdDate = createdDate;
        this.lastEventDate = lastEventDate;
        this.projectName = projectName;
        this.listName = listName;
    }

    // Getters and Setters
    public String getTaskId() {
        return taskId;
    }

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Task.Status getStatus() {
        return status;
    }

    public void setStatus(Task.Status status) {
        this.status = status;
    }

    public Task.Priority getPriority() {
        return priority;
    }

    public void setPriority(Task.Priority priority) {
        this.priority = priority;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public LocalDateTime getLastEventDate() {
        return lastEventDate;
    }

    public void setLastEventDate(LocalDateTime lastEventDate) {
        this.lastEventDate = lastEventDate;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getListName() {
        return listName;
    }

    public void setListName(String listName) {
        this.listName = listName;
    }
}
