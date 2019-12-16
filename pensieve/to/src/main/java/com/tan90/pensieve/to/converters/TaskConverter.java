package com.tan90.pensieve.to.converters;

import com.tan90.pensieve.persistence.entities.TTask;
import com.tan90.pensieve.to.Task;

public class TaskConverter {

    private TaskConverter() {
    }

    public static Task getTask(TTask tTask) {
        Task task = new Task();
        task.setCreatedDate(tTask.getCreatedDate());
        task.setDescription(tTask.getDescription());
        task.setDueDate(tTask.getDuedate());
        task.setId(tTask.getId());
        task.setName(tTask.getName());
        task.setRank(tTask.getRank());
        return task;
    }

    public static TTask getTTask(Task task) {
        TTask tTask = new TTask();
        tTask.setCreatedDate(task.getCreatedDate());
        tTask.setDescription(task.getDescription());
        tTask.setDuedate(task.getDueDate());
        tTask.setName(task.getName());
        tTask.setRank(task.getRank());
        return tTask;
    }


}
