import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService.js';

export default function ProtectedRoute({ children }) {
  const [isAuth, setIsAuth] = useState(() => authService.isAuthenticated());
  const location = useLocation();

  useEffect(() => {
    // Check local authentication on route change
    const localAuth = authService.isAuthenticated();
    setIsAuth(localAuth);

    if (localAuth) {
      // Cross-check generated token with Cloud Firestore
      authService
        .validateTokenWithFirestore()
        .then((valid) => {
          if (!valid) setIsAuth(false);
        })
        .catch(() => {});
    }

    // Periodic 30-second interval to enforce 19-hour auto-logout and Firestore sync
    const interval = setInterval(() => {
      const active = authService.isAuthenticated();
      if (!active) {
        setIsAuth(false);
      } else {
        authService
          .validateTokenWithFirestore()
          .then((valid) => {
            if (!valid) setIsAuth(false);
          })
          .catch(() => {});
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [location.pathname]);

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
