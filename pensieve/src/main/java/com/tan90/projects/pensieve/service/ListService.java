package com.tan90.projects.pensieve.service;

import com.tan90.projects.pensieve.dto.ListReorderRequest;
import com.tan90.projects.pensieve.dto.ProjectListDto;
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
import java.util.*;
import java.util.stream.Collectors;

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

    // DTO Mapper
    private ProjectListDto toProjectListDto(ProjectList list) {
        if (list == null) return null;

        ProjectListDto dto = new ProjectListDto();
        dto.setId(list.getId());
        dto.setName(list.getName());
        dto.setDescription(list.getDescription());
        dto.setCreatedDate(list.getCreatedDate());
        dto.setCompletedDate(list.getCompletedDate());
        dto.setDisplayOrder(list.getDisplayOrder());

        return dto;
    }

    /**
     * Get all lists for a specific project
     */
    public List<ProjectListDto> getListsByProjectId(String projectId) {
        List<ProjectList> lists = listRepository.findByProjectIdOrderByDisplayOrder(projectId);
        return lists.stream().map(this::toProjectListDto).toList();
    }

    /**
     * Get a single list by ID
     */
    public Optional<ProjectListDto> getListById(String id) {
        return listRepository.findById(id)
                .map(this::toProjectListDto);
    }

    /**
     * Create a new list for a project
     */
    public ProjectListDto createList(ProjectList list, String projectId) {
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

        // Assign position at end of list
        Integer maxOrder = listRepository.findMaxDisplayOrderByProjectId(projectId);
        list.setDisplayOrder(maxOrder == null ? 1000 : maxOrder + 1000);

        // Set the project
        list.setProject(project);

        ProjectList savedList = listRepository.save(list);
        return toProjectListDto(savedList);
    }

    /**
     * Update an existing list
     */
    public ProjectListDto updateList(String id, ProjectList listDetails) {
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

        ProjectList savedList = listRepository.save(list);
        return toProjectListDto(savedList);
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

    /**
     * Export a list with all its tasks
     */
    public Map<String, Object> exportList(String listId) {
        ProjectList list = listRepository.findById(listId)
                .orElseThrow(() -> new IllegalArgumentException("List not found with id: " + listId));

        Map<String, Object> exportData = new LinkedHashMap<>();
        exportData.put("id", list.getId());
        exportData.put("name", list.getName());
        exportData.put("description", list.getDescription());
        exportData.put("createdDate", list.getCreatedDate());
        exportData.put("completedDate", list.getCompletedDate());

        // Get all tasks for this list
        List<Task> tasks = taskRepository.findByListId(listId);

        // Build task hierarchy with subtasks
        List<Map<String, Object>> taskList = new ArrayList<>();
        Map<String, Map<String, Object>> taskMap = new HashMap<>();

        // First, create map entries for all tasks
        for (Task task : tasks) {
            Map<String, Object> taskData = new LinkedHashMap<>();
            taskData.put("id", task.getId());
            taskData.put("title", task.getTitle());
            taskData.put("description", task.getDescription());
            taskData.put("dueDate", task.getDueDate());
            taskData.put("reminderDate", task.getReminderDate());
            taskData.put("createdDate", task.getCreatedDate());
            taskData.put("completedDate", task.getCompletedDate());
            taskData.put("status", task.getStatus());
            taskData.put("priority", task.getPriority());
            taskData.put("parentTaskId", task.getParent() != null ? task.getParent().getId() : null);
            taskData.put("subTasks", new ArrayList<Map<String, Object>>());

            taskMap.put(task.getId(), taskData);

            // If it's a parent task, add to main list
            if (task.getParent() == null) {
                taskList.add(taskData);
            }
        }

        // Build subtask hierarchy
        for (Task task : tasks) {
            if (task.getParent() != null) {
                String parentId = task.getParent().getId();
                Map<String, Object> parentTaskData = taskMap.get(parentId);
                if (parentTaskData != null) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> subTasks = (List<Map<String, Object>>) parentTaskData.get("subTasks");
                    subTasks.add(taskMap.get(task.getId()));
                }
            }
        }

        exportData.put("tasks", taskList);
        exportData.put("exportedAt", LocalDateTime.now());

        return exportData;
    }

    /**
     * Import a list with all its tasks to a project
     */
    public ProjectListDto importList(Map<String, Object> importData, String projectId) {
        // Validate project exists
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + projectId));

        // Validate list name
        String listName = (String) importData.get("name");
        if (listName == null || listName.trim().isEmpty()) {
            throw new IllegalArgumentException("List name is required");
        }

        try {
            // Create the list
            ProjectList list = new ProjectList();
            list.setId(UUID.randomUUID().toString());
            list.setName(listName);
            list.setDescription((String) importData.get("description"));
            list.setCreatedDate(LocalDateTime.now());
            list.setProject(project);
            list = listRepository.save(list);

            // Import tasks if they exist
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> tasks = (List<Map<String, Object>>) importData.get("tasks");
            if (tasks != null && !tasks.isEmpty()) {
                Map<String, String> taskIdMap = new HashMap<>();

                // First pass: create all parent tasks
                for (Map<String, Object> taskData : tasks) {
                    String oldId = (String) taskData.get("id");
                    Task task = createTaskFromMap(taskData, list);
                    taskIdMap.put(oldId, task.getId());

                    // Process subtasks recursively
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> subTasks = (List<Map<String, Object>>) taskData.get("subTasks");
                    if (subTasks != null && !subTasks.isEmpty()) {
                        processSubTasks(subTasks, list, task, taskIdMap);
                    }
                }
            }

            return toProjectListDto(list);
        } catch (Exception e) {
            throw new RuntimeException("Failed to import list: " + e.getMessage(), e);
        }
    }

    private Task createTaskFromMap(Map<String, Object> taskData, ProjectList list) {
        Task task = new Task();
        task.setId(UUID.randomUUID().toString());
        task.setTitle((String) taskData.get("title"));
        task.setDescription((String) taskData.get("description"));
        task.setCreatedDate(LocalDateTime.now());
        task.setList(list);

        // Handle status
        String statusStr = (String) taskData.get("status");
        if (statusStr != null) {
            task.setStatus(Task.Status.valueOf(statusStr));
        }

        // Handle priority
        String priorityStr = (String) taskData.get("priority");
        if (priorityStr != null) {
            task.setPriority(Task.Priority.valueOf(priorityStr));
        }

        return taskRepository.save(task);
    }

    private void processSubTasks(List<Map<String, Object>> subTasks, ProjectList list, Task parentTask, Map<String, String> taskIdMap) {
        for (Map<String, Object> subTaskData : subTasks) {
            String oldId = (String) subTaskData.get("id");
            Task subTask = createTaskFromMap(subTaskData, list);
            subTask.setParent(parentTask);
            subTask = taskRepository.save(subTask);
            taskIdMap.put(oldId, subTask.getId());

            // Process nested subtasks recursively
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> nestedSubTasks = (List<Map<String, Object>>) subTaskData.get("subTasks");
            if (nestedSubTasks != null && !nestedSubTasks.isEmpty()) {
                processSubTasks(nestedSubTasks, list, subTask, taskIdMap);
            }
        }
    }

    /**
     * Reorder lists within a project
     */
    @Transactional
    public List<ProjectListDto> reorderLists(String projectId, List<ListReorderRequest> requests) {
        // Validate project exists
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));

        // Extract list IDs
        List<String> listIds = requests.stream()
                .map(ListReorderRequest::getListId)
                .collect(Collectors.toList());

        // Fetch all lists
        List<ProjectList> lists = listRepository.findAllById(listIds);

        if (lists.size() != listIds.size()) {
            throw new IllegalArgumentException("Some list IDs were not found");
        }

        // Verify all lists belong to the project
        boolean allBelongToProject = lists.stream()
                .allMatch(list -> list.getProject().getId().equals(projectId));

        if (!allBelongToProject) {
            throw new IllegalArgumentException("Some lists do not belong to the specified project");
        }

        // Update display orders
        Map<String, Integer> orderMap = requests.stream()
                .collect(Collectors.toMap(
                        ListReorderRequest::getListId,
                        ListReorderRequest::getDisplayOrder
                ));

        lists.forEach(list -> {
            Integer newOrder = orderMap.get(list.getId());
            if (newOrder != null) {
                list.setDisplayOrder(newOrder);
            }
        });

        // Save all changes
        listRepository.saveAll(lists);

        // Return updated lists in new order
        return getListsByProjectId(projectId);
    }
}
