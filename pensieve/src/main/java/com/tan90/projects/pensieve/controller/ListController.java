package com.tan90.projects.pensieve.controller;

import com.tan90.projects.pensieve.dto.ListReorderRequest;
import com.tan90.projects.pensieve.dto.ProjectListDto;
import com.tan90.projects.pensieve.entity.ProjectList;
import com.tan90.projects.pensieve.service.ListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
    public ResponseEntity<List<ProjectListDto>> getListsByProjectId(@RequestParam String projectId) {
        List<ProjectListDto> lists = listService.getListsByProjectId(projectId);
        return ResponseEntity.ok(lists);
    }

    /**
     * GET /lists/{id} - Get a single list by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProjectListDto> getListById(@PathVariable String id) {
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
            ProjectListDto createdList = listService.createList(list, projectId);
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
            ProjectListDto updatedList = listService.updateList(id, listDetails);
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

    /**
     * GET /lists/{id}/export - Export a list with all its tasks
     */
    @GetMapping("/{id}/export")
    public ResponseEntity<?> exportList(@PathVariable String id) {
        try {
            Map<String, Object> exportData = listService.exportList(id);
            return ResponseEntity.ok(exportData);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * POST /lists/import?projectId={projectId} - Import a list with all its tasks
     */
    @PostMapping("/import")
    public ResponseEntity<?> importList(@RequestBody Map<String, Object> importData, @RequestParam String projectId) {
        try {
            ProjectListDto importedList = listService.importList(importData, projectId);
            return ResponseEntity.status(HttpStatus.CREATED).body(importedList);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT /lists/reorder?projectId={projectId} - Reorder lists within a project
     */
    @PutMapping("/reorder")
    public ResponseEntity<?> reorderLists(
            @RequestParam String projectId,
            @RequestBody List<ListReorderRequest> reorderRequests
    ) {
        try {
            List<ProjectListDto> updatedLists = listService.reorderLists(projectId, reorderRequests);
            return ResponseEntity.ok(updatedLists);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}

