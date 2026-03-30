package com.tan90.projects.pensieve.repository;

import com.tan90.projects.pensieve.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, String> {
    List<Task> findByListId(String listId);
    List<Task> findByParentId(String parentId);

    @Query("SELECT t FROM Task t " +
           "JOIN t.list l " +
           "JOIN l.project p " +
           "WHERE p.user.id = :userId AND t.status = :status")
    List<Task> findByUserIdAndStatus(@Param("userId") String userId, @Param("status") Task.Status status);
}

