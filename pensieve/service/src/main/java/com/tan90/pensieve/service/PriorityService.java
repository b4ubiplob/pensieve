package com.tan90.pensieve.service;

import com.tan90.pensieve.to.Priority;

import java.util.List;

public interface PriorityService {

    public Priority createPriority(Priority priority);

    public boolean isPriorityTableInitialized();

    public List<Priority> getAllPriorities();
}
