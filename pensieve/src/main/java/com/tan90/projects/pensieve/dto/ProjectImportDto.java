package com.tan90.projects.pensieve.dto;

import java.util.List;

public class ProjectImportDto {
    private String name;
    private String description;
    private List<ListImportDto> lists;

    public static class ListImportDto {
        private String name;
        private String description;
        private List<TaskImportDto> tasks;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public List<TaskImportDto> getTasks() {
            return tasks;
        }

        public void setTasks(List<TaskImportDto> tasks) {
            this.tasks = tasks;
        }
    }

    public static class TaskImportDto {
        private String id;
        private String title;
        private String description;
        private String status;
        private String priority;
        private String dueDate;
        private String parentTaskId;

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getPriority() {
            return priority;
        }

        public void setPriority(String priority) {
            this.priority = priority;
        }

        public String getDueDate() {
            return dueDate;
        }

        public void setDueDate(String dueDate) {
            this.dueDate = dueDate;
        }

        public String getParentTaskId() {
            return parentTaskId;
        }

        public void setParentTaskId(String parentTaskId) {
            this.parentTaskId = parentTaskId;
        }
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<ListImportDto> getLists() {
        return lists;
    }

    public void setLists(List<ListImportDto> lists) {
        this.lists = lists;
    }
}
