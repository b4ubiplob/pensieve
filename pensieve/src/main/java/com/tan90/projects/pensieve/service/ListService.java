package com.tan90.projects.pensieve.service;

import com.tan90.projects.pensieve.entity.Project;
import com.tan90.projects.pensieve.entity.ProjectList;
import com.tan90.projects.pensieve.entity.Task;
import com.tan90.projects.pensieve.repository.ListRepository;
import com.tan90.projects.pensieve.repository.ProjectRepository;
import com.tan90.projects.pensieve.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class ListService {

    @Autowired
    private ListRepository listRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TaskRepository taskRepository;

    // Helper method to return a copy of ProjectList with details
    private ProjectList copyListDetails(ProjectList list) {
        if (list == null) return null;
        ProjectList copy = new ProjectList();
        copy.setId(list.getId());
        copy.setName(list.getName());
        copy.setDescription(list.getDescription());
        copy.setCreatedDate(list.getCreatedDate());
        copy.setCompletedDate(list.getCompletedDate());
        // Note: Excluding lazy-loaded collections (tasks, project) to avoid serialization issues
        return copy;
    }

    /**
     * Get all lists for a specific project
     */
    public List<ProjectList> getListsByProjectId(String projectId) {
        List<ProjectList> lists = listRepository.findByProjectId(projectId);
        return lists.stream().map(this::copyListDetails).toList();
    }

    /**
     * Get a single list by ID
     */
    public Optional<ProjectList> getListById(String id) {
        return listRepository.findById(id)
                .map(this::copyListDetails);
    }

    /**
     * Create a new list for a project
     */
    public ProjectList createList(ProjectList list, String projectId) {
        // Validate that the project exists
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + projectId));

        // Generate ID if not provided
        if (list.getId() == null || list.getId().isEmpty()) {
            list.setId(UUID.randomUUID().toString());
        }

        // Set created date if not provided
        if (list.getCreatedDate() == null) {
            list.setCreatedDate(LocalDateTime.now());
        }

        // Set the project
        list.setProject(project);

        return listRepository.save(list);
    }

    /**
     * Update an existing list
     */
    public ProjectList updateList(String id, ProjectList listDetails) {
        ProjectList list = listRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("List not found with id: " + id));

        // Update fields
        if (listDetails.getName() != null) {
            list.setName(listDetails.getName());
        }
        if (listDetails.getDescription() != null) {
            list.setDescription(listDetails.getDescription());
        }
        if (listDetails.getCompletedDate() != null) {
            list.setCompletedDate(listDetails.getCompletedDate());
        }

        return listRepository.save(list);
    }

    /**
     * Delete a list and all its associated tasks
     */
    public void deleteList(String id) {
        if (!listRepository.existsById(id)) {
            throw new IllegalArgumentException("List not found with id: " + id);
        }

        // First, delete all tasks associated with the list
        List<Task> listTasks = taskRepository.findByListId(id);
        if (!listTasks.isEmpty()) {
            taskRepository.deleteAll(listTasks);
        }

        // Then delete the list
        listRepository.deleteById(id);
    }
}
