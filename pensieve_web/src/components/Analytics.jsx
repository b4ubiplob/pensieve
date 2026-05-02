import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { analyticsAPI, projectAPI, listAPI, taskAPI } from '../services/api';
import { getStoredUser, logout } from '../services/auth';
import Header from './Header';
import './Projects.css';  // Import Projects CSS for sidebar styles
import './Analytics.css';

function Analytics() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(location.state?.user || null);
  const [selectedView, setSelectedView] = useState('duration');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // Apply theme on mount and when it changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const renderUserIcon = () => {
    if (!user) return null;
    const initials = user.name
      ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : user.email[0].toUpperCase();
    return <span className="user-initials">{initials}</span>;
  };

  // Duration search state - cascading dropdowns
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState('');
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState('');
  const [durationResult, setDurationResult] = useState(null);

  // Date search state
  const [selectedDate, setSelectedDate] = useState('');
  const [dateResults, setDateResults] = useState([]);
  const [dateCollapsed, setDateCollapsed] = useState({});

  // Range search state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rangeResults, setRangeResults] = useState([]);
  const [rangeCollapsed, setRangeCollapsed] = useState({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      const storedUser = getStoredUser();
      if (storedUser) {
        setUser(storedUser);
        loadProjects(storedUser.id);
      }
    } else {
      loadProjects(user.id);
    }
  }, [user]);

  // Load projects on mount
  const loadProjects = async (userId) => {
    try {
      const response = await projectAPI.getProjects(userId);
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  // Load lists when project is selected
  const loadLists = async (projectId) => {
    try {
      const response = await listAPI.getLists(projectId);
      if (response.ok) {
        const data = await response.json();
        setLists(data);
        setTasks([]);
        setSelectedList('');
        setSelectedTask('');
      }
    } catch (err) {
      console.error('Failed to load lists:', err);
    }
  };

  // Load tasks when list is selected
  const loadTasks = async (listId) => {
    try {
      const response = await taskAPI.getTasks(listId);
      if (response.ok) {
        const data = await response.json();
        setTasks(data.filter(task => !task.parentTaskId && task.status === 'COMPLETED'));
        setSelectedTask('');
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  };

  // Handle project selection
  const handleProjectChange = (projectId) => {
    setSelectedProject(projectId);
    setSelectedList('');
    setSelectedTask('');
    setLists([]);
    setTasks([]);
    setDurationResult(null);
    if (projectId) {
      loadLists(projectId);
    }
  };

  // Handle list selection
  const handleListChange = (listId) => {
    setSelectedList(listId);
    setSelectedTask('');
    setTasks([]);
    setDurationResult(null);
    if (listId) {
      loadTasks(listId);
    }
  };

  // Handle task selection
  const handleTaskChange = (taskId) => {
    setSelectedTask(taskId);
    setDurationResult(null);
  };

  const handleFetchDuration = async () => {
    if (!selectedTask) {
      setError('Please select a project, list, and task');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await analyticsAPI.getTaskDuration(selectedTask);
      if (response.ok) {
        const data = await response.json();
        setDurationResult(data);
      } else if (response.status === 404) {
        setError('Task not found');
      } else {
        setError('Failed to fetch task duration');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchByDate = async () => {
    if (!selectedDate) {
      setError('Please select a date');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await analyticsAPI.getTasksByDate(selectedDate, user?.id);
      if (response.ok) {
        const data = await response.json();
        setDateResults(data);
        const projects = [...new Set(data.map(t => t.projectName))];
        setDateCollapsed(Object.fromEntries(projects.map((p, i) => [p, i !== 0])));
      } else {
        setError('Failed to fetch tasks');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchByRange = async () => {
    if (!startDate || !endDate) {
      setError('Please select both dates');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must be before end date');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await analyticsAPI.getTasksByDateRange(startDate, endDate, user?.id);
      if (response.ok) {
        const data = await response.json();
        setRangeResults(data);
        const projects = [...new Set(data.map(t => t.projectName))];
        setRangeCollapsed(Object.fromEntries(projects.map((p, i) => [p, i !== 0])));
      } else {
        setError('Failed to fetch tasks');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (view) => {
    setSelectedView(view);
    setError(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigateToTask = async (taskSummary) => {
    try {
      const response = await taskAPI.getTaskById(taskSummary.taskId);
      if (response.ok) {
        const task = await response.json();
        const project = { id: taskSummary.projectId, name: taskSummary.projectName };
        const list = { id: taskSummary.listId, name: taskSummary.listName };
        navigate('/task-detail', { state: { task, project, list, user } });
      }
    } catch (err) {
      console.error('Failed to navigate to task:', err);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="pensieve-container">
      {/* Sidebar */}
      <aside className={`pensieve-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="brand-icon material-icon">auto_awesome</span>
            {!isSidebarCollapsed && <span className="brand-text">Pensieve</span>}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="material-icon">
              {isSidebarCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => navigate('/projects', { state: { user } })}>
            <span className="material-icon">grid_view</span>
            {!isSidebarCollapsed && <span className="nav-label">Dashboard</span>}
          </button>
          <button className="nav-item" onClick={() => navigate('/projects', { state: { user } })}>
            <span className="material-icon">wb_sunny</span>
            {!isSidebarCollapsed && <span className="nav-label">My Day</span>}
          </button>
          <button className="nav-item" onClick={() => navigate('/projects', { state: { user } })}>
            <span className="material-icon">folder_open</span>
            {!isSidebarCollapsed && <span className="nav-label">Projects</span>}
          </button>
          <button className="nav-item active">
            <span className="material-icon filled">analytics</span>
            {!isSidebarCollapsed && <span className="nav-label">Analytics</span>}
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="footer-link" onClick={handleLogout}>
            <span className="material-icon">logout</span>
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`pensieve-main ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          renderUserIcon={renderUserIcon}
          showSearch={false}
        />

        <div className="analytics-container">
          <h2>Task Analytics</h2>

          {/* View Tabs */}
          <div className="view-tabs">
            <button
              className={selectedView === 'duration' ? 'active' : ''}
              onClick={() => handleViewChange('duration')}
            >
              Task Duration
            </button>
            <button
              className={selectedView === 'by-date' ? 'active' : ''}
              onClick={() => handleViewChange('by-date')}
            >
              By Date
            </button>
            <button
              className={selectedView === 'by-range' ? 'active' : ''}
              onClick={() => handleViewChange('by-range')}
            >
              By Range
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {/* Duration View */}
          {selectedView === 'duration' && (
            <div className="duration-view">
              <div className="cascading-selectors">
                <div className="selector-group">
                  <label>Select Project</label>
                  <select
                    value={selectedProject}
                    onChange={(e) => handleProjectChange(e.target.value)}
                  >
                    <option value="">-- Choose a project --</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="selector-group">
                  <label>Select List</label>
                  <select
                    value={selectedList}
                    onChange={(e) => handleListChange(e.target.value)}
                    disabled={!selectedProject}
                  >
                    <option value="">-- Choose a list --</option>
                    {lists.map(list => (
                      <option key={list.id} value={list.id}>
                        {list.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="selector-group">
                  <label>Select Task</label>
                  <select
                    value={selectedTask}
                    onChange={(e) => handleTaskChange(e.target.value)}
                    disabled={!selectedList}
                  >
                    <option value="">-- Choose a task --</option>
                    {tasks.map(task => (
                      <option key={task.id} value={task.id}>
                        {task.title}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleFetchDuration}
                  disabled={loading || !selectedTask}
                  className="calculate-btn"
                >
                  {loading ? 'Loading...' : 'Calculate Duration'}
                </button>
              </div>

              {durationResult && (
                <div className="duration-results">
                  <h3>{durationResult.taskTitle}</h3>
                  <div className="stats-grid">
                    <div className="stat">
                      <span className="stat-label">Status</span>
                      <span className={`status-badge ${durationResult.currentStatus}`}>
                        {durationResult.currentStatus}
                      </span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Time in Progress</span>
                      <span className="stat-value">{durationResult.durationFormatted}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Created</span>
                      <span className="stat-value">{formatTimestamp(durationResult.createdDate)}</span>
                    </div>
                    {durationResult.completedDate && (
                      <div className="stat">
                        <span className="stat-label">Completed</span>
                        <span className="stat-value">{formatTimestamp(durationResult.completedDate)}</span>
                      </div>
                    )}
                  </div>

                  {/* Status Timeline */}
                  <div className="status-timeline">
                    <h4>Status History</h4>
                    {durationResult.statusHistory?.map((transition, idx) => (
                      <div key={idx} className="timeline-event">
                        <div className="event-marker"></div>
                        <div className="event-details">
                          <span className="event-transition">
                            {transition.fromStatus || 'START'} → {transition.toStatus}
                          </span>
                          <span className="event-time">
                            {formatTimestamp(transition.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* By Date View */}
          {selectedView === 'by-date' && (
            <div className="date-view">
              <div className="search-box">
                <div className="date-input-wrapper">
                  <label htmlFor="single-date">Select Date</label>
                  <input
                    id="single-date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <button onClick={handleFetchByDate} disabled={loading || !selectedDate}>
                  {loading ? 'Loading...' : 'Search'}
                </button>
              </div>

              {dateResults.length > 0 && (
                <div className="tasks-list">
                  <h4>{dateResults.length} task(s) found</h4>
                  {[...new Set(dateResults.map(t => t.projectName))].map(project => (
                    <div key={project} className="project-group">
                      <button
                        className="project-group-header"
                        onClick={() => setDateCollapsed(prev => ({ ...prev, [project]: !prev[project] }))}
                      >
                        <span className="material-icon">{dateCollapsed[project] ? 'chevron_right' : 'expand_more'}</span>
                        <span className="project-group-name">{project}</span>
                        <span className="project-group-count">{dateResults.filter(t => t.projectName === project).length}</span>
                      </button>
                      {!dateCollapsed[project] && (
                        <div className="project-group-tasks">
                          {[...new Set(dateResults.filter(t => t.projectName === project).map(t => t.listName))].map(list => (
                            <div key={list} className="list-group">
                              <button
                                className="list-group-header"
                                onClick={() => setDateCollapsed(prev => ({ ...prev, [`${project}|${list}`]: !prev[`${project}|${list}`] }))}
                              >
                                <span className="material-icon">{dateCollapsed[`${project}|${list}`] ? 'chevron_right' : 'expand_more'}</span>
                                <span className="list-group-name">{list}</span>
                                <span className="project-group-count">{dateResults.filter(t => t.projectName === project && t.listName === list).length}</span>
                              </button>
                              {!dateCollapsed[`${project}|${list}`] && (
                                <div className="list-group-tasks">
                                  {dateResults.filter(t => t.projectName === project && t.listName === list).map(task => (
                                    <div key={task.taskId} className="task-card task-card-clickable" onClick={() => navigateToTask(task)}>
                                      <h5>{task.title}</h5>
                                      <p className={`status ${task.status}`}>{task.status}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* By Range View */}
          {selectedView === 'by-range' && (
            <div className="range-view">
              <div className="search-box">
                <div className="date-input-wrapper">
                  <label htmlFor="start-date">Start Date</label>
                  <input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={endDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="date-input-wrapper">
                  <label htmlFor="end-date">End Date</label>
                  <input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <button onClick={handleFetchByRange} disabled={loading || !startDate || !endDate}>
                  {loading ? 'Loading...' : 'Search'}
                </button>
              </div>

              {rangeResults.length > 0 && (
                <div className="tasks-list">
                  <h4>{rangeResults.length} task(s) found</h4>
                  {[...new Set(rangeResults.map(t => t.projectName))].map(project => (
                    <div key={project} className="project-group">
                      <button
                        className="project-group-header"
                        onClick={() => setRangeCollapsed(prev => ({ ...prev, [project]: !prev[project] }))}
                      >
                        <span className="material-icon">{rangeCollapsed[project] ? 'chevron_right' : 'expand_more'}</span>
                        <span className="project-group-name">{project}</span>
                        <span className="project-group-count">{rangeResults.filter(t => t.projectName === project).length}</span>
                      </button>
                      {!rangeCollapsed[project] && (
                        <div className="project-group-tasks">
                          {[...new Set(rangeResults.filter(t => t.projectName === project).map(t => t.listName))].map(list => (
                            <div key={list} className="list-group">
                              <button
                                className="list-group-header"
                                onClick={() => setRangeCollapsed(prev => ({ ...prev, [`${project}|${list}`]: !prev[`${project}|${list}`] }))}
                              >
                                <span className="material-icon">{rangeCollapsed[`${project}|${list}`] ? 'chevron_right' : 'expand_more'}</span>
                                <span className="list-group-name">{list}</span>
                                <span className="project-group-count">{rangeResults.filter(t => t.projectName === project && t.listName === list).length}</span>
                              </button>
                              {!rangeCollapsed[`${project}|${list}`] && (
                                <div className="list-group-tasks">
                                  {rangeResults.filter(t => t.projectName === project && t.listName === list).map(task => (
                                    <div key={task.taskId} className="task-card task-card-clickable" onClick={() => navigateToTask(task)}>
                                      <h5>{task.title}</h5>
                                      <p className={`status ${task.status}`}>{task.status}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Analytics;
