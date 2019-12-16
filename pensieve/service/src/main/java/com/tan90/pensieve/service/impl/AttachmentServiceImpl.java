package com.tan90.pensieve.service.impl;

import com.tan90.pensieve.persistence.DaoFactory;
import com.tan90.pensieve.persistence.DaoType;
import com.tan90.pensieve.persistence.dao.AttachmentDao;
import com.tan90.pensieve.persistence.dao.CommentDao;
import com.tan90.pensieve.persistence.dao.TaskDao;
import com.tan90.pensieve.persistence.entities.TAttachment;
import com.tan90.pensieve.persistence.entities.TComment;
import com.tan90.pensieve.persistence.entities.TTask;
import com.tan90.pensieve.service.AttachmentService;
import com.tan90.pensieve.to.Attachment;
import com.tan90.pensieve.to.converters.AttachmentConverter;

import java.util.ArrayList;
import java.util.List;

public class AttachmentServiceImpl implements AttachmentService {

    private AttachmentDao attachmentDao;
    private TaskDao taskDao;
    private CommentDao commentDao;


    public AttachmentServiceImpl() {
        super();
        attachmentDao = (AttachmentDao) DaoFactory.getDao(DaoType.ATTACHMENT);
        taskDao = (TaskDao) DaoFactory.getDao(DaoType.TASK);
        commentDao = (CommentDao) DaoFactory.getDao(DaoType.COMMENT);
    }


    public Attachment addAttachmentToTask(String taskId, Attachment attachment) {
        TAttachment tAttachment = AttachmentConverter.getTAttachment(attachment);
        TTask tTask = taskDao.get(taskId);
        if (tTask != null) {
            tAttachment.setTTask(tTask);
            TAttachment savedAttachment = attachmentDao.save(tAttachment);
            if (savedAttachment != null) {
                return AttachmentConverter.getAttachment(savedAttachment);
            }
        }
        return null;
    }

    public Attachment addAttachmentToComment(String commentId, Attachment attachment) {
        TAttachment tAttachment = AttachmentConverter.getTAttachment(attachment);
        TComment tComment = commentDao.get(commentId);
        if (tComment != null) {
            tAttachment.setTComment(tComment);
            TAttachment savedAttachment = attachmentDao.save(tAttachment);
            if (savedAttachment != null) {
                return AttachmentConverter.getAttachment(savedAttachment);
            }
        }
        return null;
    }

    public List<Attachment> getAttachmentsOfTask(String taskId) {
        List<TAttachment> tAttachments = taskDao.getAllAttachments(taskId);
        List<Attachment> attachments = new ArrayList<>();
        for (TAttachment tAttachment : tAttachments) {
            attachments.add(AttachmentConverter.getAttachment(tAttachment));
        }
        return attachments;
    }

    public Attachment downloadAttachment(String attachmentId) {
        TAttachment tAttachment = attachmentDao.get(attachmentId);
        if (tAttachment != null) {
            return AttachmentConverter.getAttachment(tAttachment);
        }
        return null;
    }

    public void deleteAttachment(String attachmentId) {
        attachmentDao.delete(attachmentId);
    }

}
