package com.tan90.pensieve.service;

import com.tan90.pensieve.to.Tag;
import com.tan90.pensieve.to.Task;

import java.util.List;

public interface TagService {

    public Tag createTag(Tag tag);

    public void deleteTag(String tagId);

    public List<Task> getTasksOfTag(String tagId);

    public void assignTag(String tagId, String taskId);

}
