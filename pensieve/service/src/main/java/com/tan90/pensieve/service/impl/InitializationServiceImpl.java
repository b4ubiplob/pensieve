package com.tan90.pensieve.service.impl;

import com.tan90.pensieve.service.*;
import com.tan90.pensieve.service.initialization.InitialPriorities;
import com.tan90.pensieve.service.initialization.InitialStatus;
import com.tan90.pensieve.service.initialization.InitialTaskTypes;
import com.tan90.pensieve.service.initialization.InitialUserRole;
import com.tan90.pensieve.to.Priority;
import com.tan90.pensieve.to.Status;
import com.tan90.pensieve.to.TaskType;
import com.tan90.pensieve.to.UserRole;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class InitializationServiceImpl implements InitialiazationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(InitializationServiceImpl.class);

    private StatusService statusService;
    private TaskTypeService taskTypeService;
    private PriorityService priorityService;
    private UserRoleService userRoleService;

    public InitializationServiceImpl() {
        super();
        statusService = new StatusServiceImpl();
        taskTypeService = new TaskTypeServiceImpl();
        priorityService = new PriorityServiceImpl();
        userRoleService = new UserRoleServiceImpl();
    }

    public void initialize() {
        LOGGER.debug("intitialzing from service");
        initializeStatus();
        initialzePriorities();
        initializeTaskTypes();
        initializeUserRoles();
    }

    private void initializeStatus() {
        LOGGER.debug("initializing status");
        boolean isStatusInitialized = statusService.isStatusTableInitialized();
        if (!isStatusInitialized) {
            for (InitialStatus initialStatus : InitialStatus.values()) {
                Status status = new Status();
                status.setValue(initialStatus.getName());
                statusService.createStatus(status);
            }
        }
    }

    private void initialzePriorities() {
        LOGGER.debug("initializing priorities");
        boolean isPrioritiesInitialized = priorityService.isPriorityTableInitialized();
        if (!isPrioritiesInitialized) {
            for (InitialPriorities initialPriorities : InitialPriorities.values()) {
                Priority priority = new Priority();
                priority.setValue(initialPriorities.getName());
                priorityService.createPriority(priority);
            }
        }
    }

    private void initializeTaskTypes() {
        LOGGER.debug("initializing tasktypes");
        boolean isTaskTypesInitialized = taskTypeService.isTaskTypeTableInitialized();
        if (!isTaskTypesInitialized) {
            for (InitialTaskTypes initialTaskTypes : InitialTaskTypes.values()) {
                TaskType taskType = new TaskType();
                taskType.setValue(initialTaskTypes.getName());
                taskTypeService.createTaskType(taskType);
            }
        }

    }

    private void initializeUserRoles() {
        LOGGER.debug("initializing userroles");
        boolean isUserRolesTableInitialized = userRoleService.isUserRoleTableInitialized();
        if (!isUserRolesTableInitialized) {
            for (InitialUserRole initialUserRole : InitialUserRole.values()) {
                UserRole userRole = new UserRole();
                userRole.setRoleName(initialUserRole.getRole());
                userRoleService.createUserRole(userRole);
            }
        }

    }
}
