package com.tan90.pensieve.service.impl;

import com.tan90.pensieve.persistence.DaoFactory;
import com.tan90.pensieve.persistence.DaoType;
import com.tan90.pensieve.persistence.dao.UserRoleDao;
import com.tan90.pensieve.persistence.entities.TUserrole;
import com.tan90.pensieve.service.UserRoleService;
import com.tan90.pensieve.to.UserRole;
import com.tan90.pensieve.to.converters.UserRoleConverter;

import java.util.ArrayList;
import java.util.List;

public class UserRoleServiceImpl implements UserRoleService {

    private UserRoleDao userRoleDao;

    public UserRoleServiceImpl() {
        super();
        userRoleDao = (UserRoleDao) DaoFactory.getDao(DaoType.USERROLE);
    }

    public UserRole createUserRole(UserRole userRole) {
        TUserrole tUserrole = UserRoleConverter.getTUserrole(userRole);
        TUserrole savedUserRole = userRoleDao.save(tUserrole);
        if (savedUserRole != null) {
            return UserRoleConverter.getUserRole(savedUserRole);
        }
        return null;
    }

    public boolean isUserRoleTableInitialized() {
        return userRoleDao.getCount() > 0;
    }

    public List<UserRole> getAllUserRoles() {
        List<TUserrole> tUserroles = userRoleDao.getAll();
        List<UserRole> userRoles = new ArrayList<>();
        for (TUserrole tUserrole : tUserroles) {
            userRoles.add(UserRoleConverter.getUserRole(tUserrole));
        }
        return userRoles;
    }

}
