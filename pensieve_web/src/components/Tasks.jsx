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
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState(null);
  const [showEditProjectDialog, setShowEditProjectDialog] = useState(false);
  const [editingLists, setEditingLists] = useState([]);
  const [expandedTasks, setExpandedTasks] = useState({});
  const [expandedListViewTasks, setExpandedListViewTasks] = useState({});

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
        setLists(data); // Backend now returns ordered lists

        // Check if there's a selectedListId from navigation state (e.g., returning from task detail)
        const selectedListIdFromState = location.state?.selectedListId;
        if (selectedListIdFromState) {
          const listToSelect = data.find(l => l.id === selectedListIdFromState);
          if (listToSelect) {
            setSelectedList(listToSelect);
            return;
          }
        }

        // Otherwise select the first list
        if (data.length > 0) {
          setSelectedList(data[0]);
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

  const handleEditProject = () => {
    setEditingLists([...lists]);
    setShowEditProjectDialog(true);
  };

  const handleMoveListUp = (index) => {
    if (index === 0) return;
    const newLists = [...editingLists];
    [newLists[index - 1], newLists[index]] = [newLists[index], newLists[index - 1]];
    setEditingLists(newLists);
  };

  const handleMoveListDown = (index) => {
    if (index === editingLists.length - 1) return;
    const newLists = [...editingLists];
    [newLists[index], newLists[index + 1]] = [newLists[index + 1], newLists[index]];
    setEditingLists(newLists);
  };

  const handleSaveListOrder = async () => {
    const reorderData = editingLists.map((list, index) => ({
      listId: list.id,
      displayOrder: (index + 1) * 1000,
    }));

    try {
      const response = await listAPI.reorderLists(project.id, reorderData);

      if (response.ok) {
        const updatedLists = await response.json();
        setLists(updatedLists);
        setShowEditProjectDialog(false);
      } else {
        console.error('Failed to reorder lists');
      }
    } catch (error) {
      console.error('Failed to reorder lists:', error);
    }
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

  const handleCreateTask = async (status = 'CREATED') => {
    if (!selectedList) {
      return;
    }

    try {
      const taskData = {
        title: 'New Task',
        description: '',
        dueDate: null,
        priority: 'MEDIUM',
        status: status,
      };

      const response = await taskAPI.createTask(selectedList.id, taskData);

      if (response.ok || response.status === 201) {
        const newTask = await response.json();
        await fetchTasks(selectedList.id);
        // Navigate to the new task detail page in edit mode
        navigate('/task-detail', { state: { task: newTask, project, list: selectedList, user, openInEditMode: true } });
      }
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleEditTask = (task) => {
    navigate('/task-detail', { state: { task, project, list: selectedList, user } });
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

  const handleExportList = async (list, e) => {
    e.stopPropagation();

    try {
      const response = await listAPI.exportList(list.id);
      if (response.ok) {
        const exportData = await response.json();

        // Create and download JSON file
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${list.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error exporting list:', err);
    }
  };

  const handleImportList = () => {
    setShowImportDialog(true);
    setImportError(null);
  };

  const handleImportFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setImportError(null);
      const text = await file.text();

      let listData;
      try {
        listData = JSON.parse(text);
      } catch (parseError) {
        setImportError('Invalid JSON file: The file is not a valid JSON format.');
        return;
      }

      // Call the backend import endpoint
      const response = await listAPI.importList(project.id, listData);

      if (response.status === 201) {
        // Success - refresh lists
        await fetchLists();
        setShowImportDialog(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || 'Failed to import list. Please check the file format.';
        setImportError(errorMsg);
      }
    } catch (err) {
      console.error('Error importing list:', err);
      setImportError('Failed to import list: ' + err.message);
    } finally {
      setIsImporting(false);
    }
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
    const filteredTasks = tasks.filter(task => {
      const matchesStatus = task.status === status;
      const matchesSearch = !searchQuery ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });

    // Separate parent tasks from subtasks
    const parentTasks = filteredTasks.filter(task => !task.parentTaskId);

    // Build subtask map from ALL tasks (not just filtered by status)
    // This ensures parent tasks show all their subtasks regardless of subtask status
    const subtaskMap = {};
    tasks.forEach(task => {
      if (task.parentTaskId) {
        if (!subtaskMap[task.parentTaskId]) {
          subtaskMap[task.parentTaskId] = [];
        }
        subtaskMap[task.parentTaskId].push(task);
      }
    });

    // Attach subtasks to their parent tasks
    return parentTasks.map(task => ({
      ...task,
      subTasks: subtaskMap[task.id] || []
    }));
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

  const toggleTaskExpansion = (taskId, e) => {
    e.stopPropagation();
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const toggleListViewTaskExpansion = (taskId, e) => {
    e.stopPropagation();
    setExpandedListViewTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
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

    // Separate parent tasks from subtasks
    const parentTasks = filteredTasks.filter(task => !task.parentTaskId);
    const subtaskMap = {};

    // Group subtasks by parent ID
    filteredTasks.forEach(task => {
      if (task.parentTaskId) {
        if (!subtaskMap[task.parentTaskId]) {
          subtaskMap[task.parentTaskId] = [];
        }
        subtaskMap[task.parentTaskId].push(task);
      }
    });

    // Attach subtasks to their parent tasks
    const tasksWithSubtasks = parentTasks.map(task => ({
      ...task,
      subTasks: subtaskMap[task.id] || []
    }));

    // Group by status
    const grouped = {};
    columns.forEach(column => {
      grouped[column.id] = tasksWithSubtasks.filter(task => task.status === column.id);
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
          <div className="workspace-header">
            <div>
              <h2 className="workspace-title">{project.name}</h2>
              <p className="workspace-subtitle">Project Lists</p>
            </div>
          </div>
          <div className="workspace-actions">
            <button
              className="workspace-action-btn"
              onClick={handleCreateList}
              title="Add List"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
            <button
              className="workspace-action-btn"
              onClick={handleImportList}
              title="Import List"
            >
              <span className="material-symbols-outlined">upload</span>
            </button>
            <button
              className="workspace-action-btn"
              onClick={handleEditProject}
              title="Edit Project"
            >
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item" onClick={handleBackToProjects}>
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="nav-item-text">Back to Projects</span>
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
              >
                <span
                  className="material-symbols-outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedList(list);
                  }}
                >
                  {selectedList?.id === list.id ? 'check_box' : 'list'}
                </span>
                <span
                  className="nav-item-text"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedList(list);
                  }}
                >
                  {list.name}
                </span>
                <div className="list-item-actions">
                  <button
                    className="list-item-action-btn"
                    onClick={(e) => handleExportList(list, e)}
                    title="Export list"
                  >
                    <span className="material-symbols-outlined">download</span>
                  </button>
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
                          <div key={task.id} className="task-card-wrapper">
                            <div
                              className={`task-card ${column.id === 'COMPLETED' ? 'completed' : ''} ${column.id === 'IN_PROGRESS' ? 'in-progress' : ''} ${column.id === 'BLOCKED' ? 'blocked' : ''} ${task.subTasks && task.subTasks.length > 0 ? 'has-subtasks' : ''}`}
                              draggable
                              onDragStart={(e) => handleDragStart(e, task)}
                              onClick={() => handleEditTask(task)}
                            >
                              <div className="task-card-header">
                                {task.subTasks && task.subTasks.length > 0 && (
                                  <button
                                    className="task-expand-btn"
                                    onClick={(e) => toggleTaskExpansion(task.id, e)}
                                    title={expandedTasks[task.id] ? 'Collapse subtasks' : 'Expand subtasks'}
                                  >
                                    <span className="material-symbols-outlined">
                                      {expandedTasks[task.id] ? 'expand_less' : 'expand_more'}
                                    </span>
                                  </button>
                                )}
                                <div className="task-tags">
                                  <span className={`task-tag priority-${task.priority?.toLowerCase()}`}>
                                    {task.priority?.replace('_', ' ')}
                                  </span>
                                  {task.subTasks && task.subTasks.length > 0 && (
                                    <span className="task-subtask-count">
                                      <span className="material-symbols-outlined">checklist</span>
                                      {task.subTasks.filter(st => st.status === 'COMPLETED').length}/{task.subTasks.length}
                                    </span>
                                  )}
                                </div>
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
                              </div>
                            </div>

                            {/* Subtasks */}
                            {expandedTasks[task.id] && task.subTasks && task.subTasks.length > 0 && (
                              <div className="subtask-list">
                                {task.subTasks.map(subtask => (
                                  <div
                                    key={subtask.id}
                                    className={`subtask-card ${subtask.status === 'COMPLETED' ? 'completed' : ''}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditTask(subtask);
                                    }}
                                  >
                                    <span className="material-symbols-outlined subtask-icon">
                                      {subtask.status === 'COMPLETED' ? 'check_circle' : 'radio_button_unchecked'}
                                    </span>
                                    <span className="subtask-title">{subtask.title}</span>
                                  </div>
                                ))}
                              </div>
                            )}
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
                                <div key={task.id} className="task-tree-item">
                                  <div className="list-task-row" onClick={() => handleEditTask(task)}>
                                    <div className="list-task-main">
                                      {task.subTasks && task.subTasks.length > 0 && (
                                        <button
                                          className="list-task-expand-btn"
                                          onClick={(e) => toggleListViewTaskExpansion(task.id, e)}
                                          title={expandedListViewTasks[task.id] ? 'Collapse subtasks' : 'Expand subtasks'}
                                        >
                                          <span className="material-symbols-outlined">
                                            {expandedListViewTasks[task.id] ? 'expand_more' : 'chevron_right'}
                                          </span>
                                        </button>
                                      )}
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
                                          {task.subTasks && task.subTasks.length > 0 && (
                                            <span className="subtask-count-badge">
                                              <span className="material-symbols-outlined">checklist</span>
                                              {task.subTasks.filter(st => st.status === 'COMPLETED').length}/{task.subTasks.length}
                                            </span>
                                          )}
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

                                  {/* Subtasks */}
                                  {expandedListViewTasks[task.id] && task.subTasks && task.subTasks.length > 0 && (
                                    <div className="subtasks-tree">
                                      {task.subTasks.map(subtask => (
                                        <div key={subtask.id} className="list-task-row subtask-row" onClick={() => handleEditTask(subtask)}>
                                          <div className="list-task-main">
                                            <div className="subtask-connector"></div>
                                            <div className="list-task-checkbox">
                                              <div className={`task-checkbox ${subtask.status === 'COMPLETED' ? 'checked' : ''}`}>
                                                {subtask.status === 'COMPLETED' && (
                                                  <span className="material-symbols-outlined">check</span>
                                                )}
                                              </div>
                                            </div>
                                            <div className="list-task-info">
                                              <h4 className={`list-task-title ${subtask.status === 'COMPLETED' ? 'completed' : ''}`}>
                                                {subtask.title}
                                              </h4>
                                              {subtask.description && (
                                                <p className="list-task-description">{subtask.description}</p>
                                              )}
                                              <div className="list-task-meta">
                                                <span className={`priority-badge-small priority-${subtask.priority?.toLowerCase()}`}>
                                                  {subtask.priority?.replace('_', ' ')}
                                                </span>
                                                {subtask.dueDate && (
                                                  <div className="due-date-small">
                                                    <span className="material-symbols-outlined">calendar_today</span>
                                                    <span>{formatDate(subtask.dueDate)}</span>
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
                                                handleEditTask(subtask);
                                              }}
                                              title="Edit subtask"
                                            >
                                              <span className="material-symbols-outlined">edit</span>
                                            </button>
                                            <button
                                              className="list-action-btn delete"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteTask(subtask.id);
                                              }}
                                              title="Delete subtask"
                                            >
                                              <span className="material-symbols-outlined">delete</span>
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
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

      {/* List Dialog */}
      {showListDialog && (
        <div className="dialog-overlay" onClick={handleCloseListDialog}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title">{editingList ? 'Edit List' : 'Create List'}</h2>
              <button className="dialog-close" onClick={handleCloseListDialog} title="Close dialog">
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

      {/* Edit Project Dialog */}
      {showEditProjectDialog && (
        <div className="dialog-overlay" onClick={() => setShowEditProjectDialog(false)}>
          <div className="dialog-content edit-project-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title">Edit Project</h2>
              <button className="dialog-close" onClick={() => setShowEditProjectDialog(false)} title="Close dialog">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="dialog-body">
              <h3 className="section-title">Project Details</h3>
              <div className="project-info">
                <p><strong>Name:</strong> {project.name}</p>
                <p><strong>Description:</strong> {project.description || 'No description'}</p>
              </div>

              <h3 className="section-title">Reorder Lists</h3>
              <p className="section-description">Use the arrow buttons to change the order of lists</p>
              <div className="reorder-list">
                {editingLists.map((list, index) => (
                  <div key={list.id} className="reorder-item">
                    <span className="reorder-item-name">{list.name}</span>
                    <div className="reorder-item-actions">
                      <button
                        className="reorder-btn"
                        onClick={() => handleMoveListUp(index)}
                        disabled={index === 0}
                        title="Move up"
                      >
                        <span className="material-symbols-outlined">arrow_upward</span>
                      </button>
                      <button
                        className="reorder-btn"
                        onClick={() => handleMoveListDown(index)}
                        disabled={index === editingLists.length - 1}
                        title="Move down"
                      >
                        <span className="material-symbols-outlined">arrow_downward</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="dialog-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowEditProjectDialog(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveListOrder}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import List Dialog */}
      {showImportDialog && (
        <div className="dialog-overlay" onClick={() => setShowImportDialog(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title">Import List</h2>
              <button className="dialog-close" onClick={() => setShowImportDialog(false)} title="Close dialog">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="dialog-form">
              <div className="form-group">
                <label className="form-label">Select JSON file</label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFileSelect}
                  disabled={isImporting}
                  className="file-input"
                />
                <p className="form-hint">Choose a JSON file exported from another list</p>
              </div>
              {importError && <div className="form-error">{importError}</div>}
              {isImporting && (
                <div className="importing-state">
                  <div className="loading-spinner"></div>
                  <p>Importing list...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;
