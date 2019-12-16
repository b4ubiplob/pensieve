package com.tan90.pensieve.to.converters;

import com.tan90.pensieve.persistence.entities.TAttachment;
import com.tan90.pensieve.to.Attachment;

public class AttachmentConverter {

    private AttachmentConverter() {
    }

    public static Attachment getAttachment(TAttachment tAttachment) {
        Attachment attachment = new Attachment();
        attachment.setContent(tAttachment.getContent());
        attachment.setFilename(tAttachment.getFilename());
        attachment.setId(tAttachment.getId());
        return attachment;
    }

    public static TAttachment getTAttachment(Attachment attachment) {
        TAttachment tAttachment = new TAttachment();
        tAttachment.setContent(attachment.getContent());
        tAttachment.setFilename(attachment.getFilename());
        return tAttachment;
    }
}
