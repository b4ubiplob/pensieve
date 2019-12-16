package com.tan90.pensieve.persistence.dao;

import com.tan90.pensieve.persistence.entities.TProject;
import com.tan90.pensieve.persistence.entities.TTask;

import java.util.List;

public interface ProjectDao extends Dao<TProject, String> {

    public List<TTask> getAllTasks(String projectId);
}
