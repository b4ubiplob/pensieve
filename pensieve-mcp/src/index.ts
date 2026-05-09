import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  listProjects, listProjectsSchema,
  getProject, getProjectSchema,
  createProject, createProjectSchema,
  updateProject, updateProjectSchema,
  deleteProject, deleteProjectSchema,
  listProjectLists, listProjectListsSchema,
  createList, createListSchema,
  updateList, updateListSchema,
  deleteList, deleteListSchema,
  listTasks, listTasksSchema,
  getTask, getTaskSchema,
  createTask, createTaskSchema,
  createSubtask, createSubtaskSchema,
  updateTask, updateTaskSchema,
  deleteTask, deleteTaskSchema,
  listTasksByStatus, listTasksByStatusSchema,
  getTaskDuration, getTaskDurationSchema,
  getTasksByDate, getTasksByDateSchema,
  getTasksByDateRange, getTasksByDateRangeSchema,
} from "./tools.js";

const server = new McpServer({
  name: "pensieve",
  version: "1.0.0",
});

// ─── Project Tools ───────────────────────────────────────────────────────────

server.tool(
  "list_projects",
  "List all projects for the authenticated user. Returns project IDs, names, descriptions, and dates.",
  listProjectsSchema.shape,
  listProjects
);

server.tool(
  "get_project",
  "Get details of a specific project by its ID.",
  getProjectSchema.shape,
  getProject
);

server.tool(
  "create_project",
  "Create a new project for the authenticated user.",
  createProjectSchema.shape,
  createProject
);

server.tool(
  "update_project",
  "Update an existing project's name or description.",
  updateProjectSchema.shape,
  updateProject
);

server.tool(
  "delete_project",
  "Delete a project and all its lists and tasks. This action is irreversible.",
  deleteProjectSchema.shape,
  deleteProject
);

// ─── List Tools ──────────────────────────────────────────────────────────────

server.tool(
  "list_project_lists",
  "Get all lists within a specific project. Lists are ordered containers for tasks (like Trello columns).",
  listProjectListsSchema.shape,
  listProjectLists
);

server.tool(
  "create_list",
  "Create a new list (column) in a project.",
  createListSchema.shape,
  createList
);

server.tool(
  "update_list",
  "Update an existing list's name or description.",
  updateListSchema.shape,
  updateList
);

server.tool(
  "delete_list",
  "Delete a list and all its tasks. This action is irreversible.",
  deleteListSchema.shape,
  deleteList
);

// ─── Task Tools ──────────────────────────────────────────────────────────────

server.tool(
  "list_tasks",
  "Get all tasks in a specific list. Returns task IDs, titles, status, priority, and dates.",
  listTasksSchema.shape,
  listTasks
);

server.tool(
  "get_task",
  "Get detailed information about a task, including its subtasks.",
  getTaskSchema.shape,
  getTask
);

server.tool(
  "create_task",
  "Create a new task in a list. Status values: CREATED (To Do), IN_PROGRESS, COMPLETED, BLOCKED, PAUSED. Priority values: LOW, MEDIUM, HIGH, URGENT.",
  createTaskSchema.shape,
  createTask
);

server.tool(
  "create_subtask",
  "Create a subtask under an existing parent task.",
  createSubtaskSchema.shape,
  createSubtask
);

server.tool(
  "update_task",
  "Update a task's title, description, status, priority, or due date. Status values: CREATED, IN_PROGRESS, COMPLETED, BLOCKED, PAUSED. Priority values: LOW, MEDIUM, HIGH, URGENT.",
  updateTaskSchema.shape,
  updateTask
);

server.tool(
  "delete_task",
  "Delete a task and all its subtasks. This action is irreversible.",
  deleteTaskSchema.shape,
  deleteTask
);

server.tool(
  "list_tasks_by_status",
  "Get all tasks for the authenticated user filtered by status. Useful for finding all in-progress or blocked tasks across all projects.",
  listTasksByStatusSchema.shape,
  listTasksByStatus
);

// ─── Analytics Tools ─────────────────────────────────────────────────────────

server.tool(
  "get_task_duration",
  "Get time tracking information for a task: how long it was in progress, status history with timestamps.",
  getTaskDurationSchema.shape,
  getTaskDuration
);

server.tool(
  "get_tasks_by_date",
  "Get all tasks that had activity (status changes) on a specific date. Useful for daily standup summaries.",
  getTasksByDateSchema.shape,
  getTasksByDate
);

server.tool(
  "get_tasks_by_date_range",
  "Get all tasks that had activity within a date range. Useful for weekly/sprint reports.",
  getTasksByDateRangeSchema.shape,
  getTasksByDateRange
);

// ─── Start Server ────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  process.stderr.write(`Fatal error: ${error}\n`);
  process.exit(1);
});
