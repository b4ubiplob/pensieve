package com.tan90.projects.pensieve.parser;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tan90.projects.pensieve.entity.Task;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Parser class for extracting book tasks from Trello JSON export files.
 */
@Component
public class TrelloJsonParser {

    private static final LocalDateTime DEFAULT_CREATED_DATE = LocalDateTime.of(2020, 1, 1, 0, 0);
    private final ObjectMapper objectMapper;

    public TrelloJsonParser() {
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Parse a JSON file and extract tasks for books.
     *
     * @param jsonFilePath Path to the JSON file (can be a filesystem path or classpath resource)
     * @return List of Task objects parsed from the JSON
     */
    public List<Task> getTasksForBooks(String jsonFilePath) {
        try {
            JsonNode rootNode = loadJsonFile(jsonFilePath);
            return parseTasksFromJson(rootNode);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse tasks from JSON file: " + jsonFilePath, e);
        }
    }

    /**
     * Parse a JSON file from an InputStream and extract tasks for books.
     *
     * @param inputStream InputStream containing the JSON data
     * @return List of Task objects parsed from the JSON
     */
    public List<Task> getTasksForBooks(InputStream inputStream) {
        try {
            JsonNode rootNode = objectMapper.readTree(inputStream);
            return parseTasksFromJson(rootNode);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse tasks from InputStream", e);
        }
    }

    /**
     * Parse a JSON file and extract tasks for movies.
     *
     * @param jsonFilePath Path to the JSON file (can be a filesystem path or classpath resource)
     * @return List of Task objects parsed from the JSON
     */
    public List<Task> getTasksForMovies(String jsonFilePath) {
        try {
            JsonNode rootNode = loadJsonFile(jsonFilePath);
            return parseTasksFromJsonForMovies(rootNode);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse tasks from JSON file: " + jsonFilePath, e);
        }
    }

    /**
     * Parse a JSON file from an InputStream and extract tasks for movies.
     *
     * @param inputStream InputStream containing the JSON data
     * @return List of Task objects parsed from the JSON
     */
    public List<Task> getTasksForMovies(InputStream inputStream) {
        try {
            JsonNode rootNode = objectMapper.readTree(inputStream);
            return parseTasksFromJsonForMovies(rootNode);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse tasks from InputStream", e);
        }
    }

    public List<Task> getTasksForPersonalTasks(String personalTasksJsonFilePath) {
        try {
            JsonNode rootNode = loadJsonFile(personalTasksJsonFilePath);
            return parseTasksFromJsonForPersonalTasks(rootNode);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse tasks from InputStream", e);
        }
    }

    /**
     * Parse a JSON file and extract tasks for TV shows with checklists as subtasks.
     *
     * @param jsonFilePath Path to the JSON file (can be a filesystem path or classpath resource)
     * @return List of Task objects parsed from the JSON
     */
    public List<Task> getTasksForTVShows(String jsonFilePath) {
        try {
            JsonNode rootNode = loadJsonFile(jsonFilePath);
            return parseTasksFromJsonForTVShows(rootNode);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse tasks from JSON file: " + jsonFilePath, e);
        }
    }

    /**
     * Load JSON from a file path (tries classpath first, then filesystem).
     */
    private JsonNode loadJsonFile(String jsonFilePath) throws Exception {
        // First, try to load from classpath
        InputStream inputStream = getClass().getResourceAsStream(jsonFilePath);

        if (inputStream != null) {
            return objectMapper.readTree(inputStream);
        }

        // If not found in classpath, try filesystem
        File file = new File(jsonFilePath);
        if (file.exists()) {
            return objectMapper.readTree(file);
        }

        throw new RuntimeException("JSON file not found: " + jsonFilePath);
    }

    /**
     * Parse tasks from the JSON root node.
     */
    private List<Task> parseTasksFromJson(JsonNode rootNode) {
        List<Task> tasks = new ArrayList<>();

        // First, build a map of list IDs to list names
        Map<String, String> listIdToNameMap = buildListIdToNameMap(rootNode);

        // Get the cards array
        JsonNode cardsArray = rootNode.get("cards");
        if (cardsArray == null || !cardsArray.isArray()) {
            throw new RuntimeException("No cards array found in JSON");
        }

        // Parse each card into a task
        for (JsonNode card : cardsArray) {
            try {
                Task task = parseTaskFromCard(card, listIdToNameMap, this::mapListNameToStatusForBooks);
                if (task != null) {
                    tasks.add(task);
                }
            } catch (Exception e) {
                System.err.println("Warning: Failed to parse task from card: " + e.getMessage());
            }
        }

        return tasks;
    }

    public List<Task> parseTasksFromJsonForPersonalTasks(JsonNode rootNode){
        List<Task> tasks = new ArrayList<>();
        // First, build a map of list IDs to list names
        Map<String, String> listIdToNameMap = buildListIdToNameMap(rootNode);
        // Get the cards array
        JsonNode cardsArray = rootNode.get("cards");
        if (cardsArray == null || !cardsArray.isArray()) {
            throw new RuntimeException("No cards array found in JSON");
        }

        // Parse each card into a task
        for (JsonNode card : cardsArray) {
            try {
                Task task = parseTaskFromCard(card, listIdToNameMap, this::mapListNameToStatusForPersonalTasks);
                if (task != null) {
                    tasks.add(task);
                }
            } catch (Exception e) {
                System.err.println("Warning: Failed to parse task from card: " + e.getMessage());
            }
        }

        return tasks;

    }



    /**
     * Parse tasks from the JSON root node for movies.
     */
    private List<Task> parseTasksFromJsonForMovies(JsonNode rootNode) {
        List<Task> tasks = new ArrayList<>();

        // First, build a map of list IDs to list names
        Map<String, String> listIdToNameMap = buildListIdToNameMap(rootNode);

        // Get the cards array
        JsonNode cardsArray = rootNode.get("cards");
        if (cardsArray == null || !cardsArray.isArray()) {
            throw new RuntimeException("No cards array found in JSON");
        }

        // Parse each card into a task
        for (JsonNode card : cardsArray) {
            try {
                Task task = parseTaskFromCard(card, listIdToNameMap, this::mapListNameToStatusForMovies);
                if (task != null) {
                    tasks.add(task);
                }
            } catch (Exception e) {
                System.err.println("Warning: Failed to parse task from card: " + e.getMessage());
            }
        }

        return tasks;
    }

    /**
     * Parse tasks from the JSON root node for TV shows with checklists as subtasks.
     */
    private List<Task> parseTasksFromJsonForTVShows(JsonNode rootNode) {
        List<Task> tasks = new ArrayList<>();

        // First, build a map of list IDs to list names
        Map<String, String> listIdToNameMap = buildListIdToNameMap(rootNode);

        // Build a map of card IDs to their checklists
        Map<String, List<JsonNode>> cardIdToChecklistsMap = buildCardIdToChecklistsMap(rootNode);

        // Get the cards array
        JsonNode cardsArray = rootNode.get("cards");
        if (cardsArray == null || !cardsArray.isArray()) {
            throw new RuntimeException("No cards array found in JSON");
        }

        // Parse each card into a task with subtasks from checklists
        for (JsonNode card : cardsArray) {
            try {
                Task task = parseTaskFromCardWithSubtasks(card, listIdToNameMap, cardIdToChecklistsMap, this::mapListNameToStatusForMovies);
                if (task != null) {
                    tasks.add(task);
                }
            } catch (Exception e) {
                System.err.println("Warning: Failed to parse task from card: " + e.getMessage());
                e.printStackTrace();
            }
        }

        return tasks;
    }

    /**
     * Build a map of card IDs to their checklists from the checklists array.
     */
    private Map<String, List<JsonNode>> buildCardIdToChecklistsMap(JsonNode rootNode) {
        Map<String, List<JsonNode>> cardIdToChecklistsMap = new HashMap<>();

        JsonNode checklistsArray = rootNode.get("checklists");
        if (checklistsArray != null && checklistsArray.isArray()) {
            for (JsonNode checklist : checklistsArray) {
                String idCard = getTextValue(checklist, "idCard");
                if (idCard != null) {
                    cardIdToChecklistsMap.computeIfAbsent(idCard, k -> new ArrayList<>()).add(checklist);
                }
            }
        }

        return cardIdToChecklistsMap;
    }

    /**
     * Parse a single task from a card node with subtasks from checklists.
     */
    private Task parseTaskFromCardWithSubtasks(JsonNode card, Map<String, String> listIdToNameMap,
                                               Map<String, List<JsonNode>> cardIdToChecklistsMap,
                                               StatusMapper statusMapper) {
        // Extract card name
        String title = getTextValue(card, "name");
        if (title == null || title.isEmpty()) {
            return null;
        }

        Task task = new Task();
        task.setTitle(title);

        // Extract idList and map to status
        String idList = getTextValue(card, "idList");
        String listName = listIdToNameMap.get(idList);
        Task.Status status = statusMapper.mapStatus(listName);
        task.setStatus(status);

        // Set created date to 1st January 2020
        task.setCreatedDate(DEFAULT_CREATED_DATE);

        // Set completed date if status is COMPLETED
        if (status == Task.Status.COMPLETED) {
            String dateLastActivity = getTextValue(card, "dateLastActivity");
            if (dateLastActivity != null) {
                LocalDateTime completedDate = parseIsoDateTime(dateLastActivity);
                task.setCompletedDate(completedDate);
            }
        }

        // Parse checklists as subtasks
        String cardId = getTextValue(card, "id");
        List<JsonNode> checklists = cardIdToChecklistsMap.get(cardId);
        if (checklists != null) {
            Set<Task> subtasks = new HashSet<>();
            for (JsonNode checklist : checklists) {
                JsonNode checkItems = checklist.get("checkItems");
                if (checkItems != null && checkItems.isArray()) {
                    for (JsonNode checkItem : checkItems) {
                        Task subtask = parseSubtaskFromCheckItem(checkItem);
                        if (subtask != null) {
                            subtasks.add(subtask);
                        }
                    }
                }
            }
            if (!subtasks.isEmpty()) {
                task.setSubTasks(subtasks);
            }
        }

        return task;
    }

    /**
     * Parse a subtask from a checklist checkItem.
     */
    private Task parseSubtaskFromCheckItem(JsonNode checkItem) {
        String name = getTextValue(checkItem, "name");
        if (name == null || name.isEmpty()) {
            return null;
        }

        Task subtask = new Task();
        subtask.setTitle(name);

        // Map state to status: complete -> COMPLETED, incomplete -> CREATED
        String state = getTextValue(checkItem, "state");
        if ("complete".equalsIgnoreCase(state)) {
            subtask.setStatus(Task.Status.COMPLETED);
        } else {
            subtask.setStatus(Task.Status.CREATED);
        }

        subtask.setCreatedDate(DEFAULT_CREATED_DATE);

        return subtask;
    }

    /**
     * Build a map of list IDs to list names from the lists array.
     */
    private Map<String, String> buildListIdToNameMap(JsonNode rootNode) {
        Map<String, String> listIdToNameMap = new HashMap<>();

        JsonNode listsArray = rootNode.get("lists");
        if (listsArray != null && listsArray.isArray()) {
            for (JsonNode list : listsArray) {
                String listId = getTextValue(list, "id");
                String listName = getTextValue(list, "name");
                if (listId != null && listName != null) {
                    listIdToNameMap.put(listId, listName);
                }
            }
        }

        return listIdToNameMap;
    }

    /**
     * Parse a single task from a card node.
     */
    private Task parseTaskFromCard(JsonNode card, Map<String, String> listIdToNameMap, StatusMapper statusMapper) {
        // Extract card name
        String title = getTextValue(card, "name");
        if (title == null || title.isEmpty()) {
            return null;
        }

        Task task = new Task();
        task.setTitle(title);

        // Extract idList and map to status
        String idList = getTextValue(card, "idList");
        String listName = listIdToNameMap.get(idList);
        Task.Status status = statusMapper.mapStatus(listName);
        task.setStatus(status);

        // Set created date to 1st January 2020
        task.setCreatedDate(DEFAULT_CREATED_DATE);

        // Set completed date if status is COMPLETED
        if (status == Task.Status.COMPLETED) {
            String dateLastActivity = getTextValue(card, "dateLastActivity");
            if (dateLastActivity != null) {
                LocalDateTime completedDate = parseIsoDateTime(dateLastActivity);
                task.setCompletedDate(completedDate);
            }
        }

        return task;
    }



    /**
     * Functional interface for status mapping strategy.
     */
    @FunctionalInterface
    private interface StatusMapper {
        Task.Status mapStatus(String listName);
    }

    /**
     * Get text value from a JSON node by field name.
     */
    private String getTextValue(JsonNode node, String fieldName) {
        JsonNode fieldNode = node.get(fieldName);
        return fieldNode != null ? fieldNode.asText() : null;
    }

    /**
     * Parse ISO 8601 date string to LocalDateTime.
     */
    private LocalDateTime parseIsoDateTime(String dateString) {
        try {
            ZonedDateTime zonedDateTime = ZonedDateTime.parse(dateString, DateTimeFormatter.ISO_DATE_TIME);
            return zonedDateTime.toLocalDateTime();
        } catch (Exception e) {
            System.err.println("Error parsing date: " + dateString + " - " + e.getMessage());
            return null;
        }
    }

    private Task.Status mapListNameToStatusForPersonalTasks(String listName) {
        if (listName == null) {
            return Task.Status.CREATED;
        }

        String normalizedListName = listName.toLowerCase().trim();

        if (normalizedListName.equals("not started")) {
            return Task.Status.CREATED;
        } else if (normalizedListName.equals("done")) {
            return Task.Status.COMPLETED;
        } else if (normalizedListName.equals("in progress")) {
            return Task.Status.IN_PROGRESS;
        }
        else {
            return Task.Status.BLOCKED;
        }
    }

    /**
     * Map list name to task status for books.
     * Mapping: "to read" -> CREATED, "finished" -> COMPLETED, "reading" -> IN_PROGRESS
     */
    private Task.Status mapListNameToStatusForBooks(String listName) {
        if (listName == null) {
            return Task.Status.CREATED;
        }

        String normalizedListName = listName.toLowerCase().trim();

        if (normalizedListName.equals("to read")) {
            return Task.Status.CREATED;
        } else if (normalizedListName.equals("finished")) {
            return Task.Status.COMPLETED;
        } else if (normalizedListName.equals("reading")) {
            return Task.Status.IN_PROGRESS;
        }
        else {
            return Task.Status.BLOCKED;
        }
    }

    /**
     * Map list name to task status for movies.
     * Mapping: "not started" -> CREATED, "in progress" -> IN_PROGRESS, "done" -> COMPLETED, "paused" -> BLOCKED
     */
    private Task.Status mapListNameToStatusForMovies(String listName) {
        if (listName == null) {
            return Task.Status.CREATED;
        }

        String normalizedListName = listName.toLowerCase().trim();

        if (normalizedListName.equals("not started")) {
            return Task.Status.CREATED;
        } else if (normalizedListName.equals("in progress")) {
            return Task.Status.IN_PROGRESS;
        } else if (normalizedListName.equals("done")) {
            return Task.Status.COMPLETED;
        } else if (normalizedListName.equals("paused")) {
            return Task.Status.BLOCKED;
        } else {
            return Task.Status.BLOCKED;
        }
    }

    public static void main(String[] args) {
        TrelloJsonParser trelloJsonParser = new TrelloJsonParser();
        List<Task> tasks = trelloJsonParser.getTasksForMovies("/trello/movies.json");
        int i = 1;
        for  (Task task : tasks) {
            System.out.println(task.getTitle() + "--->" + i++);
        }
        // Count tasks per status
        Map<Task.Status, Integer> statusCount = new HashMap<>();
        for (Task task : tasks) {
            Task.Status status = task.getStatus();
            statusCount.put(status, statusCount.getOrDefault(status, 0) + 1);
        }
        System.out.println("\nNumber of tasks per status:");
        for (Task.Status status : Task.Status.values()) {
            int count = statusCount.getOrDefault(status, 0);
            System.out.println(status + ": " + count);
        }
    }
}
