package com.tan90.pensieve.persistence.entities;

import com.tan90.pensieve.util.constants.QueryNames;

import java.io.Serializable;
import javax.persistence.*;
import java.util.List;


/**
 * The persistent class for the t_tags database table.
 * 
 */
@Entity
@Table(name="t_tags")
@NamedQuery(name= QueryNames.TAG_FIND_ALL, query="SELECT t FROM TTag t")
@NamedQuery(name=QueryNames.TAG_GET_BY_VALUE, query="SELECT t FROM TTag t where t.value = :value")
public class TTag implements DbEntity {
	private static final long serialVersionUID = 1L;

	@Id
	private String id;

	private String value;

	//bi-directional many-to-many association to TTask
	@ManyToMany(mappedBy="TTags")
	private List<TTask> TTasks;

	public TTag() {
	}

	public String getId() {
		return this.id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getValue() {
		return this.value;
	}

	public void setValue(String value) {
		this.value = value;
	}

	public List<TTask> getTTasks() {
		return this.TTasks;
	}

	public void setTTasks(List<TTask> TTasks) {
		this.TTasks = TTasks;
	}

}