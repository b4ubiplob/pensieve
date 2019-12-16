package com.tan90.pensieve.to.converters;

import com.tan90.pensieve.persistence.entities.TUserrole;
import com.tan90.pensieve.to.UserRole;

public class UserRoleConverter {

    private UserRoleConverter() {

    }

    public static UserRole getUserRole(TUserrole tUserrole) {
        UserRole userRole = new UserRole();
        userRole.setRoleName(tUserrole.getRolename());
        userRole.setId(tUserrole.getId());
        return userRole;
    }

    public static TUserrole getTUserrole(UserRole userRole) {
        TUserrole tUserrole = new TUserrole();
        tUserrole.setRolename(userRole.getRoleName());
        return tUserrole;
    }
}
