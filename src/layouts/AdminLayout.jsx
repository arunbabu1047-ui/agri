import { useState } from 'react';
import { AppBar, Avatar, Box, Button, Container, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Stack, Toolbar, Typography } from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import OndemandVideoRoundedIcon from '@mui/icons-material/OndemandVideoRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import PreviewNotice from '../components/common/PreviewNotice';

export default function AdminLayout() {
  const { t } = useTranslation(); const { profile, signOut, isAdmin } = useAuth(); const location = useLocation(); const [open, setOpen] = useState(false);
  const primary = [['/admin', 'admin.dashboard', DashboardRoundedIcon], ['/admin/news', 'admin.news', ArticleRoundedIcon], ['/admin/videos', 'admin.videos', OndemandVideoRoundedIcon], ['/admin/resources', 'admin.resources', MenuBookRoundedIcon]];
  const adminOnly = [['/admin/categories', 'admin.categories', CategoryRoundedIcon], ['/admin/users', 'admin.people', GroupRoundedIcon]];
  const nav = <Box className="admin-sidebar-inner"><Box className="admin-logo"><span className="brand-mark">✳</span><Typography variant="h6">Agri Pulse</Typography></Box><Typography className="sidebar-label">{t('admin.content')}</Typography><List>{primary.map(([path, label, Icon]) => <NavItem key={path} path={path} label={t(label)} Icon={Icon} active={location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path))} onClick={() => setOpen(false)} />)}</List><Typography className="sidebar-label" sx={{ mt: 2 }}>{t('admin.people')}</Typography><List>{(isAdmin ? adminOnly : []).map(([path, label, Icon]) => <NavItem key={path} path={path} label={t(label)} Icon={Icon} active={location.pathname.startsWith(path)} onClick={() => setOpen(false)} />)}<NavItem path="/admin/profile" label={t('admin.profile')} Icon={PersonRoundedIcon} active={location.pathname.startsWith('/admin/profile')} onClick={() => setOpen(false)} /></List><Box sx={{ mt: 'auto', p: 1.5 }}><Button component={Link} to="/" color="inherit" fullWidth sx={{ justifyContent: 'flex-start', color: 'rgba(255,255,255,.68)' }}>← {t('auth.backToSite')}</Button><Button onClick={signOut} color="inherit" startIcon={<LogoutRoundedIcon />} fullWidth sx={{ justifyContent: 'flex-start', color: 'rgba(255,255,255,.68)' }}>{t('admin.logout')}</Button></Box></Box>;
  return <Box className="admin-shell"><Box component="aside" className="admin-sidebar desktop-sidebar">{nav}</Box><Drawer open={open} onClose={() => setOpen(false)} className="mobile-admin-drawer">{nav}</Drawer><Box className="admin-main"><AppBar position="sticky" color="inherit" elevation={0} className="admin-topbar"><Toolbar><IconButton onClick={() => setOpen(true)} sx={{ display: { md: 'none' }, mr: 1 }}><MenuRoundedIcon /></IconButton><Box sx={{ flexGrow: 1 }}><Typography variant="h6">{t('admin.dashboard')}</Typography><Typography variant="caption" color="text.secondary">{profile?.full_name || profile?.email || 'Agri Pulse preview'}</Typography></Box><LanguageSwitcher /><Avatar sx={{ ml: 2, bgcolor: 'primary.main', width: 36, height: 36 }}>{(profile?.full_name || 'A')[0]}</Avatar></Toolbar></AppBar><Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}><PreviewNotice /><Outlet /></Container></Box></Box>;
}

function NavItem({ path, label, Icon, active, onClick }) { return <ListItemButton component={Link} to={path} selected={active} onClick={onClick}><ListItemIcon><Icon /></ListItemIcon><ListItemText primary={label} /></ListItemButton>; }
