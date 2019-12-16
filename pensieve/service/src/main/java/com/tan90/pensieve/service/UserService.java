package com.tan90.pensieve.service;

import com.tan90.pensieve.to.User;

import java.util.List;

public interface UserService {

    public List<User> getAllUsers();

    public User getUser(String id);

    public User createUser(User user);

    public User login(String username, String password);

}
