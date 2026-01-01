package com.tan90.projects.pensieve.controller;

import com.tan90.projects.pensieve.entity.Task;
import com.tan90.projects.pensieve.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    @Autowired
    private TaskService taskService;

    /**
     * GET /tasks?listId={listId} - Get all tasks for a list
     */
    @GetMapping
    public ResponseEntity<List<Task>> getTasksByListId(@RequestParam String listId) {
        List<Task> tasks = taskService.getTasksByListId(listId);
        return ResponseEntity.ok(tasks);
    }

    /**
     * GET /tasks/{id} - Get a single task by ID with its child tasks
     */
    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable String id) {
        return taskService.getTaskByIdWithChildren(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /tasks?listId={listId} - Create a new task for a list
     * POST /tasks?parentTaskId={parentTaskId} - Create a new subtask for a task
     */
    @PostMapping
    public ResponseEntity<?> createTask(
            @RequestBody Task task,
            @RequestParam(required = false) String listId,
            @RequestParam(required = false) String parentTaskId) {

        try {
            // Check if creating a subtask or a top-level task
            if (parentTaskId != null && !parentTaskId.isEmpty()) {
                // Create subtask
                Task createdTask = taskService.createSubTask(task, parentTaskId);
                return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
            } else if (listId != null && !listId.isEmpty()) {
                // Create task for a list
                Task createdTask = taskService.createTaskForList(task, listId);
                return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Either listId or parentTaskId must be provided");
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * PUT /tasks/{id} - Update an existing task
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(@PathVariable String id, @RequestBody Task taskDetails) {
        try {
            Task updatedTask = taskService.updateTask(id, taskDetails);
            return ResponseEntity.ok(updatedTask);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * DELETE /tasks/{id} - Delete a task and its child tasks
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable String id) {
        try {
            taskService.deleteTask(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}

