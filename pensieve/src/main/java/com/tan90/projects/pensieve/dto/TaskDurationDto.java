package com.tan90.projects.pensieve.dto;

import com.tan90.projects.pensieve.entity.Task;
import java.time.LocalDateTime;
import java.util.List;

public class TaskDurationDto {

    private String taskId;
    private String taskTitle;
    private Task.Status currentStatus;
    private LocalDateTime createdDate;
    private LocalDateTime completedDate;
    private Long durationInProgressMs;
    private String durationFormatted;
    private Boolean isCompleted;
    private List<StatusTransitionDto> statusHistory;

    // Constructors
    public TaskDurationDto() {
    }

    public TaskDurationDto(String taskId, String taskTitle, Task.Status currentStatus,
                           LocalDateTime createdDate, LocalDateTime completedDate,
                           Long durationInProgressMs, String durationFormatted,
                           Boolean isCompleted, List<StatusTransitionDto> statusHistory) {
        this.taskId = taskId;
        this.taskTitle = taskTitle;
        this.currentStatus = currentStatus;
        this.createdDate = createdDate;
        this.completedDate = completedDate;
        this.durationInProgressMs = durationInProgressMs;
        this.durationFormatted = durationFormatted;
        this.isCompleted = isCompleted;
        this.statusHistory = statusHistory;
    }

    // Getters and Setters
    public String getTaskId() {
        return taskId;
    }

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }

    public String getTaskTitle() {
        return taskTitle;
    }

    public void setTaskTitle(String taskTitle) {
        this.taskTitle = taskTitle;
    }

    public Task.Status getCurrentStatus() {
        return currentStatus;
    }

    public void setCurrentStatus(Task.Status currentStatus) {
        this.currentStatus = currentStatus;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public LocalDateTime getCompletedDate() {
        return completedDate;
    }

    public void setCompletedDate(LocalDateTime completedDate) {
        this.completedDate = completedDate;
    }

    public Long getDurationInProgressMs() {
        return durationInProgressMs;
    }

    public void setDurationInProgressMs(Long durationInProgressMs) {
        this.durationInProgressMs = durationInProgressMs;
    }

    public String getDurationFormatted() {
        return durationFormatted;
    }

    public void setDurationFormatted(String durationFormatted) {
        this.durationFormatted = durationFormatted;
    }

    public Boolean getIsCompleted() {
        return isCompleted;
    }

    public void setIsCompleted(Boolean isCompleted) {
        this.isCompleted = isCompleted;
    }

    public List<StatusTransitionDto> getStatusHistory() {
        return statusHistory;
    }

    public void setStatusHistory(List<StatusTransitionDto> statusHistory) {
        this.statusHistory = statusHistory;
    }
}
