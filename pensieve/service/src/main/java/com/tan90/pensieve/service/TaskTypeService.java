package com.tan90.pensieve.service;

import com.tan90.pensieve.to.TaskType;

import java.util.List;

public interface TaskTypeService {

    public TaskType createTaskType(TaskType taskType);

    public boolean isTaskTypeTableInitialized();

    public List<TaskType> getAllTaskTypes();

}


