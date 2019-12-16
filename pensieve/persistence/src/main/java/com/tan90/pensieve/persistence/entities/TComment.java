package com.tan90.pensieve.persistence.entities;

import com.tan90.pensieve.util.constants.QueryNames;

import java.io.Serializable;
import java.util.List;
import javax.persistence.*;


/**
 * The persistent class for the t_comment database table.
 * 
 */
@Entity
@Table(name="t_comment")
@NamedQuery(name= QueryNames.COMMENT_FIND_ALL, query="SELECT t FROM TComment t")
public class TComment implements DbEntity {
	private static final long serialVersionUID = 1L;

	@Id
	private String id;

	@Lob
	private String text;

	//bi-directional many-to-one association to TAttachment
	@OneToMany(mappedBy="TComment")
	private List<TAttachment> TAttachments;

	//bi-directional many-to-one association to TTask
	@ManyToOne
	@JoinColumn(name="task_id")
	private TTask TTask;

	//bi-directional many-to-one association to TUser
	@ManyToOne
	@JoinColumn(name="user_id")
	private TUser TUser;

	public TComment() {
	}

	public String getId() {
		return this.id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getText() {
		return this.text;
	}

	public void setText(String text) {
		this.text = text;
	}

	public List<TAttachment> getTAttachments() {
		return this.TAttachments;
	}

	public void setTAttachments(List<TAttachment> TAttachments) {
		this.TAttachments = TAttachments;
	}

	public TAttachment addTAttachment(TAttachment TAttachment) {
		getTAttachments().add(TAttachment);
		TAttachment.setTComment(this);

		return TAttachment;
	}

	public TAttachment removeTAttachment(TAttachment TAttachment) {
		getTAttachments().remove(TAttachment);
		TAttachment.setTComment(null);

		return TAttachment;
	}

	public TTask getTTask() {
		return this.TTask;
	}

	public void setTTask(TTask TTask) {
		this.TTask = TTask;
	}

	public TUser getTUser() {
		return this.TUser;
	}

	public void setTUser(TUser TUser) {
		this.TUser = TUser;
	}

}