package com.tan90.pensieve.persistence.entities;

import com.tan90.pensieve.util.constants.QueryNames;

import java.io.Serializable;
import javax.persistence.*;
import java.util.List;


/**
 * The persistent class for the t_user database table.
 * 
 */
@Entity
@Table(name="t_user")
@NamedQuery(name= QueryNames.USER_FIND_ALL, query="SELECT t FROM TUser t")
@NamedQuery(name=QueryNames.USER_LOGIN, query="SELECT t FROM TUser t WHERE t.username=:username AND t.password=:password")
public class TUser implements DbEntity {
	private static final long serialVersionUID = 1L;

	@Id
	private String id;

	private String alias;

	private String email;

	private String password;

	@Lob
	private byte[] photo;

	private String username;

	//bi-directional many-to-one association to TComment
	@OneToMany(mappedBy="TUser")
	private List<TComment> TComments;

	//bi-directional many-to-one association to TTask
	@OneToMany(mappedBy="createdBy")
	private List<TTask> TTasks1;

	//bi-directional many-to-one association to TTask
	@OneToMany(mappedBy="assignee")
	private List<TTask> TTasks2;

	//bi-directional many-to-one association to TUserHasTProject
	@OneToMany(mappedBy="TUser")
	private List<TUserHasTProject> TUserHasTProjects;

	public TUser() {
	}

	public String getId() {
		return this.id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getAlias() {
		return this.alias;
	}

	public void setAlias(String alias) {
		this.alias = alias;
	}

	public String getEmail() {
		return this.email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return this.password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public byte[] getPhoto() {
		return this.photo;
	}

	public void setPhoto(byte[] photo) {
		this.photo = photo;
	}

	public String getUsername() {
		return this.username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public List<TComment> getTComments() {
		return this.TComments;
	}

	public void setTComments(List<TComment> TComments) {
		this.TComments = TComments;
	}

	public TComment addTComment(TComment TComment) {
		getTComments().add(TComment);
		TComment.setTUser(this);

		return TComment;
	}

	public TComment removeTComment(TComment TComment) {
		getTComments().remove(TComment);
		TComment.setTUser(null);

		return TComment;
	}

	public List<TTask> getTTasks1() {
		return this.TTasks1;
	}

	public void setTTasks1(List<TTask> TTasks1) {
		this.TTasks1 = TTasks1;
	}

	public TTask addTTasks1(TTask TTasks1) {
		getTTasks1().add(TTasks1);
		TTasks1.setCreatedBy(this);

		return TTasks1;
	}

	public TTask removeTTasks1(TTask TTasks1) {
		getTTasks1().remove(TTasks1);
		TTasks1.setCreatedBy(null);

		return TTasks1;
	}

	public List<TTask> getTTasks2() {
		return this.TTasks2;
	}

	public void setTTasks2(List<TTask> TTasks2) {
		this.TTasks2 = TTasks2;
	}

	public TTask addTTasks2(TTask TTasks2) {
		getTTasks2().add(TTasks2);
		TTasks2.setCreatedBy(this);

		return TTasks2;
	}

	public TTask removeTTasks2(TTask TTasks2) {
		getTTasks2().remove(TTasks2);
		TTasks2.setCreatedBy(null);

		return TTasks2;
	}

	public List<TUserHasTProject> getTUserHasTProjects() {
		return this.TUserHasTProjects;
	}

	public void setTUserHasTProjects(List<TUserHasTProject> TUserHasTProjects) {
		this.TUserHasTProjects = TUserHasTProjects;
	}

	public TUserHasTProject addTUserHasTProject(TUserHasTProject TUserHasTProject) {
		getTUserHasTProjects().add(TUserHasTProject);
		TUserHasTProject.setTUser(this);

		return TUserHasTProject;
	}

	public TUserHasTProject removeTUserHasTProject(TUserHasTProject TUserHasTProject) {
		getTUserHasTProjects().remove(TUserHasTProject);
		TUserHasTProject.setTUser(null);

		return TUserHasTProject;
	}

}