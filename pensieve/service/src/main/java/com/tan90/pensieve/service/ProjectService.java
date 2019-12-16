package com.tan90.pensieve.service;

import com.tan90.pensieve.to.Project;

import java.util.List;

public interface ProjectService {

    public Project createProject(String userId, Project project);

    public List<Project> getProjectsOfUser(String userId);

    public void deleteProject(String projectId);

    public Project getProject(String projectId);


}
