package com.tan90.pensieve.web.resources;

import com.tan90.pensieve.service.TaskTypeService;
import com.tan90.pensieve.service.impl.TaskTypeServiceImpl;
import com.tan90.pensieve.to.TaskType;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import java.util.List;

@Path("/tasktypes")
public class TaskTypeResource {

    private TaskTypeService taskTypeService;

    public TaskTypeResource() {
        super();
        taskTypeService = new TaskTypeServiceImpl();
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<TaskType> getAllTaskTypes() {
        return taskTypeService.getAllTaskTypes();
    }
}
