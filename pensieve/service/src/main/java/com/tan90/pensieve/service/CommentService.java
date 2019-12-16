package com.tan90.pensieve.service;

import com.tan90.pensieve.to.Comment;

import java.util.List;

public interface CommentService {

    public Comment createComment(String taskId, String userId, Comment comment);

    public List<Comment> getAllCommentsOfTask(String taskId);

    public Comment updateComment(Comment comment);

    public void deleteComment(String commentId);
}
