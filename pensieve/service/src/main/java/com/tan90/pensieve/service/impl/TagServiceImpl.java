package com.tan90.pensieve.service.impl;

import com.tan90.pensieve.persistence.DaoFactory;
import com.tan90.pensieve.persistence.DaoType;
import com.tan90.pensieve.persistence.dao.TagDao;
import com.tan90.pensieve.persistence.dao.TaskDao;
import com.tan90.pensieve.persistence.entities.TTag;
import com.tan90.pensieve.persistence.entities.TTask;
import com.tan90.pensieve.service.TagService;
import com.tan90.pensieve.to.Tag;
import com.tan90.pensieve.to.Task;
import com.tan90.pensieve.to.converters.TagConverter;
import com.tan90.pensieve.to.converters.TaskConverter;

import java.util.ArrayList;
import java.util.List;

public class TagServiceImpl implements TagService {

    private TagDao tagDao;
    private TaskDao taskDao;

    public TagServiceImpl() {
        super();
        tagDao = (TagDao) DaoFactory.getDao(DaoType.TAG);
        taskDao = (TaskDao) DaoFactory.getDao(DaoType.TASK);
    }

    public Tag createTag(Tag tag) {
        TTag tTag = tagDao.getTagByValue(tag.getValue());
        if (tTag != null) {
            return TagConverter.getTag(tTag);
        }
        tTag = TagConverter.getTTag(tag);
        TTag savedTag = tagDao.save(tTag);
        if (savedTag != null) {
            return TagConverter.getTag(savedTag);
        }
        return null;
    }

    public void deleteTag(String tagId) {
        tagDao.delete(tagId);
    }

    public List<Task> getTasksOfTag(String tagId) {
        List<TTask> tTasks = tagDao.getAllTasks(tagId);
        List<Task> tasks = new ArrayList<>();
        for (TTask tTask : tTasks) {
            tasks.add(TaskConverter.getTask(tTask));
        }
        return tasks;
    }

    public void assignTag(String tagId, String taskId) {
        TTag tTag = tagDao.get(tagId);
        TTask tTask = taskDao.get(taskId);
        List<TTask> tTasks = tTag.getTTasks();
        tTasks.add(tTask);
        tTag.setTTasks(tTasks);
        tagDao.save(tTag);
    }

}
