package com.tan90.projects.pensieve.service;

import com.tan90.projects.pensieve.entity.Project;
import com.tan90.projects.pensieve.entity.ProjectList;
import com.tan90.projects.pensieve.entity.Task;
import com.tan90.projects.pensieve.entity.User;
import com.tan90.projects.pensieve.parser.TrelloJsonParser;
import com.tan90.projects.pensieve.repository.ListRepository;
import com.tan90.projects.pensieve.repository.ProjectRepository;
import com.tan90.projects.pensieve.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TrelloMigrationService {

    private static final String USER_EMAIL = "b4ubiplob@gmail.com";
    private static final String PROJECT_NAME = "entertainment";
    private static final String LIST_NAME_BOOKS = "books";
    private static final String LIST_NAME_MOVIES = "movies";
    private static final String LIST_NAME_PERSONAL = "personal";
    private static final String LIST_NAME_TV_SHOWS = "tv shows";


    private static final String BOOKS_JSON_FILE_PATH = "/trello/books.json";
    private static final String MOVIES_JSON_FILE_PATH = "/trello/movies.json";
    private static final String PERSONAL_JSON_FILE_PATH = "/trello/tasks.json";
    private static final String TV_SHOWS_JSON_FILE_PATH = "/trello/tv_shows.json";


    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ListRepository listRepository;

    @Autowired
    private TaskService taskService;

    @Autowired
    private TrelloJsonParser trelloJsonParser;

    public void migrateMoviesFromJson() {
        List<Task> tasks = trelloJsonParser.getTasksForMovies(MOVIES_JSON_FILE_PATH);
        saveTasks(tasks, LIST_NAME_MOVIES);
    }

    private void saveTasks(List<Task> tasks, String listName) {
        try {
            // Parse tasks from JSON file using the parser

            if (tasks.isEmpty()) {
                System.out.println("No tasks found in the JSON file.");
                return;
            }

            System.out.println("Parsed " + tasks.size() + " tasks from JSON file.");

            // Get or create the user
            User user = getOrCreateUser();

            // Get or create the project
            Project project = getOrCreateProject(user);

            // Get or create the list
            ProjectList list = getOrCreateList(project, listName);

            // Save all tasks to the database
            int taskCount = 0;
            int subtaskCount = 0;
            for (Task task : tasks) {
                try {
                    // Save the parent task first (without subtasks to avoid cascade issues)
                    java.util.Set<Task> subtasks = task.getSubTasks();
                    task.setSubTasks(null); // Temporarily remove subtasks

                    taskService.createTaskForList(task, list.getId());
                    taskCount++;
                    System.out.println("Created task: " + task.getTitle() + " (Status: " + task.getStatus() + ")");

                    // Now save subtasks if they exist
                    if (subtasks != null && !subtasks.isEmpty()) {
                        for (Task subtask : subtasks) {
                            try {
                                taskService.createSubTask(subtask, task.getId());
                                subtaskCount++;
                                System.out.println("  Created subtask: " + subtask.getTitle() + " (Status: " + subtask.getStatus() + ")");
                            } catch (Exception e) {
                                System.err.println("  Error creating subtask: " + subtask.getTitle() + " - " + e.getMessage());
                            }
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Error creating task: " + task.getTitle() + " - " + e.getMessage());
                    e.printStackTrace();
                }
            }

            System.out.println("\nMigration completed successfully!");
            System.out.println("Total tasks created: " + taskCount);
            System.out.println("Total subtasks created: " + subtaskCount);

        } catch (Exception e) {
            System.err.println("Migration failed: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Migration failed", e);
        }
    }

    public void migrateBooksFromJson() {
        List<Task> tasks = trelloJsonParser.getTasksForBooks(BOOKS_JSON_FILE_PATH);
        saveTasks(tasks, LIST_NAME_BOOKS);
    }

    public void migratePersonalTasksFromJson() {
        List<Task> tasks = trelloJsonParser.getTasksForPersonalTasks(PERSONAL_JSON_FILE_PATH);
        saveTasks(tasks, LIST_NAME_PERSONAL);
    }

    public void migrateTVShowsFromJson() {
        List<Task> tasks = trelloJsonParser.getTasksForTVShows(TV_SHOWS_JSON_FILE_PATH);
        saveTasks(tasks, LIST_NAME_TV_SHOWS);
    }

    private User getOrCreateUser() {
        Optional<User> existingUser = userRepository.findByEmail(USER_EMAIL);

        if (existingUser.isPresent()) {
            System.out.println("Found existing user: " + USER_EMAIL);
            return existingUser.get();
        }

        // Create new user
        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setEmail(USER_EMAIL);
        user.setName("Biplob Ghosh");
        user.setUsername("biplobghosh");
        user = userRepository.save(user);

        System.out.println("Created new user: " + USER_EMAIL);
        return user;
    }

    private Project getOrCreateProject(User user) {
        // Find project by name for this user
        Optional<Project> existingProject = projectRepository.findByUserId(user.getId())
                .stream()
                .filter(p -> PROJECT_NAME.equalsIgnoreCase(p.getName()))
                .findFirst();

        if (existingProject.isPresent()) {
            System.out.println("Found existing project: " + PROJECT_NAME);
            return existingProject.get();
        }

        // Create new project
        Project project = new Project();
        project.setId(UUID.randomUUID().toString());
        project.setName(PROJECT_NAME);
        project.setDescription("Entertainment project for books, movies, and more");
        project.setCreatedDate(LocalDateTime.now());
        project.setUser(user);
        project = projectRepository.save(project);

        System.out.println("Created new project: " + PROJECT_NAME);
        return project;
    }

    private ProjectList getOrCreateList(Project project, String listName) {
        // Find list by name for this project
        Optional<ProjectList> existingList = listRepository.findByProjectId(project.getId())
                .stream()
                .filter(l -> listName.equalsIgnoreCase(l.getName()))
                .findFirst();

        if (existingList.isPresent()) {
            System.out.println("Found existing list: " + listName);
            return existingList.get();
        }

        // Create new list
        ProjectList list = new ProjectList();
        list.setId(UUID.randomUUID().toString());
        list.setName(listName);
        list.setDescription("Books to read and completed");
        list.setCreatedDate(LocalDateTime.now());
        list.setProject(project);
        list = listRepository.save(list);

        System.out.println("Created new list: " + listName);
        return list;
    }


}
