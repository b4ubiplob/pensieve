package com.tan90.pensieve.web.resources;

import com.tan90.pensieve.service.PriorityService;
import com.tan90.pensieve.service.impl.PriorityServiceImpl;
import com.tan90.pensieve.to.Priority;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import java.util.List;

@Path("/priorities")
public class PriorityResource {

    private PriorityService priorityService;

    public PriorityResource() {
        super();
        priorityService = new PriorityServiceImpl();
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<Priority> getAllPriorities() {
        return priorityService.getAllPriorities();
    }
}
