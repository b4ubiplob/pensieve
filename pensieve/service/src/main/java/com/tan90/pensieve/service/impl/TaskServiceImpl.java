package com.tan90.pensieve.service.impl;

import com.tan90.pensieve.persistence.DaoFactory;
import com.tan90.pensieve.persistence.DaoType;
import com.tan90.pensieve.persistence.dao.ProjectDao;
import com.tan90.pensieve.persistence.dao.TaskDao;
import com.tan90.pensieve.persistence.dao.UserDao;
import com.tan90.pensieve.persistence.entities.TProject;
import com.tan90.pensieve.persistence.entities.TTask;
import com.tan90.pensieve.persistence.entities.TUser;
import com.tan90.pensieve.service.TaskService;
import com.tan90.pensieve.to.Task;
import com.tan90.pensieve.to.converters.TaskConverter;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class TaskServiceImpl implements TaskService {

    private TaskDao taskDao;
    private UserDao userDao;
    private ProjectDao projectDao;

    public TaskServiceImpl() {
        super();
        taskDao = (TaskDao) DaoFactory.getDao(DaoType.TASK);
        userDao = (UserDao) DaoFactory.getDao(DaoType.USER);
        projectDao = (ProjectDao) DaoFactory.getDao(DaoType.PROJECT);
    }

    public Task createTask(String userId, String projectId, Task task) {
        TTask tTask = TaskConverter.getTTask(task);
        tTask.setCreatedDate(new Date());
        TUser tUser = userDao.get(userId);
        tTask.setCreatedBy(tUser);
        TProject tProject = projectDao.get(projectId);
        tTask.setTProject(tProject);
        return saveTask(tTask);
    }

    private Task saveTask(TTask tTask) {
        TTask savedTask = taskDao.save(tTask);
        if (savedTask != null) {
            return TaskConverter.getTask(savedTask);
        }
        return null;
    }

    public Task createSubTask(String userId, String taskId, Task task) {
        TTask tTask = TaskConverter.getTTask(task);
        tTask.setCreatedDate(new Date());
        TUser tUser = userDao.get(userId);
        tTask.setCreatedBy(tUser);
        TTask parentTask = taskDao.get(taskId);
        tTask.setTProject(parentTask.getTProject());
        tTask.setParentTask(parentTask);
        return saveTask(tTask);
    }

    public void deleteTask(String id) {
        TTask tTask = taskDao.get(id);
        List<TTask> subTasks = tTask.getSubTasks();
        if (subTasks != null && !subTasks.isEmpty()) {
            for (TTask subTask : subTasks) {
                taskDao.delete(subTask.getId());
            }
        }
        taskDao.delete(id);
    }

    public List<Task> getAllTasksOfProject(String projectId) {
        List<TTask> tTasks = projectDao.getAllTasks(projectId);
        List<Task> tasks = new ArrayList<>();
        for (TTask tTask : tTasks) {
            if (tTask.getParentTask() == null) {
                tasks.add(TaskConverter.getTask(tTask));
            }
        }
        return tasks;
    }

    public List<Task> getAllSubTasks(String taskId) {
        TTask tTask = taskDao.get(taskId);
        List<Task> subTasks = new ArrayList<>();
        for (TTask subTask : tTask.getSubTasks()) {
            subTasks.add(TaskConverter.getTask(subTask));
        }
        return subTasks;
    }
}
