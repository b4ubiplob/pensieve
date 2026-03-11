package com.tan90.projects.pensieve.dto;

public class UserDto {
    private String id;
    private String email;
    private String username;
    private String name;
    private byte[] picture;
    private String provider;
    private String pictureUrl;

    public UserDto() {
    }

    public UserDto(String id, String email, String username, String name, byte[] picture, String provider) {
        this.id = id;
        this.email = email;
        this.username = username;
        this.name = name;
        this.picture = picture;
        this.provider = provider;
    }

    public UserDto(String id, String email, String username, String name, byte[] picture, String provider, String pictureUrl) {
        this.id = id;
        this.email = email;
        this.username = username;
        this.name = name;
        this.picture = picture;
        this.provider = provider;
        this.pictureUrl = pictureUrl;
    }

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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public byte[] getPicture() {
        return picture;
    }

    public void setPicture(byte[] picture) {
        this.picture = picture;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getPictureUrl() {
        return pictureUrl;
    }

    public void setPictureUrl(String pictureUrl) {
        this.pictureUrl = pictureUrl;
    }
}
