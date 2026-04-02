import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { taskAPI } from '../services/api';
import { logout } from '../services/auth';
import Header from './Header';
import './TaskDetail.css';

function TaskDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const task = location.state?.task;
  const project = location.state?.project;
  const list = location.state?.list;
  const user = location.state?.user;
  const openInEditMode = location.state?.openInEditMode;
  const parentTask = location.state?.parentTask;

  const [taskData, setTaskData] = useState(task);
  const [subTasks, setSubTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSubtasks, setLoadingSubtasks] = useState(true);
  const [editing, setEditing] = useState(openInEditMode || false);
  const [editedTitle, setEditedTitle] = useState(task?.title || '');
  const [editedDescription, setEditedDescription] = useState(task?.description || '');
  const [editedPriority, setEditedPriority] = useState(task?.priority || 'MEDIUM');
  const [editedStatus, setEditedStatus] = useState(task?.status || 'CREATED');
  const [editedDueDate, setEditedDueDate] = useState(task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    if (!task || !project || !user || !list) {
      navigate('/projects');
      return;
    }

    // Update state when task changes (e.g., navigating to a different task/subtask)
    setTaskData(task);
    setEditedTitle(task.title || '');
    setEditedDescription(task.description || '');
    setEditedPriority(task.priority || 'MEDIUM');
    setEditedStatus(task.status || 'CREATED');
    setEditedDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setEditing(openInEditMode || false);

    // Fetch full task details with subtasks
    fetchTaskWithSubtasks();
  }, [task?.id, openInEditMode]);

  const fetchTaskWithSubtasks = async () => {
    if (!task) return;

    try {
      setLoadingSubtasks(true);
      const response = await taskAPI.getTaskById(task.id);
      if (response.ok) {
        const data = await response.json();
        setTaskData(data);
        setSubTasks(data.subTasks || []);
      }
    } catch (err) {
      console.error('Error fetching task details:', err);
    } finally {
      setLoadingSubtasks(false);
    }
  };

  const handleBackToTasks = () => {
    if (parentTask) {
      // If this is a subtask, go back to parent task detail page
      navigate('/task-detail', { state: { task: parentTask, project, list, user } });
    } else {
      // If this is a parent task, go back to tasks list
      navigate('/tasks', { state: { project, user, selectedListId: list?.id } });
    }
  };

  const handleSave = async () => {
    if (!editedTitle.trim()) {
      return;
    }

    try {
      setLoading(true);

      // Convert date to LocalDateTime format (YYYY-MM-DDTHH:mm:ss)
      const formattedDueDate = editedDueDate ? `${editedDueDate}T00:00:00` : null;

      const response = await taskAPI.updateTask(taskData.id, {
        title: editedTitle.trim(),
        description: editedDescription.trim(),
        priority: editedPriority,
        status: editedStatus,
        dueDate: formattedDueDate,
      });

      if (response.ok) {
        const updated = await response.json();
        setTaskData(updated);
        setEditedTitle(updated.title);
        setEditedDescription(updated.description || '');
        setEditedPriority(updated.priority);
        setEditedStatus(updated.status);
        setEditedDueDate(updated.dueDate ? new Date(updated.dueDate).toISOString().split('T')[0] : '');
        setEditing(false);
      }
    } catch (err) {
      console.error('Error updating task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedTitle(taskData.title);
    setEditedDescription(taskData.description || '');
    setEditedPriority(taskData.priority);
    setEditedStatus(taskData.status);
    setEditedDueDate(taskData.dueDate ? new Date(taskData.dueDate).toISOString().split('T')[0] : '');
    setEditing(false);
  };

  const handleDelete = async () => {
    try {
      const response = await taskAPI.deleteTask(taskData.id);
      if (response.ok || response.status === 204) {
        // Navigate back to tasks page after deletion
        navigate('/tasks', { state: { project, user, selectedListId: list?.id } });
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleCreateSubtask = async () => {
    try {
      const subtaskData = {
        title: 'New Subtask',
        description: '',
        status: 'CREATED',
        priority: 'MEDIUM',
      };

      const response = await taskAPI.createTask(null, subtaskData, taskData.id);

      if (response.ok || response.status === 201) {
        const newSubtask = await response.json();
        // Navigate to the subtask detail page in edit mode
        navigate('/task-detail', {
          state: {
            task: newSubtask,
            project,
            list,
            user,
            openInEditMode: true,
            parentTask: taskData
          }
        });
      }
    } catch (err) {
      console.error('Error creating subtask:', err);
    }
  };

  const handleToggleSubtask = async (subtask) => {
    try {
      const newStatus = subtask.status === 'COMPLETED' ? 'CREATED' : 'COMPLETED';
      const response = await taskAPI.updateTask(subtask.id, {
        status: newStatus,
        completedDate: newStatus === 'COMPLETED' ? new Date().toISOString() : null,
      });

      if (response.ok) {
        await fetchTaskWithSubtasks();
      }
    } catch (err) {
      console.error('Error updating subtask:', err);
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      const response = await taskAPI.deleteTask(subtaskId);
      if (response.ok || response.status === 204) {
        await fetchTaskWithSubtasks();
      }
    } catch (err) {
      console.error('Error deleting subtask:', err);
    }
  };

  const handleSubtaskClick = (subtask) => {
    navigate('/task-detail', {
      state: {
        task: subtask,
        project,
        list,
        user,
        parentTask: taskData
      }
    });
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityInfo = (priority) => {
    const info = {
      'VERY_HIGH': { label: 'Very High', color: 'error', icon: 'error' },
      'HIGH': { label: 'High', color: 'error', icon: 'error' },
      'MEDIUM': { label: 'Medium', color: 'tertiary', icon: 'remove' },
      'LOW': { label: 'Low', color: 'secondary', icon: 'arrow_downward' }
    };
    return info[priority] || info['MEDIUM'];
  };

  const getStatusInfo = (status) => {
    const info = {
      'CREATED': { label: 'To Do', color: 'outline' },
      'IN_PROGRESS': { label: 'In Progress', color: 'tertiary' },
      'BLOCKED': { label: 'Blocked', color: 'error' },
      'COMPLETED': { label: 'Done', color: 'primary' }
    };
    return info[status] || info['CREATED'];
  };

  const getUserInitials = () => {
    if (user?.name) {
      const names = user.name.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    return user?.username?.substring(0, 2).toUpperCase() || 'U';
  };

  const renderUserIcon = () => {
    if (user?.pictureUrl) {
      return <img src={user.pictureUrl} alt={user.name || user.username} className="user-avatar-img" />;
    }
    return getUserInitials();
  };

  if (!taskData || !project || !user || !list) return null;

  const priorityInfo = getPriorityInfo(taskData.priority);
  const statusInfo = getStatusInfo(taskData.status);

  return (
    <div className="task-detail-wrapper" data-theme={isDarkMode ? 'dark' : 'light'}>
      {/* Sidebar */}
      <aside className={`pensieve-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon">
              <span className="material-symbols-outlined">memory</span>
            </div>
            <span className="brand-text">Pensieve</span>
          </div>
          <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
            <span className="material-symbols-outlined">
              {isSidebarCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>
        </div>

        <div className="workspace-section">
          <h2 className="workspace-title">{project.name}</h2>
          <p className="workspace-subtitle">{parentTask ? 'Subtask Details' : 'Task Details'}</p>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item" onClick={handleBackToTasks}>
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="nav-item-text">{parentTask ? 'Back to Parent Task' : 'Back to Tasks'}</span>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`pensieve-main ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          renderUserIcon={renderUserIcon}
          searchPlaceholder=""
          showSearch={false}
        />

        <div className="task-detail-container">
          {/* Breadcrumbs */}
          <div className="breadcrumbs">
            <span onClick={() => navigate('/projects', { state: { user } })}>Projects</span>
            <span className="material-symbols-outlined">chevron_right</span>
            <span onClick={handleBackToTasks}>{project.name}</span>
            <span className="material-symbols-outlined">chevron_right</span>
            <span className="breadcrumb-active">Task Details</span>
          </div>

          {/* Bento Grid Layout */}
          <div className="task-bento-grid">
            {/* Main Task Column */}
            <div className="task-main-column">
              {/* Title Section */}
              <div className="title-section">
                <div className="ambient-glow"></div>
                <div className="title-content">
                  <div className="title-tags">
                    <span className="task-tag tag-list">{list?.name || 'List'}</span>
                    {taskData.parentTaskId && (
                      <span className="task-tag tag-subtask">
                        <span className="material-symbols-outlined">subdirectory_arrow_right</span>
                        Subtask
                      </span>
                    )}
                    <span className={`task-tag tag-status tag-${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  {editing ? (
                    <input
                      type="text"
                      className="title-input"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      placeholder="Task title"
                    />
                  ) : (
                    <h1 className="task-detail-title">{taskData.title}</h1>
                  )}
                  {editing ? (
                    <textarea
                      className="description-textarea"
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      placeholder="Task description"
                      rows="4"
                    />
                  ) : (
                    <p className="task-detail-description">
                      {taskData.description || 'No description provided.'}
                    </p>
                  )}
                </div>
              </div>

              {/* Subtasks Section */}
              <div className="subtasks-section">
                <div className="section-header">
                  <h3 className="section-title">Subtasks</h3>
                  <span className="section-subtitle">
                    {subTasks.filter(st => st.status === 'COMPLETED').length} of {subTasks.length} completed
                  </span>
                </div>

                {loadingSubtasks ? (
                  <div className="loading-subtasks">
                    <div className="loading-spinner-small"></div>
                    <p>Loading subtasks...</p>
                  </div>
                ) : subTasks.length === 0 ? (
                  <div className="empty-subtasks">
                    <span className="material-symbols-outlined">check_box_outline_blank</span>
                    <p>No subtasks yet</p>
                  </div>
                ) : (
                  <div className="subtasks-list">
                    {subTasks.map(subtask => (
                      <div key={subtask.id} className="subtask-item">
                        <div
                          className={`subtask-checkbox ${subtask.status === 'COMPLETED' ? 'checked' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSubtask(subtask);
                          }}
                        >
                          {subtask.status === 'COMPLETED' && (
                            <span className="material-symbols-outlined">check</span>
                          )}
                        </div>
                        <div className="subtask-content" onClick={() => handleSubtaskClick(subtask)}>
                          <p className={`subtask-title ${subtask.status === 'COMPLETED' ? 'completed' : ''}`}>
                            {subtask.title}
                          </p>
                          {subtask.description && (
                            <p className="subtask-description">{subtask.description}</p>
                          )}
                          <div className="subtask-meta">
                            {subtask.priority && (
                              <span className={`priority-badge-small priority-${subtask.priority.toLowerCase()}`}>
                                {subtask.priority.replace('_', ' ')}
                              </span>
                            )}
                            {subtask.dueDate && (
                              <span className="subtask-due-date">
                                <span className="material-symbols-outlined">calendar_today</span>
                                {formatDate(subtask.dueDate)}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          className="subtask-delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSubtask(subtask.id);
                          }}
                          title="Delete subtask"
                        >
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button className="add-subtask-btn" onClick={handleCreateSubtask} title="Add new subtask">
                  <span className="material-symbols-outlined">add</span>
                  Add new subtask
                </button>
              </div>
            </div>

            {/* Sidebar Info Column */}
            <div className="task-sidebar-column">
              {/* Metadata Card */}
              <div className="metadata-card">
                {editing ? (
                  <div className="edit-section">
                    <div className="form-group-inline">
                      <label className="metadata-label">Status</label>
                      <select
                        className="metadata-select"
                        value={editedStatus}
                        onChange={(e) => setEditedStatus(e.target.value)}
                      >
                        <option value="CREATED">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="BLOCKED">Blocked</option>
                        <option value="COMPLETED">Done</option>
                      </select>
                    </div>
                    <div className="form-group-inline">
                      <label className="metadata-label">Priority</label>
                      <select
                        className="metadata-select"
                        value={editedPriority}
                        onChange={(e) => setEditedPriority(e.target.value)}
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="VERY_HIGH">Very High</option>
                      </select>
                    </div>
                    <div className="form-group-inline">
                      <label className="metadata-label">Due Date</label>
                      <input
                        type="date"
                        className="metadata-input"
                        value={editedDueDate}
                        onChange={(e) => setEditedDueDate(e.target.value)}
                        onClick={(e) => e.target.showPicker && e.target.showPicker()}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="details-grid">
                    <div className="detail-item">
                      <p className="detail-label">Created Date</p>
                      <p className="detail-value">{formatDate(taskData.createdDate)}</p>
                    </div>
                    <div className="detail-item">
                      <p className="detail-label">Due Date</p>
                      <p className="detail-value">{formatDate(taskData.dueDate)}</p>
                    </div>
                    <div className="detail-item">
                      <p className="detail-label">Priority</p>
                      <div className={`priority-indicator priority-${priorityInfo.color}`}>
                        <span className="material-symbols-outlined">{priorityInfo.icon}</span>
                        {priorityInfo.label}
                      </div>
                    </div>
                    <div className="detail-item">
                      <p className="detail-label">Status</p>
                      <div className="status-indicator">
                        {statusInfo.label}
                      </div>
                    </div>
                    {taskData.completedDate && (
                      <div className="detail-item full-width">
                        <p className="detail-label">Completed Date</p>
                        <p className="detail-value">{formatDateTime(taskData.completedDate)}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Attachments */}
                <div className="attachments-section">
                  <p className="metadata-label">Attachments</p>
                  <div className="empty-attachments">
                    <span className="material-symbols-outlined">attachment</span>
                    <p>No attachments</p>
                  </div>
                </div>
              </div>

              {/* Actions Panel */}
              <div className="actions-panel">
                {editing ? (
                  <>
                    <button className="action-btn primary" onClick={handleSave} disabled={loading}>
                      <span className="material-symbols-outlined">check_circle</span>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button className="action-btn secondary" onClick={handleCancel} disabled={loading}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button className="action-btn primary" onClick={() => setEditing(true)}>
                      <span className="material-symbols-outlined">edit</span>
                      Edit Task
                    </button>
                    <button className="action-btn danger" onClick={() => setShowDeleteDialog(true)}>
                      <span className="material-symbols-outlined">delete</span>
                      Delete Task
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="dialog-overlay" onClick={() => setShowDeleteDialog(false)}>
          <div className="dialog-content confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <div className="confirm-icon">
                <span className="material-symbols-outlined">warning</span>
              </div>
            </div>
            <div className="confirm-body">
              <h2 className="dialog-title">Delete Task</h2>
              <p className="confirm-message">Are you sure you want to delete this task? This action cannot be undone.</p>
            </div>
            <div className="dialog-actions">
              <button
                type="button"
                className="action-btn secondary"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="action-btn danger"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskDetail;
