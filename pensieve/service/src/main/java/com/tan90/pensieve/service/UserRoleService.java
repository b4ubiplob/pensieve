package com.tan90.pensieve.service;

import com.tan90.pensieve.to.UserRole;

import java.util.List;

public interface UserRoleService {

    public UserRole createUserRole(UserRole userRole);

    public boolean isUserRoleTableInitialized();

    public List<UserRole> getAllUserRoles();
}
