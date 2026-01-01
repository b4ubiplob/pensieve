package com.tan90.projects.pensieve.service;

import com.tan90.projects.pensieve.entity.Project;
import com.tan90.projects.pensieve.entity.ProjectList;
import com.tan90.projects.pensieve.entity.User;
import com.tan90.projects.pensieve.repository.ListRepository;
import com.tan90.projects.pensieve.repository.ProjectRepository;
import com.tan90.projects.pensieve.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ListRepository listRepository;

    @Autowired
    private ListService listService;

    // Helper method to return a copy of Project with details
    private Project copyProjectDetails(Project project) {
        if (project == null) return null;
        Project copy = new Project();
        copy.setId(project.getId());
        copy.setName(project.getName());
        copy.setDescription(project.getDescription());
        copy.setCreatedDate(project.getCreatedDate());
        copy.setCompletedDate(project.getCompletedDate());
        // Note: Excluding lazy-loaded collections (lists, user) to avoid serialization issues
        return copy;
    }

    /**
     * Get all projects for a specific user
     */
    public List<Project> getProjectsByUserId(String userId) {
        List<Project> projects = projectRepository.findByUserId(userId);
        return projects.stream().map(this::copyProjectDetails).toList();
    }

    /**
     * Get a single project by ID
     */
    public Optional<Project> getProjectById(String id) {
        return projectRepository.findById(id)
                .map(this::copyProjectDetails);
    }

    /**
     * Create a new project for a user
     */
    public Project createProject(Project project, String userId) {
        // Validate that the user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        // Generate ID if not provided
        if (project.getId() == null || project.getId().isEmpty()) {
            project.setId(UUID.randomUUID().toString());
        }

        // Set created date if not provided
        if (project.getCreatedDate() == null) {
            project.setCreatedDate(LocalDateTime.now());
        }

        // Set the user
        project.setUser(user);

        return copyProjectDetails(projectRepository.save(project));
    }

    /**
     * Update an existing project
     */
    public Project updateProject(String id, Project projectDetails) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + id));

        // Update fields
        if (projectDetails.getName() != null) {
            project.setName(projectDetails.getName());
        }
        if (projectDetails.getDescription() != null) {
            project.setDescription(projectDetails.getDescription());
        }
        if (projectDetails.getCompletedDate() != null) {
            project.setCompletedDate(projectDetails.getCompletedDate());
        }

        return projectRepository.save(project);
    }

    /**
     * Delete a project and all its associated lists and tasks
     */
    public void deleteProject(String id) {
        if (!projectRepository.existsById(id)) {
            throw new IllegalArgumentException("Project not found with id: " + id);
        }

        // First, delete all lists associated with the project (which will cascade delete all tasks)
        List<ProjectList> projectLists = listRepository.findByProjectId(id);
        for (ProjectList list : projectLists) {
            listService.deleteList(list.getId());
        }

        // Then delete the project
        projectRepository.deleteById(id);
    }
}
