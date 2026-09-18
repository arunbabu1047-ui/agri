import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { CircularProgress, Stack } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute() {
  const { loading, isAuthenticated } = useAuth();
  const location = useLocation();
  if (loading) return <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '100vh' }}><CircularProgress /></Stack>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
}
