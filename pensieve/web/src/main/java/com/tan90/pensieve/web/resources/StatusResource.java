package com.tan90.pensieve.web.resources;

import com.tan90.pensieve.service.StatusService;
import com.tan90.pensieve.service.impl.StatusServiceImpl;
import com.tan90.pensieve.to.Status;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import java.util.List;

@Path("/status")
public class StatusResource {

    private StatusService statusService;

    public StatusResource() {
        super();
        statusService = new StatusServiceImpl();
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<Status> getAllStatus() {
        return statusService.getAllStatus();
    }
}
