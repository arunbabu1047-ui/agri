import { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { CircularProgress, Stack } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { getAccessToken } from '../../lib/api';

export default function ProtectedRoute() {
  const { loading, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const enforceSession = () => { if (!getAccessToken()) navigate("/admin/login", { replace: true }); };
    window.addEventListener("pageshow", enforceSession);
    window.addEventListener("storage", enforceSession);
    return () => { window.removeEventListener("pageshow", enforceSession); window.removeEventListener("storage", enforceSession); };
  }, [navigate]);
  if (loading) return <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '100vh' }}><CircularProgress /></Stack>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
}
