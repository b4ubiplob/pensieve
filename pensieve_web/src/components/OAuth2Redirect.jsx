import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { handleOAuth2Redirect, getCurrentUser } from '../services/auth';

function OAuth2Redirect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // Extract tokens from URL query parameters
        const token = searchParams.get('token');
        const refresh = searchParams.get('refresh');

        if (!token || !refresh) {
          throw new Error('Missing authentication tokens');
        }

        // Store tokens
        handleOAuth2Redirect(token, refresh);

        // Fetch current user data
        await getCurrentUser();

        // Redirect to projects page
        navigate('/projects', { replace: true });
      } catch (err) {
        console.error('OAuth2 redirect error:', err);
        setError('Authentication failed. Redirecting to login...');
        setTimeout(() => {
          navigate('/login?error=oauth_failed', { replace: true });
        }, 2000);
      }
    };

    processOAuthCallback();
  }, [searchParams, navigate]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        textAlign: 'center',
      }}>
        {error ? (
          <>
            <h2 style={{ color: '#c33', marginBottom: '10px' }}>Error</h2>
            <p style={{ color: '#666' }}>{error}</p>
          </>
        ) : (
          <>
            <h2 style={{ color: '#333', marginBottom: '10px' }}>Signing you in...</h2>
            <p style={{ color: '#666' }}>Please wait while we complete your authentication.</p>
            <div style={{
              marginTop: '20px',
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              margin: '20px auto',
              animation: 'spin 1s linear infinite',
            }}></div>
          </>
        )}
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default OAuth2Redirect;
