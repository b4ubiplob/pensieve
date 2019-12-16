package com.tan90.pensieve.persistence.entities;

import com.tan90.pensieve.util.constants.QueryNames;

import java.io.Serializable;
import javax.persistence.*;


/**
 * The persistent class for the t_user_has_t_project database table.
 * 
 */
@Entity
@Table(name="t_user_has_t_project")
@NamedQuery(name= QueryNames.USER_HAS_PROJECT_FIND_ALL, query="SELECT t FROM TUserHasTProject t")
public class TUserHasTProject implements DbEntity {
	private static final long serialVersionUID = 1L;

	@Id
	private String id;

	//bi-directional many-to-one association to TProject
	@ManyToOne
	@JoinColumn(name="t_project_id")
	private TProject TProject;

	//bi-directional many-to-one association to TUser
	@ManyToOne
	@JoinColumn(name="t_user_id")
	private TUser TUser;

	//bi-directional many-to-one association to TUserrole
	@ManyToOne
	@JoinColumn(name="t_userrole_id")
	private TUserrole TUserrole;

	public TUserHasTProject() {
	}

	public String getId() {
		return this.id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public TProject getTProject() {
		return this.TProject;
	}

	public void setTProject(TProject TProject) {
		this.TProject = TProject;
	}

	public TUser getTUser() {
		return this.TUser;
	}

	public void setTUser(TUser TUser) {
		this.TUser = TUser;
	}

	public TUserrole getTUserrole() {
		return this.TUserrole;
	}

	public void setTUserrole(TUserrole TUserrole) {
		this.TUserrole = TUserrole;
	}

}