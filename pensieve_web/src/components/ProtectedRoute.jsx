import { Navigate } from 'react-router-dom';
import { getAccessToken, getStoredUser } from '../services/auth';

function ProtectedRoute({ children }) {
  const token = getAccessToken();
  const user = getStoredUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
