import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface AuthenticatedRoutesProps {
  isAuthenticated: boolean;
}

const AuthenticatedRoutes: React.FC<AuthenticatedRoutesProps> = ({
  isAuthenticated,
}) => {
  return isAuthenticated ? <Outlet /> : <Navigate to="/signin" />;
};

export default AuthenticatedRoutes;
