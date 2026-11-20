import { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import PublishedWithChangesRoundedIcon from '@mui/icons-material/PublishedWithChangesRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import NewspaperRoundedIcon from '@mui/icons-material/NewspaperRounded';
import OndemandVideoRoundedIcon from '@mui/icons-material/OndemandVideoRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
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
  const [data, setData] = useState({ pending: 0, published: 0, drafts: 0, all: [], news: [], videos: [], resources: [] });
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
  const recentItems = [
    ...(data.news || []).map((item) => ({ ...item, contentType: 'news' })),
    ...(data.videos || []).map((item) => ({ ...item, contentType: 'videos' })),
    ...(data.resources || []).map((item) => ({ ...item, contentType: 'resources' })),
  ].sort((left, right) => new Date(right.updated_at || right.date || 0) - new Date(left.updated_at || left.date || 0)).slice(0, 5);
  const libraryItems = [
    { label: t('admin.news'), count: data.news?.length || 0, path: '/admin/news', Icon: NewspaperRoundedIcon },
    { label: t('admin.videos'), count: data.videos?.length || 0, path: '/admin/videos', Icon: OndemandVideoRoundedIcon },
    { label: t('admin.resources'), count: data.resources?.length || 0, path: '/admin/resources', Icon: MenuBookRoundedIcon },
  ];
  const largestLibrary = Math.max(1, ...libraryItems.map((item) => item.count));

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

      <Grid container spacing={2.5} className="admin-dashboard-lower">
        <Grid size={{ xs: 12, md: 7 }}>
          <Card className="admin-dashboard-panel admin-dashboard-recent"><CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1} sx={{ mb: 1 }}>
              <Box><Typography variant="h6">Recent content</Typography><Typography variant="body2" color="text.secondary">Your latest stories and library updates</Typography></Box>
              <Button component={Link} to="/admin/news" endIcon={<ArrowForwardRoundedIcon />}>View library</Button>
            </Stack>
            {loading ? <Typography color="text.secondary" sx={{ py: 3 }}>Loading content…</Typography> : recentItems.length ? (
              <Stack className="admin-dashboard-recent-list" divider={<Box component="span" sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />}>
                {recentItems.map((item) => (
                  <Stack key={`${item.contentType}-${item.id}`} component={Link} to={`/admin/${item.contentType}/${item.id}/edit`} className="admin-dashboard-recent-item" direction="row" alignItems="center" gap={1.5}>
                    <Box className={`admin-dashboard-recent-icon ${item.contentType}`}>
                      {item.contentType === 'news' ? <NewspaperRoundedIcon /> : item.contentType === 'videos' ? <OndemandVideoRoundedIcon /> : <MenuBookRoundedIcon />}
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography className="admin-dashboard-recent-title" fontWeight={750} noWrap>{localized(item, 'title', language) || 'Untitled content'}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.contentType === 'news' ? t('admin.news') : item.contentType === 'videos' ? t('admin.videos') : t('admin.resources')} · {formatDate(item.updated_at || item.date || item.created_at, language)}</Typography>
                    </Box>
                    <StatusChip status={item.status} />
                    <ArrowOutwardRoundedIcon className="admin-dashboard-recent-arrow" />
                  </Stack>
                ))}
              </Stack>
            ) : <Box className="admin-dashboard-empty"><ArticleRoundedIcon /><Box><Typography fontWeight={750}>Your library is ready for its first story</Typography><Typography variant="body2" color="text.secondary">New content will appear here as you create it.</Typography></Box></Box>}
          </CardContent></Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card className="admin-dashboard-panel admin-dashboard-library"><CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1} sx={{ mb: 2 }}>
              <Box><Typography variant="h6">Library overview</Typography><Typography variant="body2" color="text.secondary">Content across your public channels</Typography></Box>
              <Box className="admin-dashboard-library-total"><Typography variant="h5">{loading ? '—' : data.all.length}</Typography><Typography variant="caption">items</Typography></Box>
            </Stack>
            <Stack gap={1.5}>
              {libraryItems.map(({ label, count, path, Icon }) => (
                <Box component={Link} to={path} className="admin-dashboard-library-row" key={path}>
                  <Box className="admin-dashboard-library-label"><Icon /><Typography fontWeight={700}>{label}</Typography><Typography className="admin-dashboard-library-count">{loading ? '—' : count}</Typography></Box>
                  <Box className="admin-dashboard-library-track"><Box className="admin-dashboard-library-fill" sx={{ width: `${loading ? 0 : Math.max(count ? 12 : 0, (count / largestLibrary) * 100)}%` }} /></Box>
                </Box>
              ))}
            </Stack>
            <Box className="admin-dashboard-library-foot"><Typography variant="body2" color="text.secondary">Published content is visible to readers on your public site.</Typography><Button component={Link} to="/" target="_blank" rel="noreferrer" endIcon={<ArrowOutwardRoundedIcon />}>Open public site</Button></Box>
          </CardContent></Card>
        </Grid>
      </Grid>
    </Box>
  );
}
