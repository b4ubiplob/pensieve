package com.tan90.pensieve.persistence.dao;

import com.tan90.pensieve.persistence.entities.TPriority;

public interface PriorityDao extends Dao<TPriority, String> {

    public long getCount();

}
