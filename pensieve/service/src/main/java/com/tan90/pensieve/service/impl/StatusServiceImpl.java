package com.tan90.pensieve.service.impl;

import com.tan90.pensieve.persistence.DaoFactory;
import com.tan90.pensieve.persistence.DaoType;
import com.tan90.pensieve.persistence.dao.StatusDao;
import com.tan90.pensieve.persistence.dao.impl.StatusDaoImpl;
import com.tan90.pensieve.persistence.entities.TStatus;
import com.tan90.pensieve.service.StatusService;
import com.tan90.pensieve.to.Status;
import com.tan90.pensieve.to.converters.StatusConverter;

import java.util.ArrayList;
import java.util.List;

public class StatusServiceImpl implements StatusService {

    private StatusDao statusDao;

    public StatusServiceImpl() {
        super();
        statusDao = (StatusDaoImpl) DaoFactory.getDao(DaoType.STATUS);
    }

    public Status createStatus(Status status) {
        TStatus tStatus = StatusConverter.getTStatus(status);
        TStatus savedStatus = statusDao.save(tStatus);
        if (savedStatus != null) {
            return StatusConverter.getStatus(tStatus);
        }

        return null;
    }

    public boolean isStatusTableInitialized() {
        return statusDao.getCount() > 0;
    }

    public List<Status> getAllStatus() {
        List<TStatus> tStatuses = statusDao.getAll();
        List<Status> statuses = new ArrayList<>();
        for (TStatus tStatus : tStatuses) {
            statuses.add(StatusConverter.getStatus(tStatus));
        }
        return statuses;
    }

}
