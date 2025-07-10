import { Navigate, Outlet } from 'react-router-dom';

const AdminRoutes = ({
  isAuthenticated,
  isAdmin,
}: {
  isAuthenticated: boolean;
  isAdmin: boolean;
}) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  if (!isAdmin) {
    return <Navigate to="/unauthorized" />;
  }
  return <Outlet />;
};

export default AdminRoutes;
