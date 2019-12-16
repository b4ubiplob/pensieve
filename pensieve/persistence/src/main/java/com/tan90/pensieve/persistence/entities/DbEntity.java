package com.tan90.pensieve.persistence.entities;

import java.io.Serializable;

public interface DbEntity extends Serializable {

    public void setId(String id);

    public String getId();
}
