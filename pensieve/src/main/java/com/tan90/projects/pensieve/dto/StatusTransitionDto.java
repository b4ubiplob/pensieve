package com.tan90.projects.pensieve.dto;

import com.tan90.projects.pensieve.entity.Task;
import java.time.LocalDateTime;

public class StatusTransitionDto {

    private Task.Status fromStatus;
    private Task.Status toStatus;
    private LocalDateTime timestamp;

    // Constructors
    public StatusTransitionDto() {
    }

    public StatusTransitionDto(Task.Status fromStatus, Task.Status toStatus, LocalDateTime timestamp) {
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.timestamp = timestamp;
    }

    // Getters and Setters
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

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
