package com.tan90.projects.pensieve.repository;

import com.tan90.projects.pensieve.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, String> {
    List<Task> findByListId(String listId);
    List<Task> findByParentId(String parentId);
}

