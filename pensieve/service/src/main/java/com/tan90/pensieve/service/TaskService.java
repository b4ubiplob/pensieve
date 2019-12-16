package com.tan90.pensieve.service;

import com.tan90.pensieve.to.Task;

import java.util.List;

public interface TaskService {

    public Task createTask(String userId, String projectId, Task task);

    public Task createSubTask(String userId, String taskId, Task task);

    public void deleteTask(String id);

    public List<Task> getAllTasksOfProject(String projectId);

    public List<Task> getAllSubTasks(String taskId);


}
