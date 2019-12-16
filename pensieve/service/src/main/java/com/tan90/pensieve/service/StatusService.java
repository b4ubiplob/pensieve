package com.tan90.pensieve.service;

import com.tan90.pensieve.to.Status;

import java.util.List;

public interface StatusService {

    public Status createStatus(Status status);

    public boolean isStatusTableInitialized();

    public List<Status> getAllStatus();

}
