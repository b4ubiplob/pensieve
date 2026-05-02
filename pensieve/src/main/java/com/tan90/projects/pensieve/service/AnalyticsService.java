package com.tan90.projects.pensieve.service;

import com.tan90.projects.pensieve.dto.StatusTransitionDto;
import com.tan90.projects.pensieve.dto.TaskDurationDto;
import com.tan90.projects.pensieve.dto.TaskSummaryDto;
import com.tan90.projects.pensieve.entity.Task;
import com.tan90.projects.pensieve.entity.TaskStatusEvent;
import com.tan90.projects.pensieve.repository.TaskRepository;
import com.tan90.projects.pensieve.repository.TaskStatusEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AnalyticsService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private TaskStatusEventService eventService;

    @Autowired
    private TaskStatusEventRepository eventRepository;

    /**
     * Get task duration details including status history
     *
     * @param taskId The ID of the task
     * @return TaskDurationDto with duration and status history
     */
    public TaskDurationDto getTaskDuration(String taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found: " + taskId));

        Long durationMs = eventService.calculateInProgressDuration(taskId);
        String durationFormatted = eventService.formatDuration(durationMs);
        List<TaskStatusEvent> events = eventService.getTaskEvents(taskId);

        TaskDurationDto dto = new TaskDurationDto();
        dto.setTaskId(task.getId());
        dto.setTaskTitle(task.getTitle());
        dto.setCurrentStatus(task.getStatus());
        dto.setCreatedDate(task.getCreatedDate());
        dto.setCompletedDate(task.getCompletedDate());
        dto.setDurationInProgressMs(durationMs);
        dto.setDurationFormatted(durationFormatted);
        dto.setIsCompleted(task.getStatus() == Task.Status.COMPLETED);
        dto.setStatusHistory(events.stream()
                .map(e -> {
                    StatusTransitionDto t = new StatusTransitionDto();
                    t.setFromStatus(e.getFromStatus());
                    t.setToStatus(e.getToStatus());
                    t.setTimestamp(e.getEventTimestamp());
                    return t;
                })
                .collect(Collectors.toList()));

        return dto;
    }

    /**
     * Get tasks with events on a specific date
     *
     * @param date   The date to query
     * @param userId Optional user ID to filter by (can be null)
     * @return List of TaskSummaryDto
     */
    public List<TaskSummaryDto> getTasksByDate(LocalDate date, String userId) {
        List<String> taskIds = eventRepository.findTaskIdsByEventDate(date);

        return taskIds.stream()
                .map(taskId -> taskRepository.findById(taskId).orElse(null))
                .filter(task -> task != null)
                .filter(task -> task.getParent() == null)
                .filter(task -> userId == null || (task.getList() != null &&
                        task.getList().getProject() != null &&
                        userId.equals(task.getList().getProject().getUser().getId())))
                .map(this::toTaskSummaryDto)
                .collect(Collectors.toList());
    }

    /**
     * Get tasks with events in a date range
     *
     * @param startDate The start date
     * @param endDate   The end date
     * @param userId    Optional user ID to filter by (can be null)
     * @return List of TaskSummaryDto
     */
    public List<TaskSummaryDto> getTasksByDateRange(LocalDate startDate, LocalDate endDate, String userId) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        List<String> taskIds = eventRepository.findTaskIdsByEventDateRange(startDateTime, endDateTime);

        return taskIds.stream()
                .map(taskId -> taskRepository.findById(taskId).orElse(null))
                .filter(task -> task != null)
                .filter(task -> task.getParent() == null)
                .filter(task -> userId == null || (task.getList() != null &&
                        task.getList().getProject() != null &&
                        userId.equals(task.getList().getProject().getUser().getId())))
                .map(this::toTaskSummaryDto)
                .collect(Collectors.toList());
    }

    /**
     * Helper method to convert Task to TaskSummaryDto
     */
    private TaskSummaryDto toTaskSummaryDto(Task task) {
        TaskSummaryDto dto = new TaskSummaryDto();
        dto.setTaskId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());
        dto.setCreatedDate(task.getCreatedDate());

        if (task.getList() != null) {
            dto.setListId(task.getList().getId());
            dto.setListName(task.getList().getName());
            if (task.getList().getProject() != null) {
                dto.setProjectId(task.getList().getProject().getId());
                dto.setProjectName(task.getList().getProject().getName());
            }
        }

        // Get the most recent event timestamp for this task
        List<TaskStatusEvent> events = eventService.getTaskEvents(task.getId());
        if (!events.isEmpty()) {
            dto.setLastEventDate(events.get(events.size() - 1).getEventTimestamp());
        }

        return dto;
    }
}
