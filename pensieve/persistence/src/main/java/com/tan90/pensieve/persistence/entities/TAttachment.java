package com.tan90.pensieve.persistence.entities;

import com.tan90.pensieve.util.constants.QueryNames;

import java.io.Serializable;
import javax.persistence.*;
import java.util.List;


/**
 * The persistent class for the t_attachment database table.
 * 
 */
@Entity
@Table(name="t_attachment")
@NamedQuery(name= QueryNames.ATTACHMENT_FIND_ALL, query="SELECT t FROM TAttachment t")
public class TAttachment implements DbEntity {
	private static final long serialVersionUID = 1L;

	@Id
	private String id;

	@Lob
	private byte[] content;

	private String filename;

	//bi-directional many-to-one association to TComment
	@ManyToOne
	@JoinColumn(name="t_comment_id")
	private TComment TComment;

	//bi-directional many-to-one association to TTask
	@ManyToOne
	@JoinColumn(name="task_id")
	private TTask TTask;

	public TAttachment() {
	}

	public String getId() {
		return this.id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public byte[] getContent() {
		return this.content;
	}

	public void setContent(byte[] content) {
		this.content = content;
	}

	public String getFilename() {
		return this.filename;
	}

	public void setFilename(String filename) {
		this.filename = filename;
	}

	public TTask getTTask() {
		return this.TTask;
	}

	public void setTTask(TTask TTask) {
		this.TTask = TTask;
	}

	public TComment getTComment() {
		return this.TComment;
	}

	public void setTComment(TComment TComment) {
		this.TComment = TComment;
	}

}