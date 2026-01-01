-- Create TaskTags table
CREATE TABLE task_tags (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    tag_name VARCHAR(256) NOT NULL
);

-- Create many-to-many mapping table for Task and TaskTags
CREATE TABLE task_tag_mapping (
    task_id VARCHAR(64) NOT NULL,
    tag_id VARCHAR(64) NOT NULL,
    PRIMARY KEY (task_id, tag_id),
    CONSTRAINT fk_task_tag_mapping_task FOREIGN KEY (task_id) REFERENCES task(id) ON DELETE CASCADE,
    CONSTRAINT fk_task_tag_mapping_tag FOREIGN KEY (tag_id) REFERENCES task_tags(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_task_tag_mapping_task_id ON task_tag_mapping(task_id);
CREATE INDEX idx_task_tag_mapping_tag_id ON task_tag_mapping(tag_id);

