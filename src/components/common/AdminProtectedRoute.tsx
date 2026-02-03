import { useUserStore } from '@/store/useUserStore';
import { Navigate, Outlet } from 'react-router-dom';

const AdminProtectedRoute = () => {
  const { user, isLoading } = useUserStore();

  if (isLoading) {
    return null;
  }

  // user must exist (checked by ProtectedRoute usually) AND have role >= 1000
  if (!user || user.role < 1000) {
    alert('관리자만 접근할 수 있습니다.');
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
