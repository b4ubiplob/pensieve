package com.tan90.projects.pensieve.entity;

import jakarta.persistence.*;
import java.util.Set;

@Entity
@Table(name = "users", schema = "public")
public class User {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "email", length = 256, nullable = false)
    private String email;

    @Column(name = "username", length = 256, nullable = false)
    private String username;

    @Column(name = "password", length = 256, nullable = false)
    private String password;

    @Lob
    @Column(name = "picture")
    private byte[] picture;

    @Column(name = "name", length = 256, nullable = false)
    private String name;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Project> projects;

    // Constructors
    public User() {
    }

    public User(String id, String email, String username, String password, String name) {
        this.id = id;
        this.email = email;
        this.username = username;
        this.password = password;
        this.name = name;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public byte[] getPicture() {
        return picture;
    }

    public void setPicture(byte[] picture) {
        this.picture = picture;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<Project> getProjects() {
        return projects;
    }

    public void setProjects(Set<Project> projects) {
        this.projects = projects;
    }
}

