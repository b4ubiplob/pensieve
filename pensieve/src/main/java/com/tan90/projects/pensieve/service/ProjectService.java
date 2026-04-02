package com.tan90.projects.pensieve.service;

import com.tan90.projects.pensieve.dto.ProjectDto;
import com.tan90.projects.pensieve.dto.ProjectImportDto;
import com.tan90.projects.pensieve.entity.Project;
import com.tan90.projects.pensieve.entity.ProjectList;
import com.tan90.projects.pensieve.entity.Task;
import com.tan90.projects.pensieve.entity.User;
import com.tan90.projects.pensieve.repository.ListRepository;
import com.tan90.projects.pensieve.repository.ProjectRepository;
import com.tan90.projects.pensieve.repository.TaskRepository;
import com.tan90.projects.pensieve.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

    @Autowired
    private TaskRepository taskRepository;

    // DTO Mapper
    private ProjectDto toProjectDto(Project project) {
        if (project == null) return null;

        ProjectDto dto = new ProjectDto();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setCreatedDate(project.getCreatedDate());
        dto.setCompletedDate(project.getCompletedDate());

        return dto;
    }

    /**
     * Get all projects for a specific user
     */
    public List<ProjectDto> getProjectsByUserId(String userId) {
        List<Project> projects = projectRepository.findByUserId(userId);
        return projects.stream().map(this::toProjectDto).toList();
    }

    /**
     * Get a single project by ID
     */
    public Optional<ProjectDto> getProjectById(String id) {
        return projectRepository.findById(id)
                .map(this::toProjectDto);
    }

    /**
     * Create a new project for a user
     */
    public ProjectDto createProject(Project project, String userId) {
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

        Project savedProject = projectRepository.save(project);
        return toProjectDto(savedProject);
    }

    /**
     * Update an existing project
     */
    public ProjectDto updateProject(String id, Project projectDetails) {
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

        Project savedProject = projectRepository.save(project);
        return toProjectDto(savedProject);
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

    /**
     * Import a project from JSON data (transactional)
     */
    public ProjectDto importProject(ProjectImportDto importDto, String userId) {
        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        // Validate project name
        if (importDto.getName() == null || importDto.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Project name is required");
        }

        try {
            // Create the project
            Project project = new Project();
            project.setId(UUID.randomUUID().toString());
            project.setName(importDto.getName());
            project.setDescription(importDto.getDescription());
            project.setCreatedDate(LocalDateTime.now());
            project.setUser(user);
            project = projectRepository.save(project);

            // Create lists if they exist
            if (importDto.getLists() != null && !importDto.getLists().isEmpty()) {
                for (ProjectImportDto.ListImportDto listDto : importDto.getLists()) {
                    if (listDto.getName() == null || listDto.getName().trim().isEmpty()) {
                        throw new IllegalArgumentException("List name is required for all lists");
                    }

                    // Create list
                    ProjectList list = new ProjectList();
                    list.setId(UUID.randomUUID().toString());
                    list.setName(listDto.getName());
                    list.setDescription(listDto.getDescription());
                    list.setCreatedDate(LocalDateTime.now());
                    list.setProject(project);
                    list = listRepository.save(list);

                    // Create tasks if they exist
                    if (listDto.getTasks() != null && !listDto.getTasks().isEmpty()) {
                        // Map old task IDs to new task IDs for subtask creation
                        Map<String, String> taskIdMap = new HashMap<>();

                        // First pass: create all parent tasks (tasks without parentTaskId)
                        for (ProjectImportDto.TaskImportDto taskDto : listDto.getTasks()) {
                            if (taskDto.getParentTaskId() == null) {
                                Task task = createTaskFromDto(taskDto, list);
                                taskIdMap.put(taskDto.getId(), task.getId());
                            }
                        }

                        // Second pass: create all subtasks with mapped parent IDs
                        for (ProjectImportDto.TaskImportDto taskDto : listDto.getTasks()) {
                            if (taskDto.getParentTaskId() != null) {
                                String newParentId = taskIdMap.get(taskDto.getParentTaskId());
                                if (newParentId == null) {
                                    throw new IllegalArgumentException(
                                        "Parent task not found for subtask: " + taskDto.getTitle()
                                    );
                                }

                                Task parentTask = taskRepository.findById(newParentId)
                                        .orElseThrow(() -> new IllegalArgumentException(
                                            "Parent task not found with id: " + newParentId
                                        ));

                                Task subtask = createTaskFromDto(taskDto, list);
                                subtask.setParent(parentTask);
                                taskRepository.save(subtask);
                            }
                        }
                    }
                }
            }

            return toProjectDto(project);
        } catch (Exception e) {
            // Transaction will automatically rollback on exception
            throw new RuntimeException("Failed to import project: " + e.getMessage(), e);
        }
    }

    /**
     * Helper method to create a Task entity from TaskImportDto
     */
    private Task createTaskFromDto(ProjectImportDto.TaskImportDto taskDto, ProjectList list) {
        if (taskDto.getTitle() == null || taskDto.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Task title is required for all tasks");
        }

        Task task = new Task();
        task.setId(UUID.randomUUID().toString());
        task.setTitle(taskDto.getTitle());
        task.setDescription(taskDto.getDescription());
        task.setCreatedDate(LocalDateTime.now());
        task.setList(list);

        // Parse and set status
        if (taskDto.getStatus() != null) {
            try {
                task.setStatus(Task.Status.valueOf(taskDto.getStatus()));
            } catch (IllegalArgumentException e) {
                task.setStatus(Task.Status.CREATED); // Default to CREATED if invalid
            }
        } else {
            task.setStatus(Task.Status.CREATED);
        }

        // Parse and set priority
        if (taskDto.getPriority() != null) {
            try {
                task.setPriority(Task.Priority.valueOf(taskDto.getPriority()));
            } catch (IllegalArgumentException e) {
                task.setPriority(Task.Priority.MEDIUM); // Default to MEDIUM if invalid
            }
        } else {
            task.setPriority(Task.Priority.MEDIUM);
        }

        // Parse and set due date if provided
        if (taskDto.getDueDate() != null) {
            try {
                task.setDueDate(LocalDateTime.parse(taskDto.getDueDate()));
            } catch (Exception e) {
                // Skip due date if parsing fails
                task.setDueDate(null);
            }
        }

        return taskRepository.save(task);
    }
}
