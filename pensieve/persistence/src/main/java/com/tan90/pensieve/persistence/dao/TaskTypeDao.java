package com.tan90.pensieve.persistence.dao;

import com.tan90.pensieve.persistence.entities.TTasktype;

public interface TaskTypeDao extends Dao<TTasktype, String> {

    public long getCount();

}
