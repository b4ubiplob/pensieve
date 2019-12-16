package com.tan90.pensieve.service.impl;

import com.tan90.pensieve.persistence.DaoFactory;
import com.tan90.pensieve.persistence.DaoType;
import com.tan90.pensieve.persistence.dao.ProjectDao;
import com.tan90.pensieve.persistence.dao.UserDao;
import com.tan90.pensieve.persistence.dao.UserProjectDao;
import com.tan90.pensieve.persistence.dao.UserRoleDao;
import com.tan90.pensieve.persistence.entities.TProject;
import com.tan90.pensieve.persistence.entities.TUser;
import com.tan90.pensieve.persistence.entities.TUserHasTProject;
import com.tan90.pensieve.persistence.entities.TUserrole;
import com.tan90.pensieve.service.ProjectService;
import com.tan90.pensieve.service.initialization.InitialUserRole;
import com.tan90.pensieve.to.Project;
import com.tan90.pensieve.to.converters.ProjectConverter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class ProjectServiceImpl implements ProjectService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ProjectServiceImpl.class);

    private ProjectDao projectDao;
    private UserDao userDao;
    private UserRoleDao userRoleDao;
    private UserProjectDao userProjectDao;

    public ProjectServiceImpl() {
        super();
        projectDao = (ProjectDao) DaoFactory.getDao(DaoType.PROJECT);
        userDao = (UserDao) DaoFactory.getDao(DaoType.USER);
        userRoleDao = (UserRoleDao) DaoFactory.getDao(DaoType.USERROLE);
        userProjectDao = (UserProjectDao) DaoFactory.getDao(DaoType.USERHASPROJECT);
    }

    public Project createProject(String userId, Project project) {
        TProject tProject = ProjectConverter.getTProject(project);
        tProject.setCreatedTime(new Date());
        TProject savedProject = projectDao.save(tProject);
        if (savedProject != null) {
            TUser tUser = userDao.get(userId);
            TUserHasTProject tUserHasTProject = new TUserHasTProject();
            tUserHasTProject.setTProject(tProject);
            tUserHasTProject.setTUser(tUser);
            TUserrole tUserrole = userRoleDao.getUserRoleByNAme(InitialUserRole.PROJECT_OWNER.getRole());
            tUserHasTProject.setTUserrole(tUserrole);
            userProjectDao.save(tUserHasTProject);
            return ProjectConverter.getProject(savedProject);
        }
        return null;
    }

    public List<Project> getProjectsOfUser(String userId) {
        List<TUserHasTProject> tUserHasTProjects = userDao.getAllProjects(userId);
        List<Project> projects = new ArrayList<>();
        LOGGER.debug("projects size :" + tUserHasTProjects.size());
        for (TUserHasTProject tUserHasTProject : tUserHasTProjects) {
            Project project = ProjectConverter.getProject(tUserHasTProject.getTProject());
            project.setUserRole(tUserHasTProject.getTUserrole().getRolename());
            projects.add(project);
        }
        return projects;
    }

    public void deleteProject(String projectId) {
        projectDao.delete(projectId);
    }

    public Project getProject(String projectId) {
        TProject tProject = projectDao.get(projectId);
        if (tProject != null) {
            return ProjectConverter.getProject(tProject);
        }
        return null;
    }

}
