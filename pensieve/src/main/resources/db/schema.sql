-- Create schema
CREATE SCHEMA IF NOT EXISTS db_pensieve;

-- Set search path to use the schema
SET search_path TO db_pensieve;

-- Create users table first (referenced by projects)
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(256) NOT NULL,
    password VARCHAR(256) NOT NULL,
    picture BYTEA,
    name VARCHAR(256) NOT NULL
);

-- Create projects table
CREATE TABLE projects (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(256) NOT NULL,
    description TEXT,
    created_date TIMESTAMP,
    completed_date TIMESTAMP,
    user_id VARCHAR(64),
    CONSTRAINT fk_projects_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create list table
CREATE TABLE list (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(256) NOT NULL,
    description TEXT,
    created_date TIMESTAMP,
    completed_date TIMESTAMP,
    project_id VARCHAR(64),
    CONSTRAINT fk_list_project FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Create task table
CREATE TABLE task (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(512) NOT NULL,
    description TEXT,
    due_date TIMESTAMP,
    reminder_date TIMESTAMP,
    created_date TIMESTAMP,
    completed_date TIMESTAMP,
    status VARCHAR(64) CHECK (status IN ('CREATED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'PAUSED')),
    priority VARCHAR(64) CHECK (priority IN ('VERY_HIGH', 'HIGH', 'MEDIUM', 'LOW')),
    parent_id VARCHAR(64),
    list_id VARCHAR(64),
    CONSTRAINT fk_task_parent FOREIGN KEY (parent_id) REFERENCES task(id),
    CONSTRAINT fk_task_list FOREIGN KEY (list_id) REFERENCES list(id)
);

-- Create attachment table
CREATE TABLE attachment (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    content BYTEA NOT NULL,
    task_id VARCHAR(64),
    CONSTRAINT fk_attachment_task FOREIGN KEY (task_id) REFERENCES task(id)
);

-- Add indexes for foreign keys to improve query performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_list_project_id ON list(project_id);
CREATE INDEX idx_task_parent_id ON task(parent_id);
CREATE INDEX idx_task_list_id ON task(list_id);
CREATE INDEX idx_attachment_task_id ON attachment(task_id);

-- Add indexes for date columns
CREATE INDEX idx_projects_created_date ON projects(created_date);
CREATE INDEX idx_list_created_date ON list(created_date);
CREATE INDEX idx_task_created_date ON task(created_date);
CREATE INDEX idx_task_due_date ON task(due_date);

