import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { projectAPI, taskAPI, listAPI } from '../services/api';
import { logout, getStoredUser } from '../services/auth';
import Header from './Header';
import './Projects.css';

function Projects() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedView, setSelectedView] = useState('dashboard');
  const [myDayTasks, setMyDayTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewProjectMenu, setShowNewProjectMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [collapsedProjects, setCollapsedProjects] = useState({});

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(storedUser);
    fetchProjects(storedUser.id);
  }, [navigate]);

  useEffect(() => {
    if ((selectedView === 'my-day' || selectedView === 'dashboard') && user) {
      fetchMyDayTasks(user.id);
    }
  }, [selectedView, user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.user-dropdown-wrapper')) {
        setShowDropdown(false);
      }
      if (showNewProjectMenu && !event.target.closest('.new-project-menu-wrapper')) {
        setShowNewProjectMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDropdown, showNewProjectMenu]);

  const fetchProjects = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectAPI.getProjects(userId);
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        setError('Failed to load projects');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyDayTasks = async (userId) => {
    try {
      setLoadingTasks(true);
      const response = await taskAPI.getTasksByUser(userId, 'IN_PROGRESS');
      if (response.ok) {
        const data = await response.json();
        setMyDayTasks(data);

        // Initialize collapsed state - first project expanded, others collapsed
        const projectIds = [...new Set(data.map(task => task.projectId).filter(Boolean))];
        const initialCollapsedState = {};
        projectIds.forEach((projectId, index) => {
          initialCollapsedState[projectId] = index !== 0; // First project (index 0) is false (expanded)
        });
        setCollapsedProjects(initialCollapsedState);
      } else {
        setMyDayTasks([]);
      }
    } catch (err) {
      setMyDayTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCreateProject = () => {
    setShowDialog(true);
    setFormError(null);
    setProjectName('');
    setProjectDescription('');
    setShowNewProjectMenu(false);
  };

  const handleImportProject = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        setIsImporting(true);
        const text = await file.text();
        console.log('File content:', text);

        let projectData;
        try {
          projectData = JSON.parse(text);
          console.log('Parsed project data:', projectData);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          setErrorMessage('Invalid JSON file: The file is not a valid JSON format.');
          setShowErrorDialog(true);
          return;
        }

        // Call the backend import endpoint
        const response = await projectAPI.importProject(user.id, projectData);

        if (response.status === 201) {
          // Success - refresh projects list
          await fetchProjects(user.id);
          setShowNewProjectMenu(false);
          console.log('Project imported successfully');
        } else {
          // Handle error response
          const errorData = await response.json().catch(() => ({}));
          const errorMsg = errorData.error || 'Failed to import project. Please check the file format.';
          setErrorMessage(errorMsg);
          setShowErrorDialog(true);
        }
      } catch (err) {
        console.error('Error importing project:', err);
        setErrorMessage('Failed to import project: ' + err.message);
        setShowErrorDialog(true);
      } finally {
        setIsImporting(false);
      }
    };
    input.click();
    setShowNewProjectMenu(false);
  };

  const handleCloseErrorDialog = () => {
    setShowErrorDialog(false);
    setErrorMessage('');
  };

  const toggleNewProjectMenu = () => {
    setShowNewProjectMenu(!showNewProjectMenu);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setFormError(null);
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setFormError('Project name is required');
      return;
    }
    if (!user) return;

    try {
      setSubmitting(true);
      setFormError(null);
      const response = await projectAPI.createProject(user.id, {
        name: projectName.trim(),
        description: projectDescription.trim(),
      });
      if (response.status === 201) {
        handleCloseDialog();
        await fetchProjects(user.id);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setFormError(errorData.message || 'Failed to create project');
      }
    } catch (err) {
      setFormError('Failed to connect to server');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProjectClick = (project) => {
    navigate('/tasks', { state: { project, user } });
  };

  const handleViewChange = (view) => {
    setSelectedView(view);
  };

  const handleTaskClick = (task) => {
    const project = { id: task.projectId, name: task.projectName };
    const list = { id: task.listId, name: task.listName };
    navigate('/task-detail', { state: { task, project, list, user } });
  };

  const handleSetToCompleted = async (task) => {
    try {
      const response = await taskAPI.updateTask(task.id, {
        status: 'COMPLETED',
        completedDate: new Date().toISOString(),
      });
      if (response.ok) {
        await fetchMyDayTasks(user.id);
      }
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const toggleProjectCollapse = (projectId) => {
    setCollapsedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  const groupTasksByProject = (tasks) => {
    const grouped = {};
    tasks.forEach(task => {
      const projectId = task.projectId || 'no-project';
      const projectName = task.projectName || 'No Project';

      if (!grouped[projectId]) {
        grouped[projectId] = {
          projectId,
          projectName,
          tasks: []
        };
      }
      grouped[projectId].tasks.push(task);
    });

    // Sort projects alphabetically by name
    return Object.values(grouped).sort((a, b) =>
      a.projectName.localeCompare(b.projectName)
    );
  };

  const handleExportProject = async (project, event) => {
    event.stopPropagation();

    try {
      // Fetch project details
      const projectResponse = await projectAPI.getProjectById(project.id);
      if (!projectResponse.ok) {
        console.error('Failed to fetch project details');
        return;
      }
      const projectData = await projectResponse.json();

      // Fetch lists for the project
      const listsResponse = await listAPI.getLists(project.id);
      if (!listsResponse.ok) {
        console.error('Failed to fetch lists');
        return;
      }
      const lists = await listsResponse.json();

      // Fetch tasks for each list
      const listsWithTasks = await Promise.all(
        lists.map(async (list) => {
          const tasksResponse = await taskAPI.getTasks(list.id);
          if (tasksResponse.ok) {
            const tasks = await tasksResponse.json();

            // Fetch subtasks for each task
            const tasksWithSubtasks = await Promise.all(
              tasks.map(async (task) => {
                const taskResponse = await taskAPI.getTaskById(task.id);
                if (taskResponse.ok) {
                  return await taskResponse.json();
                }
                return task;
              })
            );

            return { ...list, tasks: tasksWithSubtasks };
          }
          return { ...list, tasks: [] };
        })
      );

      // Build complete export structure
      const exportData = {
        ...projectData,
        lists: listsWithTasks,
        exportedAt: new Date().toISOString(),
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting project:', err);
    }
  };

  const handleDeleteProject = async (project, event) => {
    event.stopPropagation();
    setProjectToDelete(project);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;

    try {
      setIsDeleting(true);
      const response = await projectAPI.deleteProject(projectToDelete.id);
      if (response.status === 204) {
        // Refresh projects list
        await fetchProjects(user.id);
        setShowDeleteDialog(false);
        setProjectToDelete(null);
      } else {
        alert('Failed to delete project');
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Failed to delete project: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setProjectToDelete(null);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

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

  const renderUserIcon = () => {
    if (user.pictureUrl) {
      return <img src={user.pictureUrl} alt={user.name || user.username} className="user-avatar-img" />;
    }
    return getUserInitials();
  };

  if (!user) return null;

  return (
    <div className="pensieve-workspace">
      {/* Sidebar */}
      <aside className={`pensieve-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon">
              <span className="material-icon">memory</span>
            </div>
            {!isSidebarCollapsed && (
              <div className="brand-text">
                <h2 className="brand-title">Pensieve</h2>
                <p className="brand-subtitle">ENGINEERING</p>
              </div>
            )}
          </div>
          <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
            <span className="material-icon">
              {isSidebarCollapsed ? 'menu' : 'menu_open'}
            </span>
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${selectedView === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleViewChange('dashboard')}
            title="Dashboard"
          >
            <span className="material-icon filled">grid_view</span>
            {!isSidebarCollapsed && <span className="nav-label">Dashboard</span>}
          </button>
          <button
            className={`nav-item ${selectedView === 'my-day' ? 'active' : ''}`}
            onClick={() => handleViewChange('my-day')}
            title="My Day"
          >
            <span className="material-icon">wb_sunny</span>
            {!isSidebarCollapsed && <span className="nav-label">My Day</span>}
          </button>
          <button
            className={`nav-item ${selectedView === 'projects' ? 'active' : ''}`}
            onClick={() => handleViewChange('projects')}
            title="Projects"
          >
            <span className="material-icon">folder_open</span>
            {!isSidebarCollapsed && <span className="nav-label">Projects</span>}
          </button>
          <button
            className={`nav-item ${selectedView === 'analytics' ? 'active' : ''}`}
            onClick={() => {
              navigate('/analytics', { state: { user } });
              setSelectedView('analytics');
            }}
            title="Analytics"
          >
            <span className="material-icon filled">analytics</span>
            {!isSidebarCollapsed && <span className="nav-label">Analytics</span>}
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="new-project-menu-wrapper">
            <button
              className="new-project-btn"
              onClick={toggleNewProjectMenu}
              title="New Project"
            >
              <span className="material-icon">add</span>
              {!isSidebarCollapsed && <span>New Project</span>}
            </button>
            {showNewProjectMenu && (
              <div className="new-project-menu">
                <button className="menu-option" onClick={handleCreateProject}>
                  <span className="material-icon">add</span>
                  <span>Create Project</span>
                </button>
                <button className="menu-option" onClick={handleImportProject}>
                  <span className="material-icon">upload</span>
                  <span>Import Project</span>
                </button>
              </div>
            )}
          </div>
          <button className="footer-link" onClick={handleLogout} title="Logout">
            <span className="material-icon">logout</span>
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`pensieve-main ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Top Bar */}
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          renderUserIcon={renderUserIcon}
          searchPlaceholder="Search projects..."
          showSearch={selectedView !== 'dashboard'}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Content Area */}
        <main className="pensieve-content">
          {selectedView === 'dashboard' && (
            <>
              <section className="page-header">
                <div>
                  <h2 className="page-title">Dashboard</h2>
                  <p className="page-subtitle">Overview of your projects and tasks</p>
                </div>
                <button className="export-btn">Export Report</button>
              </section>

              <section className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon primary">
                      <span className="material-icon filled">folder</span>
                    </div>
                    <span className="stat-badge primary">+12%</span>
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">TOTAL PROJECTS</p>
                    <h3 className="stat-value">{projects.length}</h3>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon tertiary">
                      <span className="material-icon filled">pending_actions</span>
                    </div>
                    <span className="stat-badge tertiary">Steady</span>
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">IN PROGRESS</p>
                    <h3 className="stat-value">{myDayTasks.length}</h3>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon secondary">
                      <span className="material-icon filled">check_circle</span>
                    </div>
                    <span className="stat-badge secondary">--</span>
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">COMPLETED</p>
                    <h3 className="stat-value">-</h3>
                  </div>
                </div>
              </section>

              <div className="content-split">
                <section className="section-recent-projects">
                  <div className="section-header">
                    <h3 className="section-title">Recent Projects</h3>
                    <button className="view-all-btn">View All</button>
                  </div>
                  <div className="projects-list">
                    {loading && <div className="loading-state">Loading...</div>}
                    {!loading && projects.length === 0 && (
                      <div className="empty-state">No projects found. Create one to get started.</div>
                    )}
                    {!loading && projects.slice(0, 5).map((project) => (
                      <div
                        key={project.id}
                        className="project-item"
                        onClick={() => handleProjectClick(project)}
                      >
                        <div className="project-item-content">
                          <div className="project-icon">
                            <span className="material-icon filled">folder</span>
                          </div>
                          <div className="project-info">
                            <p className="project-name">{project.name}</p>
                            <p className="project-meta">Modified recently</p>
                          </div>
                        </div>
                        <span className="material-icon chevron">chevron_right</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="section-active-tasks">
                  <div className="section-header">
                    <h3 className="section-title">Active Tasks</h3>
                  </div>
                  <div className="tasks-container">
                    {loadingTasks && <div className="loading-state">Loading...</div>}
                    {!loadingTasks && myDayTasks.length === 0 && (
                      <div className="empty-tasks">
                        <div className="empty-icon">
                          <span className="material-icon">task_alt</span>
                        </div>
                        <p className="empty-title">No active tasks</p>
                        <p className="empty-text">Start working on tasks to see them here.</p>
                      </div>
                    )}
                    {!loadingTasks && myDayTasks.length > 0 && (
                      <div className="tasks-list-dashboard">
                        {myDayTasks
                          .sort((a, b) => {
                            // Sort by createdDate descending (most recent first)
                            const dateA = a.createdDate ? new Date(a.createdDate) : new Date(0);
                            const dateB = b.createdDate ? new Date(b.createdDate) : new Date(0);
                            return dateB - dateA;
                          })
                          .slice(0, 3)
                          .map((task) => (
                          <div key={task.id} className="task-item-mini" onClick={() => handleTaskClick(task)}>
                            <div className="task-item-text">
                              <p className="task-name">{task.title}</p>
                              {task.projectName && <p className="task-project">{task.projectName}</p>}
                            </div>
                            <button className="task-complete-icon" onClick={(e) => {
                              e.stopPropagation();
                              handleSetToCompleted(task);
                            }}>
                              <span className="material-icon">check</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              </div>

              <section className="efficiency-banner">
                <div className="banner-content">
                  <h4 className="banner-title">Engineering Efficiency</h4>
                  <p className="banner-text">
                    Your project velocity has increased by 8% this month. Keep tracking your tasks to maintain the momentum.
                  </p>
                </div>
                <div className="banner-visual">
                  <div className="progress-mini">
                    <div className="progress-fill" style={{ width: '65%' }}></div>
                  </div>
                </div>
              </section>
            </>
          )}

          {selectedView === 'my-day' && (
            <>
              <section className="page-header">
                <div>
                  <h2 className="page-title">My Day</h2>
                  <p className="page-subtitle">Tasks currently in progress</p>
                </div>
              </section>

              {loadingTasks && <div className="loading-state">Loading tasks...</div>}
              {!loadingTasks && myDayTasks.length === 0 && (
                <div className="empty-large">No tasks in progress. Start working on a task to see it here.</div>
              )}
              {!loadingTasks && myDayTasks.length > 0 && (() => {
                const filteredTasks = myDayTasks.filter(task =>
                  task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (task.projectName && task.projectName.toLowerCase().includes(searchQuery.toLowerCase()))
                );

                const projectGroups = groupTasksByProject(filteredTasks);

                return (
                  <div className="my-day-projects-grouped">
                    {projectGroups.map(group => {
                      const isCollapsed = collapsedProjects[group.projectId];

                      return (
                        <div key={group.projectId} className="project-group">
                          <div
                            className="project-group-header"
                            onClick={() => toggleProjectCollapse(group.projectId)}
                          >
                            <div className="project-group-title-section">
                              <span className="material-icon collapse-icon">
                                {isCollapsed ? 'chevron_right' : 'expand_more'}
                              </span>
                              <span className="material-icon project-icon">folder</span>
                              <h3 className="project-group-title">{group.projectName}</h3>
                              <span className="project-task-count">{group.tasks.length}</span>
                            </div>
                          </div>

                          {!isCollapsed && (
                            <div className="project-group-content">
                              {group.tasks.map((task) => (
                                <div key={task.id} className="task-card">
                                  <div className="task-card-content">
                                    <div className="task-card-title">{task.title}</div>
                                    {task.description && <div className="task-card-description">{task.description}</div>}
                                    <div className="task-card-meta">
                                      {task.listName && <span className="meta-tag">📋 {task.listName}</span>}
                                      {task.priority && <span className={`priority-badge ${task.priority.toLowerCase()}`}>{task.priority}</span>}
                                    </div>
                                  </div>
                                  <div className="task-card-actions">
                                    <button className="btn-complete" onClick={() => handleSetToCompleted(task)}>✓ Complete</button>
                                    <button className="btn-view" onClick={() => handleTaskClick(task)}>→</button>
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
            </>
          )}

          {selectedView === 'projects' && (
            <>
              <section className="page-header">
                <div>
                  <h2 className="page-title">Projects</h2>
                  <p className="page-subtitle">All your projects</p>
                </div>
              </section>

              {loading && <div className="loading-state">Loading projects...</div>}
              {error && <div className="error-state">{error}</div>}
              {!loading && !error && projects.length === 0 && (
                <div className="empty-large">No projects found. Click "New Project" to create one.</div>
              )}
              {!loading && !error && projects.length > 0 && (
                <div className="projects-grid">
                  {projects.filter(project =>
                    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
                  ).map((project) => (
                    <div key={project.id} className="project-tile" onClick={() => handleProjectClick(project)}>
                      <div className="project-tile-actions">
                        <button
                          className="export-project-btn"
                          onClick={(e) => handleExportProject(project, e)}
                          title="Export project as JSON"
                        >
                          <span className="material-icon">download</span>
                        </button>
                        <button
                          className="delete-project-btn"
                          onClick={(e) => handleDeleteProject(project, e)}
                          title="Delete project"
                        >
                          <span className="material-icon">delete</span>
                        </button>
                      </div>
                      <span className="material-icon project-tile-icon">folder</span>
                      <p className="project-tile-name">{project.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Create Project Dialog */}
      {showDialog && (
        <div className="dialog-overlay" onClick={handleCloseDialog}>
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title">Create New Project</h2>
              <button className="dialog-close" onClick={handleCloseDialog}>×</button>
            </div>
            <form onSubmit={handleSubmitProject} className="dialog-form">
              <div className="form-field">
                <label className="form-label">Project Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                  disabled={submitting}
                  autoFocus
                />
              </div>
              <div className="form-field">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Enter project description (optional)"
                  rows="4"
                  disabled={submitting}
                />
              </div>
              {formError && <div className="form-error">{formError}</div>}
              <div className="dialog-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseDialog} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && projectToDelete && (
        <div className="dialog-overlay" onClick={handleCancelDelete}>
          <div className="dialog-box delete-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title">Delete Project</h2>
              <button className="dialog-close" onClick={handleCancelDelete}>×</button>
            </div>
            <div className="dialog-form">
              <div className="delete-warning">
                <div className="warning-icon">
                  <span className="material-icon">warning</span>
                </div>
                <div className="warning-content">
                  <p className="warning-title">Are you sure you want to delete "{projectToDelete.name}"?</p>
                  <p className="warning-text">
                    This will permanently delete the project and all its lists and tasks. This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="dialog-actions">
                <button type="button" className="btn-secondary" onClick={handleCancelDelete} disabled={isDeleting}>
                  Cancel
                </button>
                <button type="button" className="btn-danger" onClick={handleConfirmDelete} disabled={isDeleting}>
                  {isDeleting ? 'Deleting...' : 'Delete Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Dialog */}
      {showErrorDialog && (
        <div className="dialog-overlay" onClick={handleCloseErrorDialog}>
          <div className="dialog-box error-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title">Import Failed</h2>
              <button className="dialog-close" onClick={handleCloseErrorDialog}>×</button>
            </div>
            <div className="dialog-form">
              <div className="error-warning">
                <div className="error-icon">
                  <span className="material-icon">error</span>
                </div>
                <div className="error-content">
                  <p className="error-title">Could not import project</p>
                  <p className="error-text">{errorMessage}</p>
                </div>
              </div>
              <div className="dialog-actions">
                <button type="button" className="btn-primary" onClick={handleCloseErrorDialog}>
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay for Import */}
      {isImporting && (
        <div className="dialog-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p className="loading-text">Importing project...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;
