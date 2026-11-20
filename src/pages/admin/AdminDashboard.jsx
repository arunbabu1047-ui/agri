import { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import PublishedWithChangesRoundedIcon from '@mui/icons-material/PublishedWithChangesRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import { Link } from 'react-router-dom';
import { useTranslation, useLanguage } from '../../contexts/LanguageContext';
import { listDashboardContent } from '../../services/contentService';
import { listContributors } from '../../services/userService';
import { formatDate, localized } from '../../utils/formatters';
import StatusChip from '../../components/common/StatusChip';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [data, setData] = useState({ pending: 0, published: 0, drafts: 0, all: [] });
  const [contributors, setContributors] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.allSettled([listDashboardContent(), listContributors()]).then(([contentResult, peopleResult]) => {
      if (!active) return;
      if (contentResult.status === 'fulfilled') setData(contentResult.value);
      else setError(contentResult.reason?.message || 'Could not load newsroom content from Supabase.');
      if (peopleResult.status === 'fulfilled') setContributors(peopleResult.value.length);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const statItems = [
    [t('admin.pending'), data.pending, PendingActionsRoundedIcon, 'pending'],
    [t('admin.published'), data.published, PublishedWithChangesRoundedIcon, 'published'],
    [t('admin.drafts'), data.drafts, EditNoteRoundedIcon, 'drafts'],
    [t('admin.contributors'), contributors ?? '—', GroupRoundedIcon, 'people'],
  ];
  const reviewItems = data.all.filter((item) => item.status === 'pending').slice(0, 4);

  return (
    <Box className="admin-dashboard">
      <header className="admin-dashboard-hero">
        <Box>
          <Typography className="eyebrow">AB AGRI / NEWSROOM</Typography>
          <Typography component="h1" variant="h3">{t('admin.dashboard')}</Typography>
          <Typography className="admin-dashboard-intro">Plan, edit, and publish the stories shown to readers on your public News page.</Typography>
        </Box>
        <Button component={Link} to="/admin/news/new" variant="contained" startIcon={<AddRoundedIcon />} className="admin-dashboard-primary">{t('admin.newStory')}</Button>
      </header>

      {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error} Open News to retry loading the content.</Alert>}

      <Grid container spacing={2} className="admin-dashboard-stats">
        {statItems.map(([label, value, Icon, kind]) => (
          <Grid key={label} size={{ xs: 6, md: 3 }}>
            <Card className={`admin-dashboard-stat ${kind}`}><CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="body2">{label}</Typography><Icon /></Stack>
              <Typography variant="h3" sx={{ mt: 1.5 }}>{loading ? '—' : value}</Typography>
            </CardContent></Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card className="admin-dashboard-panel"><CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
              <Box><Typography variant="h6">Review queue</Typography><Typography variant="body2" color="text.secondary">Stories awaiting an editor’s approval</Typography></Box>
              <Button component={Link} to="/admin/news" endIcon={<ArrowForwardRoundedIcon />}>Manage news</Button>
            </Stack>
            {loading ? <Typography color="text.secondary" sx={{ py: 3 }}>Loading newsroom…</Typography> : reviewItems.length ? (
              <Stack divider={<Box component="span" sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />}>
                {reviewItems.map((item) => <Stack key={item.id} direction="row" alignItems="center" justifyContent="space-between" gap={2} sx={{ py: 1.6 }}>
                  <Box sx={{ minWidth: 0 }}><Typography fontWeight={750} noWrap>{localized(item, 'title', language) || 'Untitled story'}</Typography><Typography variant="caption" color="text.secondary">{item.date ? formatDate(item.date, language) : 'Date not set'}</Typography></Box>
                  <StatusChip status={item.status} />
                </Stack>)}
              </Stack>
            ) : <Box className="admin-dashboard-empty"><ArticleRoundedIcon /><Box><Typography fontWeight={750}>{error ? 'Newsroom data unavailable' : 'Nothing waiting for review'}</Typography><Typography variant="body2" color="text.secondary">{error ? 'Check your Supabase content tables and access policies.' : 'New submissions will appear here for review.'}</Typography></Box></Box>}
          </CardContent></Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card className="admin-dashboard-panel admin-dashboard-actions"><CardContent>
            <Typography variant="h6">Quick actions</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>Add content to the public knowledge library.</Typography>
            <Stack gap={1.2} sx={{ mt: 2.5 }}>
              <Button component={Link} to="/admin/news/new" variant="contained" startIcon={<AddRoundedIcon />} fullWidth>{t('admin.newStory')}</Button>
              <Button component={Link} to="/admin/videos/new" variant="outlined" startIcon={<AddRoundedIcon />} fullWidth>{t('admin.newVideo')}</Button>
              <Button component={Link} to="/admin/resources/new" variant="outlined" startIcon={<AddRoundedIcon />} fullWidth>{t('admin.newResource')}</Button>
            </Stack>
          </CardContent></Card>
        </Grid>
      </Grid>
    </Box>
  );
}
