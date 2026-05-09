import { z } from "zod";
import { get, post, put, del } from "./api-client.js";
import { getUserId } from "./auth.js";

// Tool result helper
function toolResult(content: string) {
  return { content: [{ type: "text" as const, text: content }] };
}

function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

function errorResult(error: string) {
  return toolResult(`Error: ${error}`);
}

// ─── Project Tools ───────────────────────────────────────────────────────────

export const listProjectsSchema = z.object({});

export async function listProjects() {
  const userId = await getUserId();
  const res = await get(`/api/v1/projects?userId=${userId}`);
  if (!res.ok) return errorResult(res.error || "Failed to list projects");
  return toolResult(formatJson(res.data));
}

export const getProjectSchema = z.object({
  projectId: z.string().describe("The ID of the project to retrieve"),
});

export async function getProject({ projectId }: z.infer<typeof getProjectSchema>) {
  const res = await get(`/api/v1/projects/${projectId}`);
  if (!res.ok) return errorResult(res.error || "Project not found");
  return toolResult(formatJson(res.data));
}

export const createProjectSchema = z.object({
  name: z.string().describe("Name of the project"),
  description: z.string().optional().describe("Description of the project"),
});

export async function createProject({ name, description }: z.infer<typeof createProjectSchema>) {
  const userId = await getUserId();
  const res = await post(`/api/v1/projects?userId=${userId}`, { name, description });
  if (!res.ok) return errorResult(res.error || "Failed to create project");
  return toolResult(formatJson(res.data));
}

export const updateProjectSchema = z.object({
  projectId: z.string().describe("The ID of the project to update"),
  name: z.string().optional().describe("New name for the project"),
  description: z.string().optional().describe("New description for the project"),
});

export async function updateProject({ projectId, name, description }: z.infer<typeof updateProjectSchema>) {
  const body: Record<string, unknown> = {};
  if (name !== undefined) body.name = name;
  if (description !== undefined) body.description = description;
  const res = await put(`/api/v1/projects/${projectId}`, body);
  if (!res.ok) return errorResult(res.error || "Failed to update project");
  return toolResult(formatJson(res.data));
}

export const deleteProjectSchema = z.object({
  projectId: z.string().describe("The ID of the project to delete"),
});

export async function deleteProject({ projectId }: z.infer<typeof deleteProjectSchema>) {
  const res = await del(`/api/v1/projects/${projectId}`);
  if (!res.ok) return errorResult(res.error || "Failed to delete project");
  return toolResult("Project deleted successfully.");
}

// ─── List Tools ──────────────────────────────────────────────────────────────

export const listProjectListsSchema = z.object({
  projectId: z.string().describe("The ID of the project to get lists for"),
});

export async function listProjectLists({ projectId }: z.infer<typeof listProjectListsSchema>) {
  const res = await get(`/api/v1/lists?projectId=${projectId}`);
  if (!res.ok) return errorResult(res.error || "Failed to list project lists");
  return toolResult(formatJson(res.data));
}

export const createListSchema = z.object({
  projectId: z.string().describe("The ID of the project to create the list in"),
  name: z.string().describe("Name of the list"),
  description: z.string().optional().describe("Description of the list"),
});

export async function createList({ projectId, name, description }: z.infer<typeof createListSchema>) {
  const res = await post(`/api/v1/lists?projectId=${projectId}`, { name, description });
  if (!res.ok) return errorResult(res.error || "Failed to create list");
  return toolResult(formatJson(res.data));
}

export const updateListSchema = z.object({
  listId: z.string().describe("The ID of the list to update"),
  name: z.string().optional().describe("New name for the list"),
  description: z.string().optional().describe("New description for the list"),
});

export async function updateList({ listId, name, description }: z.infer<typeof updateListSchema>) {
  const body: Record<string, unknown> = {};
  if (name !== undefined) body.name = name;
  if (description !== undefined) body.description = description;
  const res = await put(`/api/v1/lists/${listId}`, body);
  if (!res.ok) return errorResult(res.error || "Failed to update list");
  return toolResult(formatJson(res.data));
}

export const deleteListSchema = z.object({
  listId: z.string().describe("The ID of the list to delete"),
});

export async function deleteList({ listId }: z.infer<typeof deleteListSchema>) {
  const res = await del(`/api/v1/lists/${listId}`);
  if (!res.ok) return errorResult(res.error || "Failed to delete list");
  return toolResult("List deleted successfully.");
}

// ─── Task Tools ──────────────────────────────────────────────────────────────

export const listTasksSchema = z.object({
  listId: z.string().describe("The ID of the list to get tasks for"),
});

export async function listTasks({ listId }: z.infer<typeof listTasksSchema>) {
  const res = await get(`/api/v1/tasks?listId=${listId}`);
  if (!res.ok) return errorResult(res.error || "Failed to list tasks");
  return toolResult(formatJson(res.data));
}

export const getTaskSchema = z.object({
  taskId: z.string().describe("The ID of the task to retrieve (includes subtasks)"),
});

export async function getTask({ taskId }: z.infer<typeof getTaskSchema>) {
  const res = await get(`/api/v1/tasks/${taskId}`);
  if (!res.ok) return errorResult(res.error || "Task not found");
  return toolResult(formatJson(res.data));
}

