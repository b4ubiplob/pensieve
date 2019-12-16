package com.tan90.pensieve.persistence.entities;

import com.tan90.pensieve.util.constants.QueryNames;

import java.io.Serializable;
import javax.persistence.*;
import java.util.Date;
import java.util.List;


/**
 * The persistent class for the t_task database table.
 * 
 */
@Entity
@Table(name="t_task")
@NamedQuery(name= QueryNames.TASK_FIND_ALL, query="SELECT t FROM TTask t")
public class TTask implements DbEntity {
	private static final long serialVersionUID = 1L;

	@Id
	private String id;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name="created_date")
	private Date createdDate;

	@Lob
	private String description;

	@Temporal(TemporalType.TIMESTAMP)
	private Date duedate;

	private String name;

	private int rank;

	//bi-directional many-to-one association to TAttachment
	@OneToMany(mappedBy="TTask")
	private List<TAttachment> TAttachments;

	//bi-directional many-to-one association to TComment
	@OneToMany(mappedBy="TTask")
	private List<TComment> TComments;

	//bi-directional many-to-one association to TPriority
	@ManyToOne
	@JoinColumn(name="priority_id")
	private TPriority TPriority;

	//bi-directional many-to-one association to TProject
	@ManyToOne
	@JoinColumn(name="project_id")
	private TProject TProject;

	//bi-directional many-to-one association to TStatus
	@ManyToOne
	@JoinColumn(name="status_id")
	private TStatus TStatus;

	//bi-directional many-to-one association to TTasktype
	@ManyToOne
	@JoinColumn(name="tasktype_id")
	private TTasktype TTasktype;

	//bi-directional many-to-one association to TUser
	@ManyToOne
	@JoinColumn(name="created_by")
	private TUser createdBy;

	//bi-directional many-to-one association to TUser
	@ManyToOne
	@JoinColumn(name="assignee")
	private TUser assignee;

	//bi-directional many-to-many association to TTag
	@ManyToMany
	@JoinTable(
		name="t_task_tags_relation"
		, joinColumns={
			@JoinColumn(name="t_task_id")
			}
		, inverseJoinColumns={
			@JoinColumn(name="t_tags_id")
			}
		)
	private List<TTag> TTags;

	//bi-directional many-to-one association to TTask
	@ManyToOne
	@JoinColumn(name="parent_task_id")
	private TTask parentTask;

	//bi-directional many-to-one association to TTask
	@OneToMany(mappedBy="parentTask")
	private List<TTask> subTasks;

	public TTask() {
	}

	public String getId() {
		return this.id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public Date getCreatedDate() {
		return this.createdDate;
	}

	public void setCreatedDate(Date createdDate) {
		this.createdDate = createdDate;
	}

	public String getDescription() {
		return this.description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Date getDuedate() {
		return this.duedate;
	}

	public void setDuedate(Date duedate) {
		this.duedate = duedate;
	}

	public String getName() {
		return this.name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public int getRank() {
		return this.rank;
	}

	public void setRank(int rank) {
		this.rank = rank;
	}

	public List<TAttachment> getTAttachments() {
		return this.TAttachments;
	}

	public void setTAttachments(List<TAttachment> TAttachments) {
		this.TAttachments = TAttachments;
	}

	public TAttachment addTAttachment(TAttachment TAttachment) {
		getTAttachments().add(TAttachment);
		TAttachment.setTTask(this);

		return TAttachment;
	}

	public TAttachment removeTAttachment(TAttachment TAttachment) {
		getTAttachments().remove(TAttachment);
		TAttachment.setTTask(null);

		return TAttachment;
	}

	public List<TComment> getTComments() {
		return this.TComments;
	}

	public void setTComments(List<TComment> TComments) {
		this.TComments = TComments;
	}

	public TComment addTComment(TComment TComment) {
		getTComments().add(TComment);
		TComment.setTTask(this);

		return TComment;
	}

	public TComment removeTComment(TComment TComment) {
		getTComments().remove(TComment);
		TComment.setTTask(null);

		return TComment;
	}

	public TPriority getTPriority() {
		return this.TPriority;
	}

	public void setTPriority(TPriority TPriority) {
		this.TPriority = TPriority;
	}

	public TProject getTProject() {
		return this.TProject;
	}

	public void setTProject(TProject TProject) {
		this.TProject = TProject;
	}

	public TStatus getTStatus() {
		return this.TStatus;
	}

	public void setTStatus(TStatus TStatus) {
		this.TStatus = TStatus;
	}

	public TTasktype getTTasktype() {
		return this.TTasktype;
	}

	public void setTTasktype(TTasktype TTasktype) {
		this.TTasktype = TTasktype;
	}

	public TUser getCreatedBy() {
		return this.createdBy;
	}

	public void setCreatedBy(TUser createdBy) {
		this.createdBy = createdBy;
	}

	public TUser getAssignee() {
		return this.assignee;
	}

	public void setAssignee(TUser assignee) {
		this.assignee = assignee;
	}

	public List<TTag> getTTags() {
		return this.TTags;
	}

	public void setTTags(List<TTag> TTags) {
		this.TTags = TTags;
	}

	public TTask getParentTask() {
		return this.parentTask;
	}

	public void setParentTask(TTask parentTask) {
		this.parentTask = parentTask;
	}

	public List<TTask> getSubTasks() {
		return this.subTasks;
	}

	public void setSubTasks(List<TTask> subTasks) {
		this.subTasks = subTasks;
	}

}