import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import Projects from './components/Projects'
import Tasks from './components/Tasks'
import Task from './components/Task'
import TaskDetail from './components/TaskDetail'
import Analytics from './components/Analytics'
import OAuth2Redirect from './components/OAuth2Redirect'
import ProtectedRoute from './components/ProtectedRoute'
import { initializeSession } from './services/auth'
import './App.css'

function App() {
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    // Try to restore session on app load
    initializeSession().finally(() => {
      setIsInitializing(false)
    })
  }, [])

  // Show loading state while checking for existing session
  if (isInitializing) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth2/redirect" element={<OAuth2Redirect />} />
        <Route path="/projects" element={
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        } />
        <Route path="/tasks" element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        } />
        <Route path="/task" element={
          <ProtectedRoute>
            <Task />
          </ProtectedRoute>
        } />
        <Route path="/task-detail" element={
          <ProtectedRoute>
            <TaskDetail />
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App
