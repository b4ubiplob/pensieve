package com.tan90.pensieve.service.impl;

import com.tan90.pensieve.persistence.DaoFactory;
import com.tan90.pensieve.persistence.DaoType;
import com.tan90.pensieve.persistence.dao.UserDao;
import com.tan90.pensieve.persistence.entities.TUser;
import com.tan90.pensieve.service.UserService;
import com.tan90.pensieve.to.User;
import com.tan90.pensieve.to.converters.UserConverter;

import java.util.ArrayList;
import java.util.List;

public class UserServiceImpl implements UserService {

    private UserDao userDao;

    public UserServiceImpl() {
        super();
        userDao = (UserDao) DaoFactory.getDao(DaoType.USER);
    }

    public List<User> getAllUsers() {
        List<TUser> tUsers = userDao.getAll();
        List<User> users = new ArrayList<>();

        for (TUser tUser : tUsers) {
            users.add(UserConverter.getUser(tUser));
        }
        return users;

    }

    public User getUser(String id) {
        return UserConverter.getUser(userDao.get(id));
    }

    public User createUser(User user) {
        TUser tUser = UserConverter.getTUser(user);
        TUser savedUser = userDao.save(tUser);
        if (savedUser != null) {
            return UserConverter.getUser(savedUser);
        }
        return null;

    }

    public User login(String username, String password) {
        TUser tUser = userDao.login(username, password);
        if (tUser != null) {
            return UserConverter.getUser(tUser);
        }
        return null;
    }
}
