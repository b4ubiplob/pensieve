package com.tan90.projects.pensieve.controller;

import com.tan90.projects.pensieve.dto.ProjectDto;
import com.tan90.projects.pensieve.dto.ProjectImportDto;
import com.tan90.projects.pensieve.entity.Project;
import com.tan90.projects.pensieve.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/projects")
@CrossOrigin(origins = "*")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    /**
     * GET /projects?userId={userId} - Get all projects for a user
     */
    @GetMapping
    public ResponseEntity<List<ProjectDto>> getProjectsByUserId(@RequestParam String userId) {
        List<ProjectDto> projects = projectService.getProjectsByUserId(userId);
        return ResponseEntity.ok(projects);
    }

    /**
     * GET /projects/{id} - Get a single project by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto> getProjectById(@PathVariable String id) {
        return projectService.getProjectById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /projects?userId={userId} - Create a new project for a user
     */
    @PostMapping
    public ResponseEntity<?> createProject(@RequestBody Project project, @RequestParam String userId) {
        try {
            ProjectDto createdProject = projectService.createProject(project, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdProject);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * PUT /projects/{id} - Update an existing project
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProject(@PathVariable String id, @RequestBody Project projectDetails) {
        try {
            ProjectDto updatedProject = projectService.updateProject(id, projectDetails);
            return ResponseEntity.ok(updatedProject);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * DELETE /projects/{id} - Delete a project
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable String id) {
        try {
            projectService.deleteProject(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * POST /projects/import?userId={userId} - Import a project from JSON
     */
    @PostMapping("/import")
    public ResponseEntity<?> importProject(@RequestBody ProjectImportDto importDto, @RequestParam String userId) {
        try {
            ProjectDto importedProject = projectService.importProject(importDto, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(importedProject);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
