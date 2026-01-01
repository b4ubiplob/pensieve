import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Task.css';

function Task() {
  const location = useLocation();
  const navigate = useNavigate();
  const task = location.state?.task;
  const list = location.state?.list;
  const project = location.state?.project;
  const user = location.state?.user;

  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Redirect if no task data
    if (!task || !list || !project || !user) {
      navigate('/projects');
      return;
    }
  }, [task, list, project, user, navigate]);

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

  const handleBackToTasks = () => {
    navigate('/tasks', { state: { project, user } });
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const handleEditProfile = () => {
    alert('Edit profile feature coming soon!');
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

  if (!task || !list || !project || !user) {
    return null;
  }

  return (
    <div className="task-detail-container">
      {/* Top Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-left">
          <button 
            className="back-button"
            onClick={handleBackToTasks}
            title="Back to Tasks"
          >
            ←
          </button>
          <div className="navbar-logo">{project.name} / {list.name}</div>
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

      {/* Task Details Content */}
      <div className="task-detail-content">
        <div className="task-detail-card">
          <h1 className="task-detail-title">{task.title}</h1>
          
          <div className="task-detail-section">
            <label className="task-detail-label">Description</label>
            <div className="task-detail-value">
              {task.description || 'No description provided'}
            </div>
          </div>

          <div className="task-detail-row">
            <div className="task-detail-section">
              <label className="task-detail-label">Status</label>
              <div className="task-detail-value">
                <span className={`status-badge status-${task.status?.toLowerCase()}`}>
                  {task.status?.replace('_', ' ') || 'Not Set'}
                </span>
              </div>
            </div>

            <div className="task-detail-section">
              <label className="task-detail-label">Priority</label>
              <div className="task-detail-value">
                <span className={`priority-badge priority-${task.priority?.toLowerCase()}`}>
                  {task.priority || 'Not Set'}
                </span>
              </div>
            </div>
          </div>

          <div className="task-detail-row">
            <div className="task-detail-section">
              <label className="task-detail-label">Due Date</label>
              <div className="task-detail-value">
                {task.due_date || 'No due date'}
              </div>
            </div>

            <div className="task-detail-section">
              <label className="task-detail-label">Reminder Date</label>
              <div className="task-detail-value">
                {task.reminder_date || 'No reminder'}
              </div>
            </div>
          </div>

          <div className="task-detail-section">
            <label className="task-detail-label">Created At</label>
            <div className="task-detail-value">
              {task.created_at || 'N/A'}
            </div>
          </div>

          <div className="task-detail-section">
            <label className="task-detail-label">Updated At</label>
            <div className="task-detail-value">
              {task.updated_at || 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Task;
