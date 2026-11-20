import { useEffect, useState } from 'react';
import { AppBar, Avatar, Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, ThemeProvider, Toolbar, Typography } from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import OndemandVideoRoundedIcon from '@mui/icons-material/OndemandVideoRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import BrightnessAutoRoundedIcon from '@mui/icons-material/BrightnessAutoRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeModeContext';
import { createAppTheme } from '../app/theme';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import PreviewNotice from '../components/common/PreviewNotice';

export default function AdminLayout() {
  const { resolvedMode } = useThemeMode();
  useEffect(() => {
    document.documentElement.dataset.colorTheme = resolvedMode;
    document.documentElement.style.colorScheme = resolvedMode;
    return () => {
      delete document.documentElement.dataset.colorTheme;
      document.documentElement.style.colorScheme = '';
    };
  }, [resolvedMode]);
  return <ThemeProvider theme={createAppTheme(resolvedMode)}><AdminLayoutFrame /></ThemeProvider>;
}

function AdminLayoutFrame() {
  const { t } = useTranslation();
  const { profile, signOut, isAdmin } = useAuth();
  const { mode, setMode } = useThemeMode();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [accountAnchor, setAccountAnchor] = useState(null);

  const handleSignOut = async () => {
    setLoggingOut(true);
    await signOut();
    navigate('/admin/login', { replace: true });
  };
  const primary = [['/admin', 'admin.dashboard', DashboardRoundedIcon], ['/admin/news', 'admin.news', ArticleRoundedIcon], ['/admin/videos', 'admin.videos', OndemandVideoRoundedIcon], ['/admin/resources', 'admin.resources', MenuBookRoundedIcon]];
  const adminOnly = [['/admin/categories', 'admin.categories', CategoryRoundedIcon], ['/admin/users', 'admin.people', GroupRoundedIcon]];

  const nav = <Box className="admin-sidebar-inner">
    <Box className="admin-logo"><span className="brand-mark"><img src="/ab-agri-logo.png" alt="" /></span><Typography variant="h6" fontWeight={800}>AB Agri</Typography></Box>
    <Box className="admin-sidebar-nav">
      <Typography className="sidebar-label">{t('admin.content')}</Typography>
      <List>{primary.map(([path, label, Icon]) => <NavItem key={path} path={path} label={t(label)} Icon={Icon} active={location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path))} onClick={() => setOpen(false)} />)}</List>
      <Typography className="sidebar-label" sx={{ mt: 2 }}>{t('admin.people')}</Typography>
      <List>{(isAdmin ? adminOnly : []).map(([path, label, Icon]) => <NavItem key={path} path={path} label={t(label)} Icon={Icon} active={location.pathname.startsWith(path)} onClick={() => setOpen(false)} />)}<NavItem path="/admin/profile" label={t('admin.profile')} Icon={PersonRoundedIcon} active={location.pathname.startsWith('/admin/profile')} onClick={() => setOpen(false)} /></List>
    </Box>
    <Box className="admin-sidebar-footer"><Button component={Link} to="/" color="inherit" fullWidth sx={{ justifyContent: 'flex-start' }}>← {t('auth.backToSite')}</Button></Box>
  </Box>;

  const appearanceOptions = [
    ['light', 'Light', LightModeRoundedIcon],
    ['dark', 'Dark', DarkModeRoundedIcon],
    ['system', 'Auto', BrightnessAutoRoundedIcon],
  ];

  return <>
    <Box className="admin-shell">
      <Box component="aside" className="admin-sidebar desktop-sidebar">{nav}</Box>
      <Drawer open={open} onClose={() => setOpen(false)} className="mobile-admin-drawer">{nav}</Drawer>
      <Box className="admin-main">
        <AppBar position="sticky" color="inherit" elevation={0} className="admin-topbar">
          <Toolbar>
            <IconButton onClick={() => setOpen(true)} sx={{ display: { md: 'none' }, mr: 1 }} aria-label="Open navigation"><MenuRoundedIcon /></IconButton>
            <Box sx={{ flexGrow: 1 }}><Typography variant="h6" fontWeight={800}>{t('admin.dashboard')}</Typography><Typography variant="caption" color="text.secondary">{profile?.full_name || profile?.email || 'AB Agri workspace'}</Typography></Box>
            <LanguageSwitcher />
            <IconButton aria-label="Account and appearance settings" onClick={(event) => setAccountAnchor(event.currentTarget)} sx={{ ml: 1.5, p: 0.25 }}>
              <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', width: 38, height: 38 }}>{(profile?.full_name || profile?.email || 'A')[0].toUpperCase()}</Avatar>
            </IconButton>
          </Toolbar>
        </AppBar>
        <Menu anchorEl={accountAnchor} open={Boolean(accountAnchor)} onClose={() => setAccountAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <Box sx={{ px: 2, py: 1, minWidth: 220 }}><Typography variant="subtitle2" fontWeight={700}>{profile?.full_name || 'AB Agri admin'}</Typography><Typography variant="caption" color="text.secondary">{profile?.email}</Typography></Box>
          <Divider />
          <Typography variant="overline" color="text.secondary" sx={{ display: 'block', px: 2, pt: 1.1, lineHeight: 2 }}>Appearance</Typography>
          {appearanceOptions.map(([value, label, Icon]) => <MenuItem key={value} selected={mode === value} onClick={() => setMode(value)} dense>
            <ListItemIcon><Icon fontSize="small" /></ListItemIcon><ListItemText>{label}</ListItemText>{mode === value && <CheckRoundedIcon fontSize="small" color="primary" />}
          </MenuItem>)}
          <Divider sx={{ my: 0.75 }} />
          <MenuItem onClick={() => { setAccountAnchor(null); setLogoutOpen(true); }}><ListItemIcon><LogoutRoundedIcon fontSize="small" /></ListItemIcon>Sign out</MenuItem>
        </Menu>
        <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}><PreviewNotice /><Outlet /></Container>
      </Box>
    </Box>
    <Dialog open={logoutOpen} onClose={() => !loggingOut && setLogoutOpen(false)} fullWidth maxWidth="xs">
      <DialogTitle>Sign out?</DialogTitle><DialogContent>Are you sure you want to sign out of the AB Agri admin workspace?</DialogContent>
      <DialogActions><Button onClick={() => setLogoutOpen(false)} disabled={loggingOut}>Cancel</Button><Button onClick={handleSignOut} color="error" variant="contained" disabled={loggingOut}>{loggingOut ? 'Signing out…' : 'Sign out'}</Button></DialogActions>
    </Dialog>
  </>;
}

function NavItem({ path, label, Icon, active, onClick }) {
  return <ListItemButton component={Link} to={path} selected={active} onClick={onClick}><ListItemIcon><Icon /></ListItemIcon><ListItemText primary={label} /></ListItemButton>;
}
