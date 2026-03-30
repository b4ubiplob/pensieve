import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { listAPI, taskAPI } from '../services/api';
import { logout } from '../services/auth';
import Header from './Header';
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
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskStatus, setTaskStatus] = useState('CREATED');
  const [taskFormError, setTaskFormError] = useState(null);
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [hideCompleted, setHideCompleted] = useState(false);
  const [showListDialog, setShowListDialog] = useState(false);
  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');
  const [editingList, setEditingList] = useState(null);
  const [listFormError, setListFormError] = useState(null);
  const [listSubmitting, setListSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState({
    'CREATED': false,        // Expanded by default
    'IN_PROGRESS': true,     // Collapsed
    'BLOCKED': true,         // Collapsed
    'COMPLETED': true        // Collapsed
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    if (!project || !user) {
      navigate('/projects');
      return;
    }
    fetchLists();
  }, [project, user, navigate]);

  useEffect(() => {
    if (selectedList) {
      fetchTasks(selectedList.id);
    }
  }, [selectedList]);

  const fetchLists = async () => {
    try {
      setLoadingLists(true);
      setError(null);
      const response = await listAPI.getLists(project.id);

      if (response.ok) {
        const data = await response.json();
        const sortedLists = data.sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        );
        setLists(sortedLists);

        if (sortedLists.length > 0) {
          setSelectedList(sortedLists[0]);
        }
      } else {
        setError('Failed to load lists');
      }
    } catch (err) {
      setError('Failed to connect to server');
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
        setTasks([]);
      }
    } catch (err) {
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleBackToProjects = () => {
    navigate('/projects', { state: { user } });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleCreateTask = (status = 'CREATED') => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskDueDate('');
    setTaskPriority('MEDIUM');
    setTaskStatus(status);
    setTaskFormError(null);
    setShowTaskDialog(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description || '');
    setTaskDueDate(task.dueDate || '');
    setTaskPriority(task.priority || 'MEDIUM');
    setTaskStatus(task.status);
    setTaskFormError(null);
    setShowTaskDialog(true);
  };

  const handleCloseTaskDialog = () => {
    setShowTaskDialog(false);
    setTaskFormError(null);
    setEditingTask(null);
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();

    if (!taskTitle.trim()) {
      setTaskFormError('Task title is required');
      return;
    }

    if (!selectedList) {
      setTaskFormError('No list selected');
      return;
    }

    try {
      setTaskSubmitting(true);
      setTaskFormError(null);

      const taskData = {
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        dueDate: taskDueDate || null,
        priority: taskPriority,
        status: taskStatus,
      };

      let response;
      if (editingTask) {
        response = await taskAPI.updateTask(editingTask.id, taskData);
      } else {
        response = await taskAPI.createTask(selectedList.id, taskData);
      }

      if (response.ok || response.status === 201) {
        handleCloseTaskDialog();
        await fetchTasks(selectedList.id);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setTaskFormError(errorData.message || 'Failed to save task');
      }
    } catch (err) {
      setTaskFormError('Failed to connect to server');
    } finally {
      setTaskSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    setConfirmMessage('Are you sure you want to delete this task?');
    setConfirmAction(() => async () => {
      try {
        const response = await taskAPI.deleteTask(taskId);
        if (response.ok) {
          await fetchTasks(selectedList.id);
        }
      } catch (err) {
        console.error('Error deleting task:', err);
      }
    });
    setShowConfirmDialog(true);
  };

  const handleCreateList = () => {
    setEditingList(null);
    setListName('');
    setListDescription('');
    setListFormError(null);
    setShowListDialog(true);
  };

  const handleEditList = (list, e) => {
    e.stopPropagation();
    setEditingList(list);
    setListName(list.name);
    setListDescription(list.description || '');
    setListFormError(null);
    setShowListDialog(true);
  };

  const handleCloseListDialog = () => {
    setShowListDialog(false);
    setListFormError(null);
    setEditingList(null);
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

      const listData = {
        name: listName.trim(),
        description: listDescription.trim()
      };

      let response;
      if (editingList) {
        response = await listAPI.updateList(editingList.id, listData);
      } else {
        response = await listAPI.createList(project.id, listData);
      }

      if (response.ok || response.status === 201) {
        handleCloseListDialog();
        await fetchLists();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setListFormError(errorData.message || 'Failed to save list');
      }
    } catch (err) {
      setListFormError('Failed to connect to server');
    } finally {
      setListSubmitting(false);
    }
  };

  const handleDeleteList = async (listId, e) => {
    e.stopPropagation();

    setConfirmMessage('Are you sure you want to delete this list? All tasks in this list will also be deleted.');
    setConfirmAction(() => async () => {
      try {
        const response = await listAPI.deleteList(listId);
        if (response.ok || response.status === 204) {
          if (selectedList?.id === listId) {
            setSelectedList(null);
            setTasks([]);
          }
          await fetchLists();
        }
      } catch (err) {
        console.error('Error deleting list:', err);
      }
    });
    setShowConfirmDialog(true);
  };

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

    if (!draggedTask) return;

    try {
      const response = await taskAPI.updateTask(draggedTask.id, {
        ...draggedTask,
        status: newStatus,
      });

      if (response.ok) {
        await fetchTasks(selectedList.id);
      }
    } catch (err) {
      console.error('Error updating task status:', err);
    } finally {
      setDraggedTask(null);
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => {
      const matchesStatus = task.status === status;
      const matchesSearch = !searchQuery ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'VERY_HIGH': 'error',
      'HIGH': 'primary',
      'MEDIUM': 'tertiary',
      'LOW': 'secondary'
    };
    return colors[priority] || 'secondary';
  };

  const toggleGroup = (status) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  const getTasksByStatusGrouped = () => {
    const filteredTasks = tasks.filter(task => {
      const matchesCompleted = hideCompleted ? task.status !== 'COMPLETED' : true;
      const matchesSearch = !searchQuery ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCompleted && matchesSearch;
    });

    const grouped = {};
    columns.forEach(column => {
      grouped[column.id] = filteredTasks.filter(task => task.status === column.id);
    });

    return grouped;
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

  if (!project || !user) return null;

  const columns = [
    { id: 'CREATED', title: 'To Do', color: 'outline', dotColor: '#6d758c' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'primary', dotColor: '#9fa7ff' },
    { id: 'BLOCKED', title: 'Blocked', color: 'error', dotColor: '#ff6e84' },
    { id: 'COMPLETED', title: 'Done', color: 'tertiary', dotColor: '#47c4ff' }
  ];

  return (
    <div className="tasks-wrapper" data-theme={isDarkMode ? 'dark' : 'light'}>
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
          <p className="workspace-subtitle">Project Lists</p>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item" onClick={handleBackToProjects}>
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="nav-item-text">Back to Projects</span>
          </div>

          <div className="nav-item add-list-item" onClick={handleCreateList}>
            <span className="material-symbols-outlined">add</span>
            <span className="nav-item-text">Add List</span>
          </div>

          {loadingLists ? (
            <div className="nav-item">
              <span className="material-symbols-outlined">hourglass_empty</span>
              <span className="nav-item-text">Loading...</span>
            </div>
          ) : lists.length === 0 ? (
            <div className="nav-item">
              <span className="material-symbols-outlined">inbox</span>
              <span className="nav-item-text">No lists</span>
            </div>
          ) : (
            lists.map(list => (
              <div
                key={list.id}
                className={`nav-item list-item-with-actions ${selectedList?.id === list.id ? 'active' : ''}`}
                onClick={() => setSelectedList(list)}
              >
                <span className="material-symbols-outlined">
                  {selectedList?.id === list.id ? 'check_box' : 'list'}
                </span>
                <span className="nav-item-text">{list.name}</span>
                <div className="list-item-actions">
                  <button
                    className="list-item-action-btn"
                    onClick={(e) => handleEditList(list, e)}
                    title="Edit list"
                  >
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button
                    className="list-item-action-btn delete"
                    onClick={(e) => handleDeleteList(list.id, e)}
                    title="Delete list"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`pensieve-main ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Top Header */}
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          renderUserIcon={renderUserIcon}
          searchPlaceholder="Search tasks..."
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Board Container */}
        <div className="board-container">
          {/* Board Header */}
          <header className="board-header">
            <div className="board-info">
              <h1 className="board-title">{selectedList ? selectedList.name : project.name}</h1>
              <p className="board-description">
                {selectedList ? `Tasks for ${selectedList.name}` : project.description || 'Project task management board'}
              </p>
            </div>
            <div className="board-meta">
              <div className="view-toggle-group">
                <button
                  className={`view-toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                  onClick={() => setViewMode('kanban')}
                  title="Kanban view"
                >
                  <span className="material-symbols-outlined">view_column</span>
                </button>
                <button
                  className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List view"
                >
                  <span className="material-symbols-outlined">view_list</span>
                </button>
              </div>
              {viewMode === 'list' && (
                <div className="hide-completed-toggle">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={hideCompleted}
                      onChange={(e) => setHideCompleted(e.target.checked)}
                      className="toggle-checkbox"
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-text">Hide completed</span>
                  </label>
                </div>
              )}
              <button className="add-member-btn" onClick={() => handleCreateTask()} title="Add task">
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          </header>

          {/* Kanban Board */}
          {viewMode === 'kanban' ? (
            loadingLists || loadingTasks ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
              </div>
            ) : error ? (
              <div className="error-state">{error}</div>
            ) : (
              <div className="kanban-grid">
              {columns.map(column => {
                const columnTasks = getTasksByStatus(column.id);
                return (
                  <div
                    key={column.id}
                    className="kanban-column"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, column.id)}
                  >
                    <div className="column-header">
                      <div className="column-title-group">
                        <span className="column-dot" style={{ backgroundColor: column.dotColor }}></span>
                        <h3 className="column-title">{column.title}</h3>
                        <span className="column-count">{columnTasks.length}</span>
                      </div>
                      <button
                        className="column-menu-btn"
                        onClick={() => handleCreateTask(column.id)}
                        title="Add task"
                      >
                        <span className="material-symbols-outlined">add</span>
                      </button>
                    </div>

                    <div className="task-cards">
                      {columnTasks.length === 0 ? (
                        <div className="empty-state">
                          <span className="material-symbols-outlined">inbox</span>
                          <p>No tasks</p>
                        </div>
                      ) : (
                        columnTasks.map(task => (
                          <div
                            key={task.id}
                            className={`task-card ${column.id === 'COMPLETED' ? 'completed' : ''} ${column.id === 'IN_PROGRESS' ? 'in-progress' : ''} ${column.id === 'BLOCKED' ? 'blocked' : ''}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task)}
                            onClick={() => handleEditTask(task)}
                          >
                            <div className="task-tags">
                              <span className={`task-tag priority-${task.priority?.toLowerCase()}`}>
                                {task.priority?.replace('_', ' ')}
                              </span>
                            </div>

                            <h4 className="task-title">
                              {task.title}
                            </h4>

                            {column.id === 'IN_PROGRESS' && (
                              <div className="task-progress">
                                <div className="progress-bar-container">
                                  <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: '66%' }}></div>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="task-footer">
                              <div className="task-meta">
                                {task.dueDate && (
                                  <div className="task-date">
                                    <span className="material-symbols-outlined">calendar_today</span>
                                    <span>{formatDate(task.dueDate)}</span>
                                  </div>
                                )}
                                {column.id === 'COMPLETED' && (
                                  <div className="task-completed-badge">
                                    <span className="material-symbols-outlined">check_circle</span>
                                    <span>Completed</span>
                                  </div>
                                )}
                              </div>
                              <div className="task-card-actions">
                                <button
                                  className="task-card-action-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditTask(task);
                                  }}
                                  title="Edit task"
                                >
                                  <span className="material-symbols-outlined">edit</span>
                                </button>
                                <button
                                  className="task-card-action-btn delete"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTask(task.id);
                                  }}
                                  title="Delete task"
                                >
                                  <span className="material-symbols-outlined">delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            )
          ) : (
            /* List View */
            <div className="list-view">
              {loadingLists || loadingTasks ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                </div>
              ) : error ? (
                <div className="error-state">{error}</div>
              ) : (() => {
                const groupedTasks = getTasksByStatusGrouped();
                const totalTasks = Object.values(groupedTasks).reduce((sum, tasks) => sum + tasks.length, 0);

                return totalTasks === 0 ? (
                  <div className="empty-state">
                    <span className="material-symbols-outlined">inbox</span>
                    <p>{hideCompleted ? 'No active tasks' : 'No tasks in this list'}</p>
                  </div>
                ) : (
                  <div className="list-view-grouped">
                    {columns.map(column => {
                      const columnTasks = groupedTasks[column.id];
                      if (columnTasks.length === 0) return null;

                      const isCollapsed = collapsedGroups[column.id];

                      return (
                        <div key={column.id} className="task-group">
                          <div className="task-group-header" onClick={() => toggleGroup(column.id)}>
                            <div className="task-group-title-section">
                              <span className="material-symbols-outlined collapse-icon">
                                {isCollapsed ? 'chevron_right' : 'expand_more'}
                              </span>
                              <span className="group-status-dot" style={{ backgroundColor: column.dotColor }}></span>
                              <h3 className="task-group-title">{column.title}</h3>
                              <span className="task-group-count">{columnTasks.length}</span>
                            </div>
                            <button
                              className="group-add-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCreateTask(column.id);
                              }}
                              title="Add task to this group"
                            >
                              <span className="material-symbols-outlined">add</span>
                            </button>
                          </div>

                          {!isCollapsed && (
                            <div className="task-group-content">
                              {columnTasks.map(task => (
                                <div key={task.id} className="list-task-row" onClick={() => handleEditTask(task)}>
                                  <div className="list-task-main">
                                    <div className="list-task-checkbox">
                                      <div className={`task-checkbox ${task.status === 'COMPLETED' ? 'checked' : ''}`}>
                                        {task.status === 'COMPLETED' && (
                                          <span className="material-symbols-outlined">check</span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="list-task-info">
                                      <h4 className={`list-task-title ${task.status === 'COMPLETED' ? 'completed' : ''}`}>
                                        {task.title}
                                      </h4>
                                      {task.description && (
                                        <p className="list-task-description">{task.description}</p>
                                      )}
                                      <div className="list-task-meta">
                                        <span className={`priority-badge-small priority-${task.priority?.toLowerCase()}`}>
                                          {task.priority?.replace('_', ' ')}
                                        </span>
                                        {task.dueDate && (
                                          <div className="due-date-small">
                                            <span className="material-symbols-outlined">calendar_today</span>
                                            <span>{formatDate(task.dueDate)}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="list-task-actions">
                                    <button
                                      className="list-action-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditTask(task);
                                      }}
                                      title="Edit task"
                                    >
                                      <span className="material-symbols-outlined">edit</span>
                                    </button>
                                    <button
                                      className="list-action-btn delete"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTask(task.id);
                                      }}
                                      title="Delete task"
                                    >
                                      <span className="material-symbols-outlined">delete</span>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </main>

      {/* Task Dialog */}
      {showTaskDialog && (
        <div className="dialog-overlay" onClick={handleCloseTaskDialog}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title">{editingTask ? 'Edit Task' : 'Create Task'}</h2>
              <button className="dialog-close" onClick={handleCloseTaskDialog}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmitTask} className="dialog-form">
              <div className="form-group">
                <label className="form-label">Task Title *</label>
                <input
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
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Enter task description (optional)"
                  rows="3"
                  disabled={taskSubmitting}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  disabled={taskSubmitting}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  disabled={taskSubmitting}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="VERY_HIGH">Very High</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={taskStatus}
                  onChange={(e) => setTaskStatus(e.target.value)}
                  disabled={taskSubmitting}
                >
                  <option value="CREATED">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="BLOCKED">Blocked</option>
                  <option value="COMPLETED">Done</option>
                </select>
              </div>
              {taskFormError && <div className="form-error">{taskFormError}</div>}
              <div className="dialog-actions">
                {editingTask && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      handleCloseTaskDialog();
                      handleDeleteTask(editingTask.id);
                    }}
                    disabled={taskSubmitting}
                  >
                    Delete
                  </button>
                )}
                <button type="button" className="btn btn-secondary" onClick={handleCloseTaskDialog} disabled={taskSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={taskSubmitting}>
                  {taskSubmitting ? (editingTask ? 'Saving...' : 'Creating...') : (editingTask ? 'Save Task' : 'Create Task')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List Dialog */}
      {showListDialog && (
        <div className="dialog-overlay" onClick={handleCloseListDialog}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title">{editingList ? 'Edit List' : 'Create List'}</h2>
              <button className="dialog-close" onClick={handleCloseListDialog}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmitList} className="dialog-form">
              <div className="form-group">
                <label className="form-label">List Name *</label>
                <input
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
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={listDescription}
                  onChange={(e) => setListDescription(e.target.value)}
                  placeholder="Enter list description (optional)"
                  rows="3"
                  disabled={listSubmitting}
                />
              </div>
              {listFormError && <div className="form-error">{listFormError}</div>}
              <div className="dialog-actions">
                {editingList && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={(e) => {
                      handleCloseListDialog();
                      handleDeleteList(editingList.id, e);
                    }}
                    disabled={listSubmitting}
                  >
                    Delete
                  </button>
                )}
                <button type="button" className="btn btn-secondary" onClick={handleCloseListDialog} disabled={listSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={listSubmitting}>
                  {listSubmitting ? (editingList ? 'Saving...' : 'Creating...') : (editingList ? 'Save List' : 'Create List')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {showConfirmDialog && (
        <div className="dialog-overlay" onClick={() => setShowConfirmDialog(false)}>
          <div className="dialog-content confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <div className="confirm-icon">
                <span className="material-symbols-outlined">warning</span>
              </div>
            </div>
            <div className="confirm-body">
              <h2 className="dialog-title">Confirm Delete</h2>
              <p className="confirm-message">{confirmMessage}</p>
            </div>
            <div className="dialog-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={async () => {
                  setShowConfirmDialog(false);
                  if (confirmAction) {
                    await confirmAction();
                  }
                }}
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

export default Tasks;
