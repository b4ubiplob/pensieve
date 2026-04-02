package com.tan90.projects.pensieve.repository;

import com.tan90.projects.pensieve.entity.ProjectList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ListRepository extends JpaRepository<ProjectList, String> {
    List<ProjectList> findByProjectId(String projectId);

    @Query("SELECT pl FROM ProjectList pl WHERE pl.project.id = :projectId " +
           "ORDER BY pl.displayOrder ASC NULLS LAST, pl.name ASC")
    List<ProjectList> findByProjectIdOrderByDisplayOrder(@Param("projectId") String projectId);

    @Query("SELECT MAX(pl.displayOrder) FROM ProjectList pl WHERE pl.project.id = :projectId")
    Integer findMaxDisplayOrderByProjectId(@Param("projectId") String projectId);
}

