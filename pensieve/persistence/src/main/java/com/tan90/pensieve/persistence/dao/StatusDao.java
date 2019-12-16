package com.tan90.pensieve.persistence.dao;

import com.tan90.pensieve.persistence.entities.TStatus;

public interface StatusDao extends Dao<TStatus, String> {

    public long getCount();
}
