package com.tan90.pensieve.to.converters;

import com.tan90.pensieve.persistence.entities.TPriority;
import com.tan90.pensieve.to.Priority;

public class PriorityConverter {

    private PriorityConverter() {}


    public static TPriority getTPriority(Priority priority) {
        TPriority tPriority = new TPriority();
        tPriority.setValue(priority.getValue());
        return tPriority;
    }

    public static Priority getPriority(TPriority tPriority) {
        Priority priority = new Priority();
        priority.setValue(tPriority.getValue());
        priority.setId(tPriority.getId());
        return priority;
    }


}
