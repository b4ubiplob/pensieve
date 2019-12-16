package com.tan90.pensieve.to.converters;

import com.tan90.pensieve.persistence.entities.TProject;
import com.tan90.pensieve.to.Project;

public class ProjectConverter {

    private ProjectConverter() {
    }

    public static Project getProject(TProject tProject) {
        Project project = new Project();
        project.setCreatedTime(tProject.getCreatedTime());
        project.setDescription(tProject.getDescription());
        project.setDueDate(tProject.getDuedate());
        project.setId(tProject.getId());
        project.setName(tProject.getName());
        return project;
    }

    public static TProject getTProject(Project project) {
        TProject tProject = new TProject();
        tProject.setName(project.getName());
        tProject.setDescription(project.getDescription());
        tProject.setCreatedTime(project.getCreatedTime());
        tProject.setDuedate(project.getDueDate());
        return tProject;
    }
}
