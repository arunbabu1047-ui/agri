import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function RoleGuard({ roles = ['admin'], children }) { const { profile, isAdmin } = useAuth(); const role = isAdmin ? 'admin' : profile?.role; return roles.includes(role) ? (children || <Outlet />) : <Navigate to="/admin" replace />; }
