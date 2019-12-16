package com.tan90.pensieve.persistence.entities;

import com.tan90.pensieve.util.constants.QueryNames;

import java.io.Serializable;
import javax.persistence.*;
import java.util.List;


/**
 * The persistent class for the t_tasktype database table.
 * 
 */
@Entity
@Table(name="t_tasktype")
@NamedQuery(name= QueryNames.TASKTYPE_FIND_ALL, query="SELECT t FROM TTasktype t")
@NamedQuery(name = QueryNames.TASKTYPE_COUNT, query="SELECT count(t.id) from TTasktype t")
public class TTasktype implements DbEntity {
	private static final long serialVersionUID = 1L;

	@Id
	private String id;

	private String value;

	//bi-directional many-to-one association to TTask
	@OneToMany(mappedBy="TTasktype")
	private List<TTask> TTasks;

	public TTasktype() {
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

	public TTask addTTask(TTask TTask) {
		getTTasks().add(TTask);
		TTask.setTTasktype(this);

		return TTask;
	}

	public TTask removeTTask(TTask TTask) {
		getTTasks().remove(TTask);
		TTask.setTTasktype(null);

		return TTask;
	}

}