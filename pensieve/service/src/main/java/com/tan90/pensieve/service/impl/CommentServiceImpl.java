package com.tan90.pensieve.service.impl;

import com.tan90.pensieve.persistence.DaoFactory;
import com.tan90.pensieve.persistence.DaoType;
import com.tan90.pensieve.persistence.dao.CommentDao;
import com.tan90.pensieve.persistence.dao.TaskDao;
import com.tan90.pensieve.persistence.dao.UserDao;
import com.tan90.pensieve.persistence.entities.TComment;
import com.tan90.pensieve.persistence.entities.TTask;
import com.tan90.pensieve.persistence.entities.TUser;
import com.tan90.pensieve.service.CommentService;
import com.tan90.pensieve.to.Comment;
import com.tan90.pensieve.to.converters.CommentConverter;

import java.util.ArrayList;
import java.util.List;

public class CommentServiceImpl implements CommentService {

    private CommentDao commentDao;
    private UserDao userDao;
    private TaskDao taskDao;

    public CommentServiceImpl() {
        super();
        commentDao = (CommentDao) DaoFactory.getDao(DaoType.COMMENT);
        userDao = (UserDao) DaoFactory.getDao(DaoType.USER);
        taskDao = (TaskDao) DaoFactory.getDao(DaoType.TASK);
    }

    public Comment createComment(String taskId, String userId, Comment comment) {
        TComment tComment = CommentConverter.getTComment(comment);
        TUser tUser = userDao.get(userId);
        TTask tTask = taskDao.get(taskId);
        tComment.setTTask(tTask);
        tComment.setTUser(tUser);
        TComment savedComment = commentDao.save(tComment);
        if (savedComment != null) {
            return CommentConverter.getComment(savedComment);
        }
        return null;
    }

    public List<Comment> getAllCommentsOfTask(String taskId) {
        List<TComment> tComments = taskDao.getAllComments(taskId);
        List<Comment> comments = new ArrayList<>();
        for (TComment tComment : tComments) {
            comments.add(CommentConverter.getComment(tComment));
        }
        return comments;
    }

    public Comment updateComment(Comment comment) {
        TComment tComment = CommentConverter.getUpdatedComment(comment);
        TComment savedComment = commentDao.save(tComment);
        if (savedComment != null) {
            return CommentConverter.getComment(savedComment);
        }
        return null;
    }

    public void deleteComment(String commentId) {
        commentDao.delete(commentId);
    }
}
