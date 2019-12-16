package com.tan90.pensieve.service.impl;

import com.tan90.pensieve.persistence.DaoFactory;
import com.tan90.pensieve.persistence.DaoType;
import com.tan90.pensieve.persistence.dao.PriorityDao;
import com.tan90.pensieve.persistence.entities.TPriority;
import com.tan90.pensieve.service.PriorityService;
import com.tan90.pensieve.to.Priority;
import com.tan90.pensieve.to.converters.PriorityConverter;

import java.util.ArrayList;
import java.util.List;

public class PriorityServiceImpl implements PriorityService {

    private PriorityDao priorityDao;

    public PriorityServiceImpl() {
        super();
        priorityDao = (PriorityDao) DaoFactory.getDao(DaoType.PRIORITY);
    }

    public Priority createPriority(Priority priority) {
        TPriority tPriority = PriorityConverter.getTPriority(priority);
        TPriority savedPrioity = priorityDao.save(tPriority);
        if (savedPrioity != null) {
            return PriorityConverter.getPriority(savedPrioity);
        }

        return null;
    }

    public boolean isPriorityTableInitialized() {
        return priorityDao.getCount() > 0;
    }

    public List<Priority> getAllPriorities() {
        List<TPriority> tPriorities = priorityDao.getAll();
        List<Priority> priorities = new ArrayList<>();
        for (TPriority tPriority : tPriorities) {
            priorities.add(PriorityConverter.getPriority(tPriority));
        }
        return priorities;
    }
}
