package com.tan90.pensieve.to.converters;

import com.tan90.pensieve.persistence.entities.TUser;
import com.tan90.pensieve.to.User;

public class UserConverter {

    private UserConverter() {}

    public static User getUser(TUser tUser) {
        User user = new User();
        user.setAlias(tUser.getAlias());
        user.setEmail(tUser.getEmail());
        user.setId(tUser.getId());
        user.setUsername(tUser.getUsername());
        user.setPhoto(tUser.getPhoto());
        return user;
    }

    public static TUser getTUser(User user) {
        TUser tUser = new TUser();
        tUser.setPassword(user.getPassword());
        tUser.setUsername(user.getUsername());
        tUser.setAlias(user.getAlias());
        tUser.setEmail(user.getEmail());
        tUser.setPhoto(user.getPhoto());
        return tUser;
    }

}
