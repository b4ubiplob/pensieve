package com.tan90.pensieve.service.impl;

import com.tan90.pensieve.persistence.DaoFactory;
import com.tan90.pensieve.persistence.DaoType;
import com.tan90.pensieve.persistence.dao.TaskTypeDao;
import com.tan90.pensieve.persistence.entities.TTasktype;
import com.tan90.pensieve.service.TaskTypeService;
import com.tan90.pensieve.to.TaskType;
import com.tan90.pensieve.to.converters.TaskTypeConverter;

import java.util.ArrayList;
import java.util.List;

public class TaskTypeServiceImpl implements TaskTypeService {

    private TaskTypeDao taskTypeDao;

    public TaskTypeServiceImpl() {
        super();
        taskTypeDao = (TaskTypeDao) DaoFactory.getDao(DaoType.TASKTYPE);
    }

    public TaskType createTaskType(TaskType taskType) {
        TTasktype tTasktype = TaskTypeConverter.getTTaskType(taskType);
        TTasktype savedTaskType = taskTypeDao.save(tTasktype);
        if (savedTaskType != null) {
            return TaskTypeConverter.getTaskType(tTasktype);
        }
        return null;
    }

    public boolean isTaskTypeTableInitialized() {
        return taskTypeDao.getCount() > 0;
    }

    public List<TaskType> getAllTaskTypes() {
        List<TTasktype> tTasktypes = taskTypeDao.getAll();
        List<TaskType> taskTypes = new ArrayList<>();
        for (TTasktype tTasktype : tTasktypes) {
            taskTypes.add(TaskTypeConverter.getTaskType(tTasktype));
        }
        return taskTypes;
    }
}
