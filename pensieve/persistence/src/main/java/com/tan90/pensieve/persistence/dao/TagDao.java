package com.tan90.pensieve.persistence.dao;

import com.tan90.pensieve.persistence.entities.TTag;
import com.tan90.pensieve.persistence.entities.TTask;

import java.util.List;

public interface TagDao extends Dao<TTag, String> {

    public TTag getTagByValue(String value);

    public List<TTask> getAllTasks(String tagId);

}
