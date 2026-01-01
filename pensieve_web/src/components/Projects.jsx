import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { projectAPI } from '../services/api';
import './Projects.css';

function Projects() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Redirect to login if no user data
    if (!user) {
      navigate('/login');
      return;
    }

    // Fetch projects for the user
    fetchProjects();
  }, [user, navigate]);

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

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectAPI.getProjects(user.id);
      
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        setError('Failed to load projects');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const handleEditProfile = () => {
    // TODO: Implement edit profile functionality
    alert('Edit profile feature coming soon!');
  };

  const handleCreateProject = () => {
    setShowDialog(true);
    setFormError(null);
    setProjectName('');
    setProjectDescription('');
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setFormError(null);
    setProjectName('');
    setProjectDescription('');
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      setFormError('Project name is required');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      
      const response = await projectAPI.createProject(user.id, {
        name: projectName.trim(),
        description: projectDescription.trim(),
      });

      if (response.status === 201) {
        // Success - close dialog and refresh projects
        handleCloseDialog();
        await fetchProjects();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setFormError(errorData.message || 'Failed to create project');
      }
    } catch (err) {
      setFormError('Failed to connect to server');
      console.error('Error creating project:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProjectClick = (project) => {
    navigate('/tasks', { state: { project, user } });
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

  if (!user) {
    return null;
  }

  return (
    <div className="projects-container">
      {/* Top Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-logo">Pensieve</div>
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

      {/* Main Content */}
      <div className="projects-content">
        {loading && <div className="loading">Loading projects...</div>}
        
        {error && <div className="error-message">{error}</div>}
        
        {!loading && !error && projects.length === 0 && (
          <div className="no-projects">
            No projects found. Please create one.
          </div>
        )}
        
        {!loading && !error && projects.length > 0 && (
          <div className="projects-grid">
            {projects.map((project) => (
              <div 
                key={project.id} 
                className="project-tile"
                onClick={() => handleProjectClick(project)}
              >
                <div className="project-tile-name">{project.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Button */}
      <button 
        className="create-project-btn"
        onClick={handleCreateProject}
        title="Create Project"
      >
        +
      </button>

      {/* Create Project Dialog */}
      {showDialog && (
        <div className="dialog-overlay" onClick={handleCloseDialog}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2>Create New Project</h2>
              <button 
                className="dialog-close"
                onClick={handleCloseDialog}
                type="button"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmitProject}>
              <div className="form-group">
                <label htmlFor="project-name">Project Name *</label>
                <input
                  id="project-name"
                  type="text"
                  className="form-input"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                  disabled={submitting}
                  autoFocus
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="project-description">Description</label>
                <textarea
                  id="project-description"
                  className="form-textarea"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Enter project description (optional)"
                  rows="4"
                  disabled={submitting}
                />
              </div>
              
              {formError && (
                <div className="form-error">{formError}</div>
              )}
              
              <div className="dialog-actions">
                <button 
                  type="button"
                  className="btn-cancel"
                  onClick={handleCloseDialog}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-submit"
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;
