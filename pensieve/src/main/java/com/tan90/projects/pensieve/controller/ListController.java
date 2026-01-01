package com.tan90.projects.pensieve.controller;

import com.tan90.projects.pensieve.entity.ProjectList;
import com.tan90.projects.pensieve.service.ListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lists")
@CrossOrigin(origins = "*")
public class ListController {

    @Autowired
    private ListService listService;

    /**
     * GET /lists?projectId={projectId} - Get all lists for a project
     */
    @GetMapping
    public ResponseEntity<List<ProjectList>> getListsByProjectId(@RequestParam String projectId) {
        List<ProjectList> lists = listService.getListsByProjectId(projectId);
        return ResponseEntity.ok(lists);
    }

    /**
     * GET /lists/{id} - Get a single list by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProjectList> getListById(@PathVariable String id) {
        return listService.getListById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /lists?projectId={projectId} - Create a new list for a project
     */
    @PostMapping
    public ResponseEntity<?> createList(@RequestBody ProjectList list, @RequestParam String projectId) {
        try {
            ProjectList createdList = listService.createList(list, projectId);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdList);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * PUT /lists/{id} - Update an existing list
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateList(@PathVariable String id, @RequestBody ProjectList listDetails) {
        try {
            ProjectList updatedList = listService.updateList(id, listDetails);
            return ResponseEntity.ok(updatedList);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * DELETE /lists/{id} - Delete a list
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteList(@PathVariable String id) {
        try {
            listService.deleteList(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}

