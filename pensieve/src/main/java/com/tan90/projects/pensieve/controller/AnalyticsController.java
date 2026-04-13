package com.tan90.projects.pensieve.controller;

import com.tan90.projects.pensieve.dto.TaskDurationDto;
import com.tan90.projects.pensieve.dto.TaskSummaryDto;
import com.tan90.projects.pensieve.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    /**
     * GET /api/v1/analytics/task/{taskId}/duration
     * Calculate time to complete a task (IN_PROGRESS time only)
     */
    @GetMapping("/task/{taskId}/duration")
    public ResponseEntity<TaskDurationDto> getTaskDuration(@PathVariable String taskId) {
        try {
            TaskDurationDto duration = analyticsService.getTaskDuration(taskId);
            return ResponseEntity.ok(duration);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /api/v1/analytics/tasks/by-date?date=2024-03-15&userId=abc
     * Get tasks that had events on a specific date
     */
    @GetMapping("/tasks/by-date")
    public ResponseEntity<List<TaskSummaryDto>> getTasksByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String userId) {
        List<TaskSummaryDto> tasks = analyticsService.getTasksByDate(date, userId);
        return ResponseEntity.ok(tasks);
    }

    /**
     * GET /api/v1/analytics/tasks/by-range?startDate=2024-03-01&endDate=2024-03-31&userId=abc
     * Get tasks with events in a date range
     */
    @GetMapping("/tasks/by-range")
    public ResponseEntity<List<TaskSummaryDto>> getTasksByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String userId) {
        List<TaskSummaryDto> tasks = analyticsService.getTasksByDateRange(startDate, endDate, userId);
        return ResponseEntity.ok(tasks);
    }
}
