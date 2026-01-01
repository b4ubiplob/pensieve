package com.tan90.projects.pensieve.entity;

import jakarta.persistence.*;
import java.util.Set;

@Entity
@Table(name = "task_tags", schema = "public")
public class TaskTag {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "tag_name", length = 256, nullable = false)
    private String tagName;

    @ManyToMany(mappedBy = "tags")
    private Set<Task> tasks;

    // Constructors
    public TaskTag() {
    }

    public TaskTag(String id, String tagName) {
        this.id = id;
        this.tagName = tagName;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTagName() {
        return tagName;
    }

    public void setTagName(String tagName) {
        this.tagName = tagName;
    }

    public Set<Task> getTasks() {
        return tasks;
    }

    public void setTasks(Set<Task> tasks) {
        this.tasks = tasks;
    }
}

