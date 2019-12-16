package com.tan90.pensieve.web.resources;

import com.tan90.pensieve.service.ProjectService;
import com.tan90.pensieve.service.impl.ProjectServiceImpl;
import com.tan90.pensieve.to.Project;

import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.UriInfo;
import java.util.List;

@Path("/users/{id}/projects")
public class ProjectResource {

    private ProjectService projectService;

    public ProjectResource() {
        super();
        projectService = new ProjectServiceImpl();
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<Project> getProjectsOfUser(@Context UriInfo uriInfo) {
        String id = uriInfo.getPathParameters().getFirst("id");
        return projectService.getProjectsOfUser(id);
    }

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public Project createProject(@Context UriInfo uriInfo, Project project) {
        String id = uriInfo.getPathParameters().getFirst("id");
        return projectService.createProject(id, project);
    }

    @GET
    @Path("/{projectId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Project getProject(@PathParam("projectId") String projectId) {
        return projectService.getProject(projectId);
    }



}
