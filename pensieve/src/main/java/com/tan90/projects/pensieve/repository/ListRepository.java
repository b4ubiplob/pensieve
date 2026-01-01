package com.tan90.projects.pensieve.repository;

import com.tan90.projects.pensieve.entity.ProjectList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ListRepository extends JpaRepository<ProjectList, String> {
    List<ProjectList> findByProjectId(String projectId);
}

