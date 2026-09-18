import { useState } from 'react';
import { AppBar, Box, Button, Container, Drawer, IconButton, List, ListItemButton, ListItemText, Stack, Toolbar, Typography } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from '../../contexts/LanguageContext';
import LanguageSwitcher from '../common/LanguageSwitcher';

export default function Navbar() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const items = [['/', 'nav.home'], ['/news', 'nav.news'], ['/videos', 'nav.videos'], ['/resources', 'nav.resources'], ['/about', 'nav.about']];
  return <AppBar position="sticky" color="transparent" elevation={0} className="site-nav"><Container maxWidth="lg"><Toolbar disableGutters sx={{ minHeight: 82, gap: 2 }}>
    <Link to="/" className="brand"><span className="brand-mark">✳</span><span><b>Agri</b> Pulse<small>KNOWLEDGE FOR THE FIELD</small></span></Link>
    <Stack component="nav" direction="row" gap={0.5} sx={{ ml: 'auto', display: { xs: 'none', md: 'flex' } }}>{items.map(([path, label]) => <NavLink key={path} to={path} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{t(label)}</NavLink>)}</Stack>
    <Stack direction="row" alignItems="center" gap={1} sx={{ ml: { md: 2 } }}><LanguageSwitcher /><Button component={Link} to="/admin/login" variant="contained" size="small" endIcon={<ArrowOutwardRoundedIcon />}>{t('nav.admin')}</Button><IconButton onClick={() => setOpen(true)} sx={{ display: { xs: 'inline-flex', md: 'none' } }} aria-label={t('nav.menu')}><MenuRoundedIcon /></IconButton></Stack>
  </Toolbar></Container>
  <Drawer anchor="right" open={open} onClose={() => setOpen(false)}><Box sx={{ width: 280, p: 2 }}><Typography variant="h6" sx={{ mb: 2 }}>Agri Pulse</Typography><List>{items.map(([path, label]) => <ListItemButton key={path} component={Link} to={path} onClick={() => setOpen(false)}><ListItemText primary={t(label)} /></ListItemButton>)}</List></Box></Drawer>
  </AppBar>;
}
