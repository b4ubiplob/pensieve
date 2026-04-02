package com.tan90.projects.pensieve.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ProjectDetailDto {
    private String id;
    private String name;
    private String description;
    private LocalDateTime createdDate;
    private LocalDateTime completedDate;
    private List<ProjectListDto> lists;

    // Constructors
    public ProjectDetailDto() {
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public LocalDateTime getCompletedDate() {
        return completedDate;
    }

    public void setCompletedDate(LocalDateTime completedDate) {
        this.completedDate = completedDate;
    }

    public List<ProjectListDto> getLists() {
        return lists;
    }

    public void setLists(List<ProjectListDto> lists) {
        this.lists = lists;
    }
}
