import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services/AuthService';

interface ProtectedRouteProps {
  children: React.ReactElement;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = React.useState(adminOnly);

  React.useEffect(() => {
    if (adminOnly && user) {
      AuthService.isAdmin(user).then(res => {
        setIsAdmin(res);
        setCheckingAdmin(false);
      });
    } else {
      setCheckingAdmin(false);
    }
  }, [adminOnly, user]);

  if (authLoading || checkingAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background-dark">
        <span className="material-symbols-outlined animate-spin text-gold-primary text-4xl">progress_activity</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};
