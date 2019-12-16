package com.tan90.pensieve.persistence.dao;

import com.tan90.pensieve.persistence.entities.TUser;
import com.tan90.pensieve.persistence.entities.TUserHasTProject;

import java.util.List;

public interface UserDao extends Dao<TUser, String> {

    public TUser login(String username, String password);

    public List<TUserHasTProject> getAllProjects(String userId);
}
