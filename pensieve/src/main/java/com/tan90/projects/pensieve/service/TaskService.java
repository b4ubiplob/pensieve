package com.tan90.projects.pensieve.service;

import com.tan90.projects.pensieve.entity.ProjectList;
import com.tan90.projects.pensieve.entity.Task;
import com.tan90.projects.pensieve.repository.ListRepository;
import com.tan90.projects.pensieve.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
        // Note: Excluding lazy-loaded collections (subTasks, attachments, tags, parent, list) to avoid serialization issues
        return copy;
    }

    // Helper method to return a copy of Task with child tasks
    private Task copyTaskWithChildren(Task task) {
        if (task == null) return null;
        Task copy = copyTaskDetails(task);

        // Include child tasks if they exist
        if (task.getSubTasks() != null && !task.getSubTasks().isEmpty()) {
            copy.setSubTasks(
                task.getSubTasks().stream()
                    .map(this::copyTaskWithChildren)  // Recursively copy child tasks
                    .collect(Collectors.toSet())
            );
        }

        return copy;
    }

    /**
     * Get all tasks for a specific list
     */
    public List<Task> getTasksByListId(String listId) {
        List<Task> tasks = taskRepository.findByListId(listId);
        return tasks.stream().map(this::copyTaskDetails).toList();
    }

    /**
     * Get a single task by ID with its child tasks
     */
    public Optional<Task> getTaskByIdWithChildren(String id) {
        return taskRepository.findById(id)
                .map(this::copyTaskWithChildren);
    }

    /**
     * Create a new task for a list
     */
    public Task createTaskForList(Task task, String listId) {
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

        return taskRepository.save(task);
    }

    /**
     * Create a new subtask for a parent task
     */
    public Task createSubTask(Task task, String parentTaskId) {
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

        return taskRepository.save(task);
    }

    /**
     * Update an existing task
     */
    public Task updateTask(String id, Task taskDetails) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with id: " + id));

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
        if (taskDetails.getStatus() != null) {
            task.setStatus(taskDetails.getStatus());
        }
        if (taskDetails.getPriority() != null) {
            task.setPriority(taskDetails.getPriority());
        }

        return taskRepository.save(task);
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
}

