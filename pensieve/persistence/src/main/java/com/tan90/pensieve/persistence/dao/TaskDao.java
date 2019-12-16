package com.tan90.pensieve.persistence.dao;

import com.tan90.pensieve.persistence.entities.TAttachment;
import com.tan90.pensieve.persistence.entities.TComment;
import com.tan90.pensieve.persistence.entities.TTask;

import java.util.List;

public interface TaskDao extends Dao<TTask, String> {

    public List<TAttachment> getAllAttachments(String taskId);

    public List<TComment> getAllComments(String taskId);
}
