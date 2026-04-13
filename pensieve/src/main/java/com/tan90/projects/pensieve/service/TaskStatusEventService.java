package com.tan90.projects.pensieve.service;

import com.tan90.projects.pensieve.entity.Task;
import com.tan90.projects.pensieve.entity.TaskStatusEvent;
import com.tan90.projects.pensieve.repository.TaskStatusEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@Transactional
public class TaskStatusEventService {

    @Autowired
    private TaskStatusEventRepository eventRepository;

    /**
     * Record a status change event
     *
     * @param taskId     The ID of the task
     * @param fromStatus The previous status (null for initial creation)
     * @param toStatus   The new status
     * @param userId     The user who made the change (optional)
     */
    public void recordStatusChange(String taskId, Task.Status fromStatus,
                                    Task.Status toStatus, String userId) {
        TaskStatusEvent event = new TaskStatusEvent();
        event.setId(UUID.randomUUID().toString());
        event.setTaskId(taskId);
        event.setFromStatus(fromStatus);
        event.setToStatus(toStatus);
        event.setEventTimestamp(LocalDateTime.now());
        event.setUserId(userId);
        eventRepository.save(event);
    }

    /**
     * Calculate time spent in IN_PROGRESS status (excluding BLOCKED periods)
     * Returns duration in milliseconds
     *
     * @param taskId The ID of the task
     * @return Duration in milliseconds spent in IN_PROGRESS status
     */
    public Long calculateInProgressDuration(String taskId) {
        List<TaskStatusEvent> events = eventRepository
                .findByTaskIdOrderByEventTimestampAsc(taskId);

        if (events.isEmpty()) {
            return 0L;
        }

        long totalMillis = 0L;
        LocalDateTime inProgressStartTime = null;
        Task.Status currentStatus = null;

        for (TaskStatusEvent event : events) {
            Task.Status toStatus = event.getToStatus();

            // Started IN_PROGRESS
            if (toStatus == Task.Status.IN_PROGRESS) {
                inProgressStartTime = event.getEventTimestamp();
                currentStatus = Task.Status.IN_PROGRESS;
            }
            // Exited IN_PROGRESS (to BLOCKED, COMPLETED, or PAUSED)
            else if (currentStatus == Task.Status.IN_PROGRESS &&
                    (toStatus == Task.Status.BLOCKED ||
                     toStatus == Task.Status.COMPLETED ||
                     toStatus == Task.Status.PAUSED)) {
                if (inProgressStartTime != null) {
                    Duration duration = Duration.between(inProgressStartTime,
                            event.getEventTimestamp());
                    totalMillis += duration.toMillis();
                    inProgressStartTime = null;
                }
                currentStatus = toStatus;

                if (toStatus == Task.Status.COMPLETED) {
                    break;  // Stop counting after completion
                }
            }
        }

        // Handle case where task is still IN_PROGRESS
        if (currentStatus == Task.Status.IN_PROGRESS && inProgressStartTime != null) {
            Duration duration = Duration.between(inProgressStartTime, LocalDateTime.now());
            totalMillis += duration.toMillis();
        }

        return totalMillis;
    }

    /**
     * Format duration as human-readable string (e.g., "2h 30m", "45m", "3d 5h")
     *
     * @param millis Duration in milliseconds
     * @return Formatted duration string
     */
    public String formatDuration(Long millis) {
        if (millis == null || millis == 0) {
            return "0m";
        }

        long days = TimeUnit.MILLISECONDS.toDays(millis);
        long hours = TimeUnit.MILLISECONDS.toHours(millis) % 24;
        long minutes = TimeUnit.MILLISECONDS.toMinutes(millis) % 60;

        StringBuilder result = new StringBuilder();

        if (days > 0) {
            result.append(days).append("d ");
        }
        if (hours > 0 || days > 0) {
            result.append(hours).append("h ");
        }
        result.append(minutes).append("m");

        return result.toString().trim();
    }

    /**
     * Get all events for a task (for timeline visualization)
     *
     * @param taskId The ID of the task
     * @return List of status events ordered chronologically
     */
    public List<TaskStatusEvent> getTaskEvents(String taskId) {
        return eventRepository.findByTaskIdOrderByEventTimestampAsc(taskId);
    }
}
