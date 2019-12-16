package com.tan90.pensieve.persistence.entities;

import com.tan90.pensieve.util.constants.QueryNames;

import java.io.Serializable;
import javax.persistence.*;
import java.util.List;


/**
 * The persistent class for the t_status database table.
 * 
 */
@Entity
@Table(name="t_status")
@NamedQuery(name= QueryNames.STATUS_FIND_ALL, query="SELECT t FROM TStatus t")
@NamedQuery(name = QueryNames.STATUS_COUNT, query="SELECT count(t.id) from TStatus t")
public class TStatus implements DbEntity {
	private static final long serialVersionUID = 1L;

	@Id
	private String id;

	private String value;

	//bi-directional many-to-one association to TTask
	@OneToMany(mappedBy="TStatus")
	private List<TTask> TTasks;

	public TStatus() {
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
		TTask.setTStatus(this);

		return TTask;
	}

	public TTask removeTTask(TTask TTask) {
		getTTasks().remove(TTask);
		TTask.setTStatus(null);

		return TTask;
	}

}