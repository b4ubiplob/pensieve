package com.tan90.pensieve.to.converters;

import com.tan90.pensieve.persistence.entities.TComment;
import com.tan90.pensieve.to.Comment;

public class CommentConverter {

    private CommentConverter() {
    }

    public static TComment getTComment(Comment comment) {
        TComment tComment = new TComment();
        tComment.setText(comment.getText());
        return tComment;
    }

    public static Comment getComment(TComment tComment) {
        Comment comment = new Comment();
        comment.setText(tComment.getText());
        comment.setId(tComment.getId());
        return comment;
    }

    public static TComment getUpdatedComment(Comment comment) {
        TComment tComment = getTComment(comment);
        tComment.setId(comment.getId());
        return tComment;
    }

}
