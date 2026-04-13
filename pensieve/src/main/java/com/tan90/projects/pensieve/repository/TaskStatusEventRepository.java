package com.tan90.projects.pensieve.repository;

import com.tan90.projects.pensieve.entity.TaskStatusEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskStatusEventRepository extends JpaRepository<TaskStatusEvent, String> {

    /**
     * Get all events for a specific task, ordered chronologically
     */
    List<TaskStatusEvent> findByTaskIdOrderByEventTimestampAsc(String taskId);

    /**
     * Find distinct task IDs with events on a specific date
     */
    @Query("SELECT DISTINCT e.taskId FROM TaskStatusEvent e " +
           "WHERE CAST(e.eventTimestamp AS date) = :date")
    List<String> findTaskIdsByEventDate(@Param("date") LocalDate date);

    /**
     * Find distinct task IDs with events in a date range
     */
    @Query("SELECT DISTINCT e.taskId FROM TaskStatusEvent e " +
           "WHERE e.eventTimestamp BETWEEN :startDateTime AND :endDateTime")
    List<String> findTaskIdsByEventDateRange(
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime
    );
}
