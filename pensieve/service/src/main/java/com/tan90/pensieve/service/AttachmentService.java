package com.tan90.pensieve.service;

import com.tan90.pensieve.to.Attachment;

import java.util.List;

public interface AttachmentService {

    public Attachment addAttachmentToTask(String taskId, Attachment attachment);

    public Attachment addAttachmentToComment(String commentId, Attachment attachment);

    public List<Attachment> getAttachmentsOfTask(String taskId);

    public Attachment downloadAttachment(String attachmentId);

    public void deleteAttachment(String attachmentId);


}
