package com.tan90.projects.pensieve.service;

import com.tan90.projects.pensieve.dto.TaskDto;
import com.tan90.projects.pensieve.dto.TaskDetailDto;
import com.tan90.projects.pensieve.dto.TaskWithProjectDto;
import com.tan90.projects.pensieve.entity.ProjectList;
import com.tan90.projects.pensieve.entity.Task;
import com.tan90.projects.pensieve.repository.ListRepository;
import com.tan90.projects.pensieve.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ListRepository listRepository;

    @Autowired
    private TaskStatusEventService taskStatusEventService;

    // Helper method to return a copy of Task with details
    private Task copyTaskDetails(Task task) {
        if (task == null) return null;
        Task copy = new Task();
        copy.setId(task.getId());
        copy.setTitle(task.getTitle());
        copy.setDescription(task.getDescription());
        copy.setDueDate(task.getDueDate());
        copy.setReminderDate(task.getReminderDate());
        copy.setCreatedDate(task.getCreatedDate());
        copy.setCompletedDate(task.getCompletedDate());
        copy.setStatus(task.getStatus());
        copy.setPriority(task.getPriority());
        copy.setParentTaskId(task.getParent() != null ? task.getParent().getId() : null);
        // Note: Excluding lazy-loaded collections (subTasks, attachments, tags, parent, list) to avoid serialization issues
        return copy;
    }

    // Helper method to return a copy of Task with child tasks
    private Task copyTaskWithChildren(Task task) {
        if (task == null) return null;
        Task copy = copyTaskDetails(task);

        // Fetch child tasks from repository (not using lazy-loaded collection)
        List<Task> childTasks = taskRepository.findByParentId(task.getId());
        if (childTasks != null && !childTasks.isEmpty()) {
            copy.setSubTasks(
                childTasks.stream()
                    .map(this::copyTaskWithChildren)  // Recursively copy child tasks
                    .collect(Collectors.toSet())
            );
        }

        return copy;
    }

    // DTO Mappers
    private TaskDto toTaskDto(Task task) {
        if (task == null) return null;

        TaskDto dto = new TaskDto();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setDueDate(task.getDueDate());
        dto.setReminderDate(task.getReminderDate());
        dto.setCreatedDate(task.getCreatedDate());
        dto.setCompletedDate(task.getCompletedDate());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());
        dto.setParentTaskId(task.getParent() != null ? task.getParent().getId() : null);

        return dto;
    }

    private TaskDetailDto toTaskDetailDto(Task task) {
        if (task == null) return null;

        TaskDetailDto dto = new TaskDetailDto();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setDueDate(task.getDueDate());
        dto.setReminderDate(task.getReminderDate());
        dto.setCreatedDate(task.getCreatedDate());
        dto.setCompletedDate(task.getCompletedDate());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());
        dto.setParentTaskId(task.getParent() != null ? task.getParent().getId() : null);

        // Fetch and include subtasks
        List<Task> childTasks = taskRepository.findByParentId(task.getId());
        if (childTasks != null && !childTasks.isEmpty()) {
            dto.setSubTasks(
                childTasks.stream()
                    .map(this::toTaskDto)
                    .collect(Collectors.toList())
            );
        } else {
            dto.setSubTasks(new ArrayList<>());
        }

        return dto;
    }

    /**
     * Get all tasks for a specific list
     */
    public List<TaskDto> getTasksByListId(String listId) {
        List<Task> tasks = taskRepository.findByListId(listId);
        return tasks.stream().map(this::toTaskDto).toList();
    }

    /**
     * Get a single task by ID with its child tasks
     */
    public Optional<TaskDetailDto> getTaskByIdWithChildren(String id) {
        return taskRepository.findById(id)
                .map(this::toTaskDetailDto);
    }

    /**
     * Create a new task for a list
     */
    public TaskDto createTaskForList(Task task, String listId) {
        // Validate that the list exists
        ProjectList list = listRepository.findById(listId)
                .orElseThrow(() -> new IllegalArgumentException("List not found with id: " + listId));

        // Generate ID if not provided
        if (task.getId() == null || task.getId().isEmpty()) {
            task.setId(UUID.randomUUID().toString());
        }

        // Set created date if not provided
        if (task.getCreatedDate() == null) {
            task.setCreatedDate(LocalDateTime.now());
        }

        // Set default status if not provided
        if (task.getStatus() == null) {
            task.setStatus(Task.Status.CREATED);
        }

        // Set the list
        task.setList(list);
        task.setParent(null); // No parent for top-level tasks

        Task savedTask = taskRepository.save(task);

        // Record initial CREATED event
        taskStatusEventService.recordStatusChange(
                savedTask.getId(),
                null,  // fromStatus is null for initial creation
                Task.Status.CREATED,
                null   // userId - can be enhanced later with security context
        );

        return toTaskDto(savedTask);
    }

    /**
     * Create a new subtask for a parent task
     */
    public TaskDto createSubTask(Task task, String parentTaskId) {
        // Validate that the parent task exists
        Task parentTask = taskRepository.findById(parentTaskId)
                .orElseThrow(() -> new IllegalArgumentException("Parent task not found with id: " + parentTaskId));

        // Generate ID if not provided
        if (task.getId() == null || task.getId().isEmpty()) {
            task.setId(UUID.randomUUID().toString());
        }

        // Set created date if not provided
        if (task.getCreatedDate() == null) {
            task.setCreatedDate(LocalDateTime.now());
        }

        // Set default status if not provided
        if (task.getStatus() == null) {
            task.setStatus(Task.Status.CREATED);
        }

        // Set the parent task and inherit the list from parent
        task.setParent(parentTask);
        task.setList(parentTask.getList());

        Task savedTask = taskRepository.save(task);

        // Record initial CREATED event
        taskStatusEventService.recordStatusChange(
                savedTask.getId(),
                null,  // fromStatus is null for initial creation
                Task.Status.CREATED,
                null   // userId - can be enhanced later with security context
        );

        return toTaskDto(savedTask);
    }

    /**
     * Update an existing task
     */
    public TaskDto updateTask(String id, Task taskDetails) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with id: " + id));

        // Track previous status to detect completion
        Task.Status previousStatus = task.getStatus();

        // Update fields
        if (taskDetails.getTitle() != null) {
            task.setTitle(taskDetails.getTitle());
        }
        if (taskDetails.getDescription() != null) {
            task.setDescription(taskDetails.getDescription());
        }
        if (taskDetails.getDueDate() != null) {
            task.setDueDate(taskDetails.getDueDate());
        }
        if (taskDetails.getReminderDate() != null) {
            task.setReminderDate(taskDetails.getReminderDate());
        }
        if (taskDetails.getCompletedDate() != null) {
            task.setCompletedDate(taskDetails.getCompletedDate());
        }
        if (taskDetails.getStatus() != null && !taskDetails.getStatus().equals(previousStatus)) {
            task.setStatus(taskDetails.getStatus());

            // Record status change event
            taskStatusEventService.recordStatusChange(
                    task.getId(),
                    previousStatus,
                    taskDetails.getStatus(),
                    null  // userId - can be enhanced later with security context
            );

            // Automatically set completedDate when task is marked as COMPLETED
            if (taskDetails.getStatus() == Task.Status.COMPLETED && previousStatus != Task.Status.COMPLETED) {
                task.setCompletedDate(LocalDateTime.now());
            }
            // Clear completedDate if task is moved out of COMPLETED status
            else if (taskDetails.getStatus() != Task.Status.COMPLETED && previousStatus == Task.Status.COMPLETED) {
                task.setCompletedDate(null);
            }
        }
        if (taskDetails.getPriority() != null) {
            task.setPriority(taskDetails.getPriority());
        }

        Task savedTask = taskRepository.save(task);
        return toTaskDto(savedTask);
    }

    /**
     * Delete a task and all its child tasks
     */
    public void deleteTask(String id) {
        if (!taskRepository.existsById(id)) {
            throw new IllegalArgumentException("Task not found with id: " + id);
        }

        // First, delete all child tasks recursively
        List<Task> childTasks = taskRepository.findByParentId(id);
        for (Task childTask : childTasks) {
            deleteTask(childTask.getId()); // Recursive deletion
        }

        // Then delete the task itself
        taskRepository.deleteById(id);
    }

    /**
     * Get all tasks for a user by status, including project information
     */
    public List<TaskWithProjectDto> getTasksByUserAndStatus(String userId, Task.Status status) {
        List<Task> tasks = taskRepository.findByUserIdAndStatus(userId, status);

        return tasks.stream().map(task -> {
            TaskWithProjectDto dto = new TaskWithProjectDto();
            dto.setId(task.getId());
            dto.setTitle(task.getTitle());
            dto.setDescription(task.getDescription());
            dto.setDueDate(task.getDueDate());
            dto.setReminderDate(task.getReminderDate());
            dto.setCreatedDate(task.getCreatedDate());
            dto.setCompletedDate(task.getCompletedDate());
            dto.setStatus(task.getStatus());
            dto.setPriority(task.getPriority());

            // Add project and list information
            if (task.getList() != null) {
                dto.setListId(task.getList().getId());
                dto.setListName(task.getList().getName());

                if (task.getList().getProject() != null) {
                    dto.setProjectId(task.getList().getProject().getId());
                    dto.setProjectName(task.getList().getProject().getName());
                }
            }

            return dto;
        }).collect(Collectors.toList());
    }
}

