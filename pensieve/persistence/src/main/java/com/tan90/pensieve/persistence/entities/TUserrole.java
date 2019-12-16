package com.tan90.pensieve.persistence.entities;

import com.tan90.pensieve.util.constants.QueryNames;

import java.io.Serializable;
import javax.persistence.*;
import java.util.List;


/**
 * The persistent class for the t_userrole database table.
 * 
 */
@Entity
@Table(name="t_userrole")
@NamedQuery(name= QueryNames.USER_ROLE_FIND_ALL, query="SELECT t FROM TUserrole t")
@NamedQuery(name= QueryNames.USER_ROLE_COUNT, query="SELECT count(t.id) from TUserrole t")
@NamedQuery(name= QueryNames.USER_ROLE_GET_BY_ROLE_NAME, query="SELECT t from TUserrole t where t.rolename = :rolename")

public class TUserrole implements DbEntity {
	private static final long serialVersionUID = 1L;

	@Id
	private String id;

	private String rolename;

	//bi-directional many-to-one association to TUserHasTProject
	@OneToMany(mappedBy="TUserrole")
	private List<TUserHasTProject> TUserHasTProjects;

	public TUserrole() {
	}

	public String getId() {
		return this.id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getRolename() {
		return this.rolename;
	}

	public void setRolename(String rolename) {
		this.rolename = rolename;
	}

	public List<TUserHasTProject> getTUserHasTProjects() {
		return this.TUserHasTProjects;
	}

	public void setTUserHasTProjects(List<TUserHasTProject> TUserHasTProjects) {
		this.TUserHasTProjects = TUserHasTProjects;
	}

	public TUserHasTProject addTUserHasTProject(TUserHasTProject TUserHasTProject) {
		getTUserHasTProjects().add(TUserHasTProject);
		TUserHasTProject.setTUserrole(this);

		return TUserHasTProject;
	}

	public TUserHasTProject removeTUserHasTProject(TUserHasTProject TUserHasTProject) {
		getTUserHasTProjects().remove(TUserHasTProject);
		TUserHasTProject.setTUserrole(null);

		return TUserHasTProject;
	}

}