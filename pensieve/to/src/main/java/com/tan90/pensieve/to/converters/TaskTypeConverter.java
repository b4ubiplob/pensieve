package com.tan90.pensieve.to.converters;

import com.tan90.pensieve.persistence.entities.TTasktype;
import com.tan90.pensieve.to.TaskType;

public class TaskTypeConverter {

    private TaskTypeConverter() {}

    public static TaskType getTaskType(TTasktype tTasktype) {
        TaskType taskType = new TaskType();
        taskType.setValue(tTasktype.getValue());
        taskType.setId(tTasktype.getId());
        return taskType;
    }

    public static TTasktype getTTaskType(TaskType taskType) {
        TTasktype tTasktype = new TTasktype();
        tTasktype.setValue(taskType.getValue());
        return tTasktype;
    }
}
