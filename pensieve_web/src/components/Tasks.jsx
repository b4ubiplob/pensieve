import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { listAPI, taskAPI } from '../services/api';
import './Tasks.css';

function Tasks() {
  const location = useLocation();
  const navigate = useNavigate();
  const project = location.state?.project;
  const user = location.state?.user;
  
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showListDialog, setShowListDialog] = useState(false);
  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');
  const [listFormError, setListFormError] = useState(null);
  const [listSubmitting, setListSubmitting] = useState(false);
  const [showEditListDialog, setShowEditListDialog] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingList, setDeletingList] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskReminderDate, setTaskReminderDate] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskFormError, setTaskFormError] = useState(null);
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
  const [draggedTask, setDraggedTask] = useState(null);
  const [showDeleteTaskConfirm, setShowDeleteTaskConfirm] = useState(false);
  const [deletingTask, setDeletingTask] = useState(null);
  const [deleteTaskMessage, setDeleteTaskMessage] = useState('');
  const [taskDeleting, setTaskDeleting] = useState(false);

  useEffect(() => {
    // Redirect if no project or user data
    if (!project || !user) {
      navigate('/projects');
      return;
    }

    // Fetch lists for the project
    fetchLists();
  }, [project, user, navigate]);

  useEffect(() => {
    // Fetch tasks when a list is selected
    if (selectedList) {
      fetchTasks(selectedList.id);
    }
  }, [selectedList]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.user-menu')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDropdown]);

  const fetchLists = async () => {
    try {
      setLoadingLists(true);
      setError(null);
      const response = await listAPI.getLists(project.id);
      
      if (response.ok) {
        const data = await response.json();
        // Sort lists alphabetically by name
        const sortedLists = data.sort((a, b) => 
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        );
        setLists(sortedLists);
        
        // Select the first list if available
        if (sortedLists.length > 0) {
          setSelectedList(sortedLists[0]);
        }
      } else {
        setError('Failed to load lists');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error fetching lists:', err);
    } finally {
      setLoadingLists(false);
    }
  };

  const fetchTasks = async (listId) => {
    try {
      setLoadingTasks(true);
      const response = await taskAPI.getTasks(listId);
      
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        console.error('Failed to load tasks');
        setTasks([]);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleBackToProjects = () => {
    navigate('/projects', { state: { user } });
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const handleEditProfile = () => {
    // TODO: Implement edit profile functionality
    alert('Edit profile feature coming soon!');
  };

  const handleCreateList = () => {
    setShowListDialog(true);
    setListFormError(null);
    setListName('');
    setListDescription('');
  };

  const handleCloseListDialog = () => {
    setShowListDialog(false);
    setListFormError(null);
    setListName('');
    setListDescription('');
  };

  const handleSubmitList = async (e) => {
    e.preventDefault();
    
    if (!listName.trim()) {
      setListFormError('List name is required');
      return;
    }

    try {
      setListSubmitting(true);
      setListFormError(null);
      
      const response = await listAPI.createList(project.id, {
        name: listName.trim(),
        description: listDescription.trim(),
      });

      if (response.status === 201) {
        // Success - close dialog and refresh lists
        handleCloseListDialog();
        await fetchLists();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setListFormError(errorData.message || 'Failed to create list');
      }
    } catch (err) {
      setListFormError('Failed to connect to server');
      console.error('Error creating list:', err);
    } finally {
      setListSubmitting(false);
    }
  };

  const handleListClick = (list) => {
    setSelectedList(list);
  };

  const handleEditList = (e, list) => {
    e.stopPropagation();
    setEditingList(list);
    setListName(list.name);
    setListDescription(list.description || '');
    setListFormError(null);
    setShowEditListDialog(true);
  };

  const handleCloseEditListDialog = () => {
    setShowEditListDialog(false);
    setEditingList(null);
    setListFormError(null);
    setListName('');
    setListDescription('');
  };

  const handleUpdateList = async (e) => {
    e.preventDefault();
    
    if (!listName.trim()) {
      setListFormError('List name is required');
      return;
    }

    try {
      setListSubmitting(true);
      setListFormError(null);
      
      const response = await listAPI.updateList(editingList.id, {
        name: listName.trim(),
        description: listDescription.trim(),
      });

      if (response.ok) {
        // Success - close dialog and refresh lists
        handleCloseEditListDialog();
        await fetchLists();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setListFormError(errorData.message || 'Failed to update list');
      }
    } catch (err) {
      setListFormError('Failed to connect to server');
      console.error('Error updating list:', err);
    } finally {
      setListSubmitting(false);
    }
  };

  const handleDeleteListClick = (e, list) => {
    e.stopPropagation();
    setDeletingList(list);
    setDeleteMessage('');
    setShowDeleteConfirm(true);
  };

  const handleCloseDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setDeletingList(null);
    setDeleteMessage('');
  };

  const handleDeleteList = async () => {
    try {
      setListSubmitting(true);
      setDeleteMessage('');
      
      const response = await listAPI.deleteList(deletingList.id);

      if (response.ok) {
        // Success - show message, close dialog and refresh lists
        setDeleteMessage('The list is deleted');
        setTimeout(async () => {
          handleCloseDeleteConfirm();
          // If deleted list was selected, clear selection
          if (selectedList?.id === deletingList.id) {
            setSelectedList(null);
            setTasks([]);
          }
          await fetchLists();
        }, 1500);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setDeleteMessage(errorData.message || 'Failed to delete list');
      }
    } catch (err) {
      setDeleteMessage('Failed to connect to server');
      console.error('Error deleting list:', err);
    } finally {
      setListSubmitting(false);
    }
  };

  const handleCreateTask = () => {
    if (!selectedList) {
      return;
    }
    setShowTaskDialog(true);
    setTaskFormError(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskDueDate('');
    setTaskReminderDate('');
    setTaskPriority('MEDIUM');
  };

  const handleCloseTaskDialog = () => {
    setShowTaskDialog(false);
    setTaskFormError(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskDueDate('');
    setTaskReminderDate('');
    setTaskPriority('MEDIUM');
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    
    if (!taskTitle.trim()) {
      setTaskFormError('Task title is required');
      return;
    }

    try {
      setTaskSubmitting(true);
      setTaskFormError(null);
      
      const taskData = {
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        priority: taskPriority,
      };

      // Add dates only if they are provided
      if (taskDueDate) {
        taskData.due_date = taskDueDate;
      }
      if (taskReminderDate) {
        taskData.reminder_date = taskReminderDate;
      }
      
      const response = await taskAPI.createTask(selectedList.id, taskData);

      if (response.status === 201) {
        // Success - close dialog and refresh tasks
        handleCloseTaskDialog();
        await fetchTasks(selectedList.id);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setTaskFormError(errorData.message || 'Failed to create task');
      }
    } catch (err) {
      setTaskFormError('Failed to connect to server');
      console.error('Error creating task:', err);
    } finally {
      setTaskSubmitting(false);
    }
  };

  // Drag and Drop Handlers for Kanban
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    
    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null);
      return;
    }

    try {
      const response = await taskAPI.updateTask(draggedTask.id, {
        status: newStatus,
      });

      if (response.ok) {
        // Refresh tasks to show updated status
        await fetchTasks(selectedList.id);
      } else {
        console.error('Failed to update task status');
      }
    } catch (err) {
      console.error('Error updating task status:', err);
    } finally {
      setDraggedTask(null);
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const handleEditTask = (task) => {
    navigate('/task', { state: { task, list: selectedList, project, user } });
  };

  const handleDeleteTaskClick = (e, task) => {
    if (e) e.stopPropagation();
    setDeletingTask(task);
    setDeleteTaskMessage('');
    setShowDeleteTaskConfirm(true);
  };

  const handleCloseDeleteTaskConfirm = () => {
    setShowDeleteTaskConfirm(false);
    setDeletingTask(null);
    setDeleteTaskMessage('');
  };

  const handleDeleteTask = async () => {
    try {
      setTaskDeleting(true);
      setDeleteTaskMessage('');
      
      const response = await taskAPI.deleteTask(deletingTask.id);

      if (response.ok) {
        setDeleteTaskMessage('The task is deleted');
        setTimeout(async () => {
          handleCloseDeleteTaskConfirm();
          await fetchTasks(selectedList.id);
        }, 1500);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setDeleteTaskMessage(errorData.message || 'Failed to delete task');
      }
    } catch (err) {
      setDeleteTaskMessage('Failed to connect to server');
      console.error('Error deleting task:', err);
    } finally {
      setTaskDeleting(false);
    }
  };

  // Get user initials for icon
  const getUserInitials = () => {
    if (user.name) {
      const names = user.name.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    return user.username?.substring(0, 2).toUpperCase() || 'U';
  };

  if (!project || !user) {
    return null;
  }

  return (
    <div className="tasks-container">
      {/* Top Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-left">
          <button 
            className="back-button"
            onClick={handleBackToProjects}
            title="Back to Projects"
          >
            ←
          </button>
          <div className="navbar-logo">{project.name}</div>
        </div>
        <div className="user-menu">
          <div 
            className="user-icon"
            onClick={() => setShowDropdown(!showDropdown)}
            title={user.name || user.username}
          >
            {getUserInitials()}
          </div>
          {showDropdown && (
            <div className="dropdown-menu">
              <button 
                className="dropdown-item" 
                onClick={handleEditProfile}
              >
                Edit Profile
              </button>
              <button 
                className="dropdown-item" 
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content with Sidebar */}
      <div className="tasks-main">
        {/* Sidebar with Lists */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h3>Lists</h3>
            <button 
              className="add-list-btn"
              onClick={handleCreateList}
              title="Add List"
            >
              +
            </button>
          </div>
          
          <div className="sidebar-content">
            {loadingLists && (
              <div className="sidebar-loading">Loading...</div>
            )}
            
            {!loadingLists && lists.length === 0 && (
              <div className="no-lists">
                Create a new list to get started
              </div>
            )}
            
            {!loadingLists && lists.length > 0 && (
              <ul className="lists">
                {lists.map((list) => (
                  <li 
                    key={list.id}
                    className={`list-item ${selectedList?.id === list.id ? 'active' : ''}`}
                    onClick={() => handleListClick(list)}
                  >
                    <span className="list-name">{list.name}</span>
                    <div className="list-actions">
                      <button 
                        className="list-action-btn edit-btn"
                        onClick={(e) => handleEditList(e, list)}
                        title="Edit List"
                      >
                        ✏️
                      </button>
                      <button 
                        className="list-action-btn delete-btn"
                        onClick={(e) => handleDeleteListClick(e, list)}
                        title="Delete List"
                      >
                        🗑️
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* Tasks Content Area */}
        <main className="tasks-content">
          {error && <div className="error-message">{error}</div>}
          
          {!error && selectedList && (
            <>
              <div className="tasks-header">
                <h2>{selectedList.name}</h2>
                <div className="view-toggle">
                  <button 
                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    List View
                  </button>
                  <button 
                    className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                    onClick={() => setViewMode('kanban')}
                  >
                    Kanban Board
                  </button>
                </div>
              </div>
              
              {loadingTasks && (
                <div className="loading">Loading tasks...</div>
              )}
              
              {!loadingTasks && tasks.length === 0 && (
                <div className="no-tasks">
                  No tasks are present for this list
                </div>
              )}
              
              {!loadingTasks && tasks.length > 0 && viewMode === 'list' && (
                <div className="tasks-list">
                  {tasks.map((task) => (
                    <div key={task.id} className="task-item">
                      <div className="task-content">
                        <div className="task-title">{task.title}</div>
                        {task.status && (
                          <div className="task-status">Status: {task.status}</div>
                        )}
                      </div>
                      <div className="task-actions">
                        <button 
                          className="task-action-btn edit-task-btn"
                          onClick={() => handleEditTask(task)}
                          title="Edit Task"
                        >
                          ✏️
                        </button>
                        <button 
                          className="task-action-btn delete-task-btn"
                          onClick={(e) => handleDeleteTaskClick(e, task)}
                          title="Delete Task"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loadingTasks && viewMode === 'kanban' && (
                <div className="kanban-board">
                  {['CREATED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED'].map((status) => (
                    <div 
                      key={status}
                      className="kanban-column"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, status)}
                    >
                      <div className="kanban-column-header">
                        <h3>{status.replace('_', ' ')}</h3>
                        <span className="task-count">{getTasksByStatus(status).length}</span>
                      </div>
                      <div className="kanban-column-content">
                        {getTasksByStatus(status).map((task) => (
                          <div
                            key={task.id}
                            className="kanban-task-card"
                            draggable
                            onDragStart={(e) => handleDragStart(e, task)}
                          >
                            <div className="kanban-card-header">
                              <div className="kanban-task-title">{task.title}</div>
                              <div className="kanban-task-actions">
                                <button 
                                  className="kanban-action-btn edit-task-btn"
                                  onClick={() => handleEditTask(task)}
                                  title="Edit Task"
                                >
                                  ✏️
                                </button>
                                <button 
                                  className="kanban-action-btn delete-task-btn"
                                  onClick={(e) => handleDeleteTaskClick(e, task)}
                                  title="Delete Task"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                            {task.priority && (
                              <div className={`kanban-task-priority priority-${task.priority.toLowerCase()}`}>
                                {task.priority}
                              </div>
                            )}
                            {task.due_date && (
                              <div className="kanban-task-due">Due: {task.due_date}</div>
                            )}
                          </div>
                        ))}
                        {getTasksByStatus(status).length === 0 && (
                          <div className="kanban-empty">No tasks</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          
          {!error && !selectedList && !loadingLists && (
            <div className="no-selection">
              Select a list to view tasks
            </div>
          )}
        </main>
      </div>

      {/* Create List Dialog */}
      {showListDialog && (
        <div className="dialog-overlay" onClick={handleCloseListDialog}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2>Create New List</h2>
              <button 
                className="dialog-close"
                onClick={handleCloseListDialog}
                type="button"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmitList}>
              <div className="form-group">
                <label htmlFor="list-name">List Name *</label>
                <input
                  id="list-name"
                  type="text"
                  className="form-input"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  placeholder="Enter list name"
                  disabled={listSubmitting}
                  autoFocus
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="list-description">Description</label>
                <textarea
                  id="list-description"
                  className="form-textarea"
                  value={listDescription}
                  onChange={(e) => setListDescription(e.target.value)}
                  placeholder="Enter list description (optional)"
                  rows="4"
                  disabled={listSubmitting}
                />
              </div>
              
              {listFormError && (
                <div className="form-error">{listFormError}</div>
              )}
              
              <div className="dialog-actions">
                <button 
                  type="button"
                  className="btn-cancel"
                  onClick={handleCloseListDialog}
                  disabled={listSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-submit"
                  disabled={listSubmitting}
                >
                  {listSubmitting ? 'Creating...' : 'Create List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit List Dialog */}
      {showEditListDialog && (
        <div className="dialog-overlay" onClick={handleCloseEditListDialog}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2>Edit List</h2>
              <button 
                className="dialog-close"
                onClick={handleCloseEditListDialog}
                type="button"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleUpdateList}>
              <div className="form-group">
                <label htmlFor="edit-list-name">List Name *</label>
                <input
                  id="edit-list-name"
                  type="text"
                  className="form-input"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  placeholder="Enter list name"
                  disabled={listSubmitting}
                  autoFocus
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-list-description">Description</label>
                <textarea
                  id="edit-list-description"
                  className="form-textarea"
                  value={listDescription}
                  onChange={(e) => setListDescription(e.target.value)}
                  placeholder="Enter list description (optional)"
                  rows="4"
                  disabled={listSubmitting}
                />
              </div>
              
              {listFormError && (
                <div className="form-error">{listFormError}</div>
              )}
              
              <div className="dialog-actions">
                <button 
                  type="button"
                  className="btn-cancel"
                  onClick={handleCloseEditListDialog}
                  disabled={listSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-submit"
                  disabled={listSubmitting}
                >
                  {listSubmitting ? 'Updating...' : 'Update List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="dialog-overlay" onClick={handleCloseDeleteConfirm}>
          <div className="dialog confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2>Delete List</h2>
              <button 
                className="dialog-close"
                onClick={handleCloseDeleteConfirm}
                type="button"
              >
                ×
              </button>
            </div>
            
            <div className="dialog-body">
              <p className="warning-message">
                Are you sure you want to delete this list?
              </p>
              
              {deleteMessage && (
                <div className={deleteMessage.includes('deleted') ? 'success-message' : 'form-error'}>
                  {deleteMessage}
                </div>
              )}
            </div>
            
            <div className="dialog-actions dialog-actions-spaced">
              <button 
                type="button"
                className="btn-cancel"
                onClick={handleCloseDeleteConfirm}
                disabled={listSubmitting}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="btn-delete"
                onClick={handleDeleteList}
                disabled={listSubmitting}
              >
                {listSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Button */}
      {selectedList && (
        <button 
          className="create-task-btn"
          onClick={handleCreateTask}
          title="Create Task"
        >
          +
        </button>
      )}

      {/* Create Task Dialog */}
      {showTaskDialog && (
        <div className="dialog-overlay" onClick={handleCloseTaskDialog}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2>Create New Task</h2>
              <button 
                className="dialog-close"
                onClick={handleCloseTaskDialog}
                type="button"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmitTask}>
              <div className="form-group">
                <label htmlFor="task-title">Title *</label>
                <input
                  id="task-title"
                  type="text"
                  className="form-input"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Enter task title"
                  disabled={taskSubmitting}
                  autoFocus
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="task-description">Description</label>
                <textarea
                  id="task-description"
                  className="form-textarea"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Enter task description (optional)"
                  rows="3"
                  disabled={taskSubmitting}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="task-due-date">Due Date</label>
                <input
                  id="task-due-date"
                  type="date"
                  className="form-input"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  disabled={taskSubmitting}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="task-reminder-date">Reminder Date</label>
                <input
                  id="task-reminder-date"
                  type="date"
                  className="form-input"
                  value={taskReminderDate}
                  onChange={(e) => setTaskReminderDate(e.target.value)}
                  disabled={taskSubmitting}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="task-priority">Priority</label>
                <select
                  id="task-priority"
                  className="form-select"
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  disabled={taskSubmitting}
                >
                  <option value="VERY HIGH">Very High</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
              
              {taskFormError && (
                <div className="form-error">{taskFormError}</div>
              )}
              
              <div className="dialog-actions">
                <button 
                  type="button"
                  className="btn-cancel"
                  onClick={handleCloseTaskDialog}
                  disabled={taskSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-submit"
                  disabled={taskSubmitting}
                >
                  {taskSubmitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Task Confirmation Dialog */}
      {showDeleteTaskConfirm && (
        <div className="dialog-overlay" onClick={handleCloseDeleteTaskConfirm}>
          <div className="dialog confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2>Delete Task</h2>
              <button 
                className="dialog-close"
                onClick={handleCloseDeleteTaskConfirm}
                type="button"
              >
                ×
              </button>
            </div>
            
            <div className="dialog-body">
              <p className="warning-message">
                Are you sure you want to delete this task?
              </p>
              
              {deleteTaskMessage && (
                <div className={deleteTaskMessage.includes('deleted') ? 'success-message' : 'form-error'}>
                  {deleteTaskMessage}
                </div>
              )}
            </div>
            
            <div className="dialog-actions dialog-actions-spaced">
              <button 
                type="button"
                className="btn-cancel"
                onClick={handleCloseDeleteTaskConfirm}
                disabled={taskDeleting}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="btn-delete"
                onClick={handleDeleteTask}
                disabled={taskDeleting}
              >
                {taskDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;
