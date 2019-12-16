package com.tan90.pensieve.persistence.entities;

import com.tan90.pensieve.util.constants.QueryNames;

import java.io.Serializable;
import javax.persistence.*;
import java.util.Date;
import java.util.List;


/**
 * The persistent class for the t_project database table.
 * 
 */
@Entity
@Table(name="t_project")
@NamedQuery(name= QueryNames.PROJECT_FIND_ALL, query="SELECT t FROM TProject t")
public class TProject implements DbEntity {
	private static final long serialVersionUID = 1L;

	@Id
	private String id;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name="created_time")
	private Date createdTime;

	@Lob
	private String description;

	@Temporal(TemporalType.TIMESTAMP)
	private Date duedate;

	private String name;

	//bi-directional many-to-one association to TTask
	@OneToMany(mappedBy="TProject")
	private List<TTask> TTasks;

	//bi-directional many-to-one association to TUserHasTProject
	@OneToMany(mappedBy="TProject")
	private List<TUserHasTProject> TUserHasTProjects;

	public TProject() {
	}

	public String getId() {
		return this.id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public Date getCreatedTime() {
		return this.createdTime;
	}

	public void setCreatedTime(Date createdTime) {
		this.createdTime = createdTime;
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

	public List<TTask> getTTasks() {
		return this.TTasks;
	}

	public void setTTasks(List<TTask> TTasks) {
		this.TTasks = TTasks;
	}

	public TTask addTTask(TTask TTask) {
		getTTasks().add(TTask);
		TTask.setTProject(this);

		return TTask;
	}

	public TTask removeTTask(TTask TTask) {
		getTTasks().remove(TTask);
		TTask.setTProject(null);

		return TTask;
	}

	public List<TUserHasTProject> getTUserHasTProjects() {
		return this.TUserHasTProjects;
	}

	public void setTUserHasTProjects(List<TUserHasTProject> TUserHasTProjects) {
		this.TUserHasTProjects = TUserHasTProjects;
	}

	public TUserHasTProject addTUserHasTProject(TUserHasTProject TUserHasTProject) {
		getTUserHasTProjects().add(TUserHasTProject);
		TUserHasTProject.setTProject(this);

		return TUserHasTProject;
	}

	public TUserHasTProject removeTUserHasTProject(TUserHasTProject TUserHasTProject) {
		getTUserHasTProjects().remove(TUserHasTProject);
		TUserHasTProject.setTProject(null);

		return TUserHasTProject;
	}

}