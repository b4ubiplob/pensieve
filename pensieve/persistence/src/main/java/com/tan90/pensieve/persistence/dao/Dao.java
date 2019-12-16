package com.tan90.pensieve.persistence.dao;

import com.tan90.pensieve.persistence.entities.DbEntity;

import java.util.List;

public interface Dao<T extends DbEntity, I> {

    public List<T> getAll();

    public T get(I id);

    public T save(T t);

    public T saveWithoutCommit(T t);

    public boolean delete(I id);

    public boolean deleteWithoutCommit(I id);
}
