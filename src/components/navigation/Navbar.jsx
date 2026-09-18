import { useState } from 'react';
import { AppBar, Box, Container, Drawer, IconButton, List, ListItemButton, ListItemText, Stack, Toolbar, Typography } from '@mui/material';
import GrassRoundedIcon from '@mui/icons-material/GrassRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from '../../contexts/LanguageContext';
import LanguageSwitcher from '../common/LanguageSwitcher';

export default function Navbar() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const items = [['/', 'nav.home'], ['/news', 'nav.news'], ['/videos', 'nav.videos'], ['/resources', 'nav.resources'], ['/about', 'nav.about']];
  return <AppBar position="sticky" color="transparent" elevation={0} className="site-nav"><Container maxWidth="lg"><Toolbar disableGutters sx={{ gap: 2 }}>
    <Link to="/" className="brand"><span className="brand-mark"><GrassRoundedIcon fontSize="small" /></span><span><b>AB</b> Agri<small>KNOWLEDGE FOR THE FIELD</small></span></Link>
    <Stack component="nav" direction="row" gap={0.5} sx={{ ml: 'auto', display: { xs: 'none', md: 'flex' } }}>{items.map(([path, label]) => <NavLink key={path} to={path} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{t(label)}</NavLink>)}</Stack>
    <Stack direction="row" alignItems="center" gap={1} sx={{ ml: { md: 2 } }}><LanguageSwitcher /><IconButton onClick={() => setOpen(true)} sx={{ display: { xs: 'inline-flex', md: 'none' }, color: 'primary.main' }} aria-label={t('nav.menu')}><MenuRoundedIcon /></IconButton></Stack>
  </Toolbar></Container>
  <Drawer anchor="right" open={open} onClose={() => setOpen(false)}><Box sx={{ width: 300, p: 2.5 }}><Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}><Typography variant="h6" fontWeight={800}>AB Agri</Typography><IconButton onClick={() => setOpen(false)} aria-label="Close menu"><CloseRoundedIcon /></IconButton></Stack><List>{items.map(([path, label]) => <ListItemButton key={path} component={Link} to={path} onClick={() => setOpen(false)} sx={{ borderRadius: 2, mb: .5 }}><ListItemText primary={t(label)} /></ListItemButton>)}</List></Box></Drawer>
  </AppBar>;
}
