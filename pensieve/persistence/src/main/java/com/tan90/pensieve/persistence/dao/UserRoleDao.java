package com.tan90.pensieve.persistence.dao;

import com.tan90.pensieve.persistence.entities.TUserrole;

public interface UserRoleDao extends Dao<TUserrole, String> {

    public long getCount();

    public TUserrole getUserRoleByNAme(String name);
}