const taskStatusEnum = z
  .enum(["CREATED", "IN_PROGRESS", "COMPLETED", "BLOCKED", "PAUSED"])
  .describe("Task status: CREATED (To Do), IN_PROGRESS, COMPLETED, BLOCKED, or PAUSED");

const taskPriorityEnum = z
  .enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
  .describe("Task priority level");

export const createTaskSchema = z.object({
  listId: z.string().describe("The ID of the list to create the task in"),
  title: z.string().describe("Title of the task"),
  description: z.string().optional().describe("Description of the task"),
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  dueDate: z.string().optional().describe("Due date in ISO format (e.g., 2024-03-15T10:00:00)"),
});

export async function createTask({
  listId,
  title,
  description,
  status,
  priority,
  dueDate,
}: z.infer<typeof createTaskSchema>) {
  const body: Record<string, unknown> = { title };
  if (description !== undefined) body.description = description;
  if (status !== undefined) body.status = status;
  if (priority !== undefined) body.priority = priority;
  if (dueDate !== undefined) body.dueDate = dueDate;
  const res = await post(`/api/v1/tasks?listId=${listId}`, body);
  if (!res.ok) return errorResult(res.error || "Failed to create task");
  return toolResult(formatJson(res.data));
}

export const createSubtaskSchema = z.object({
  parentTaskId: z.string().describe("The ID of the parent task"),
  title: z.string().describe("Title of the subtask"),
  description: z.string().optional().describe("Description of the subtask"),
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
});

export async function createSubtask({
  parentTaskId,
  title,
  description,
  status,
  priority,
}: z.infer<typeof createSubtaskSchema>) {
  const body: Record<string, unknown> = { title };
  if (description !== undefined) body.description = description;
  if (status !== undefined) body.status = status;
  if (priority !== undefined) body.priority = priority;
  const res = await post(`/api/v1/tasks?parentTaskId=${parentTaskId}`, body);
  if (!res.ok) return errorResult(res.error || "Failed to create subtask");
  return toolResult(formatJson(res.data));
}

export const updateTaskSchema = z.object({
  taskId: z.string().describe("The ID of the task to update"),
  title: z.string().optional().describe("New title for the task"),
  description: z.string().optional().describe("New description for the task"),
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  dueDate: z.string().optional().describe("New due date in ISO format (e.g., 2024-03-15T10:00:00)"),
});

export async function updateTask({
  taskId,
  title,
  description,
  status,
  priority,
  dueDate,
}: z.infer<typeof updateTaskSchema>) {
  const body: Record<string, unknown> = {};
  if (title !== undefined) body.title = title;
  if (description !== undefined) body.description = description;
  if (status !== undefined) body.status = status;
  if (priority !== undefined) body.priority = priority;
  if (dueDate !== undefined) body.dueDate = dueDate;
  const res = await put(`/api/v1/tasks/${taskId}`, body);
  if (!res.ok) return errorResult(res.error || "Failed to update task");
  return toolResult(formatJson(res.data));
}

export const deleteTaskSchema = z.object({
  taskId: z.string().describe("The ID of the task to delete"),
});

export async function deleteTask({ taskId }: z.infer<typeof deleteTaskSchema>) {
  const res = await del(`/api/v1/tasks/${taskId}`);
  if (!res.ok) return errorResult(res.error || "Failed to delete task");
  return toolResult("Task deleted successfully.");
}

export const listTasksByStatusSchema = z.object({
  status: taskStatusEnum.describe("Filter tasks by this status"),
});

export async function listTasksByStatus({ status }: z.infer<typeof listTasksByStatusSchema>) {
  const userId = await getUserId();
  const res = await get(`/api/v1/tasks?userId=${userId}&status=${status}`);
  if (!res.ok) return errorResult(res.error || "Failed to list tasks by status");
  return toolResult(formatJson(res.data));
}

// ─── Analytics Tools ─────────────────────────────────────────────────────────

export const getTaskDurationSchema = z.object({
  taskId: z.string().describe("The ID of the task to get duration info for"),
});

export async function getTaskDuration({ taskId }: z.infer<typeof getTaskDurationSchema>) {
  const res = await get(`/api/v1/analytics/task/${taskId}/duration`);
  if (!res.ok) return errorResult(res.error || "Failed to get task duration");
  return toolResult(formatJson(res.data));
}

export const getTasksByDateSchema = z.object({
  date: z.string().describe("Date in YYYY-MM-DD format (e.g., 2024-03-15)"),
});

export async function getTasksByDate({ date }: z.infer<typeof getTasksByDateSchema>) {
  const userId = await getUserId();
  const res = await get(`/api/v1/analytics/tasks/by-date?date=${date}&userId=${userId}`);
  if (!res.ok) return errorResult(res.error || "Failed to get tasks by date");
  return toolResult(formatJson(res.data));
}

export const getTasksByDateRangeSchema = z.object({
  startDate: z.string().describe("Start date in YYYY-MM-DD format"),
  endDate: z.string().describe("End date in YYYY-MM-DD format"),
});

export async function getTasksByDateRange({ startDate, endDate }: z.infer<typeof getTasksByDateRangeSchema>) {
  const userId = await getUserId();
  const res = await get(
    `/api/v1/analytics/tasks/by-range?startDate=${startDate}&endDate=${endDate}&userId=${userId}`
  );
  if (!res.ok) return errorResult(res.error || "Failed to get tasks by date range");
  return toolResult(formatJson(res.data));
}
