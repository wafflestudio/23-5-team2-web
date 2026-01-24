import { useUserStore } from '@/store/useUserStore';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { user, isLoading } = useUserStore();

  if (isLoading) {
    // Optionally render a loading spinner here
    // For now, return null to avoid flashing content or redirects during the check
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
