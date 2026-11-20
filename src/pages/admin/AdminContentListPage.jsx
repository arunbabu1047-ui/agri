import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, IconButton, Skeleton, Stack, TextField, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import { Link } from 'react-router-dom';
import { useLanguage, useTranslation } from '../../contexts/LanguageContext';
import { listContent, deleteContent, translateNewsToTamil } from '../../services/contentService';
import { localized, formatDate } from '../../utils/formatters';
import { categories as sampleCategories } from '../../data/contentData';
import { isSupabaseConfigured } from '../../lib/supabase';
import StatusChip from '../../components/common/StatusChip';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import './AdminContentListPage.css';

const statusFilters = ['all', 'published', 'pending', 'draft', 'rejected'];

export default function AdminContentListPage({ type }) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmTranslate, setConfirmTranslate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translationStatus, setTranslationStatus] = useState('');

  const label = type === 'news' ? t('admin.news') : type === 'videos' ? t('admin.videos') : t('admin.resources');
  const createLabel = type === 'news' ? t('admin.newStory') : type === 'videos' ? t('admin.newVideo') : t('admin.newResource');

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await listContent(type, { includeUnpublished: true }));
    } catch (loadError) {
      setItems([]);
      setError(loadError.message || 'Could not load content from Supabase.');
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const filtered = useMemo(() => items.filter((item) => (
    (status === 'all' || item.status === status) &&
    `${item.title_en || ''} ${item.title_ta || ''} ${item.title_kn || ''}`.toLowerCase().includes(query.trim().toLowerCase())
  )), [items, query, status]);
  const untranslatedNews = useMemo(() => type === 'news' ? items.filter((item) => (
    (item.title_en?.trim() && !item.title_ta?.trim()) ||
    (item.summary_en?.trim() && !item.summary_ta?.trim()) ||
    (item.body_en?.trim() && !item.body_ta?.trim())
  )) : [], [items, type]);

  const translateAllNews = async () => {
    if (!untranslatedNews.length || translating) return;
    setTranslating(true);
    setTranslationStatus('');
    setError('');
    let translatedCount = 0;
    let skippedCount = 0;
    const failures = [];
    try {
      for (let offset = 0; offset < untranslatedNews.length; offset += 5) {
        const batch = untranslatedNews.slice(offset, offset + 5);
        const result = await translateNewsToTamil(batch.map((item) => item.id));
        translatedCount += result.translated?.length || 0;
        skippedCount += result.skipped?.length || 0;
        failures.push(...(result.failed || []));
        setTranslationStatus(`Translating ${Math.min(offset + batch.length, untranslatedNews.length)} of ${untranslatedNews.length} stories…`);
      }
      await loadItems();
      setTranslationStatus(`Tamil translations complete: ${translatedCount} translated, ${skippedCount} already complete, ${failures.length} failed.${failures.length ? ` First error: ${failures[0].error}` : ''}`);
    } catch (translationError) {
      setTranslationStatus('');
      setError(translationError.message || 'Could not translate news.');
    } finally {
      setTranslating(false);
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteContent(type, deleteTarget.id);
      setItems((current) => current.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (deleteError) {
      setError(deleteError.message || 'Could not delete this item.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box className="admin-content-page">
      <header className="admin-content-hero">
        <Box>
          <Typography className="eyebrow">AB AGRI / NEWSROOM</Typography>
          <Typography component="h1" variant="h3">{label}</Typography>
          <Typography className="admin-content-intro">
            {type === 'news'
              ? 'Write and publish stories here. Published stories appear on the public News page.'
              : 'Manage this library and publish approved content for the public site.'}
          </Typography>
        </Box>
        <Button component={Link} to={`/admin/${type}/new`} variant="contained" startIcon={<AddRoundedIcon />} className="admin-content-create">
          {createLabel}
        </Button>
      </header>

      <Card className="admin-content-workspace">
        <CardContent>
          <Stack className="admin-content-toolbar" direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" gap={2}>
            <Box className="admin-content-search">
              <SearchRoundedIcon aria-hidden="true" />
              <TextField
                fullWidth
                size="small"
                placeholder="Search by story title"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                inputProps={{ 'aria-label': 'Search content by title' }}
              />
            </Box>
            <Stack direction="row" gap={1} className="admin-content-statuses" aria-label="Filter by status">
              {statusFilters.map((key) => (
                <Chip key={key} label={key === 'all' ? 'All stories' : key} onClick={() => setStatus(key)} className={status === key ? 'is-selected' : ''} variant={status === key ? 'filled' : 'outlined'} />
              ))}
            </Stack>
            <IconButton aria-label="Refresh content" onClick={loadItems} disabled={loading}><RefreshRoundedIcon /></IconButton>
          </Stack>

          {error && <Alert severity="error" action={<Button color="inherit" size="small" onClick={loadItems}>Retry</Button>} sx={{ mt: 2 }}>{error}</Alert>}
          {translationStatus && <Alert severity={translationStatus.includes('failed') && !translationStatus.endsWith('0 failed.') ? 'warning' : 'success'} sx={{ mt: 2 }}>{translationStatus}</Alert>}
          {isSupabaseConfigured && !error && <Typography className="admin-content-sync-note">Changes are saved to Supabase. Only stories marked Published appear on the public News page.</Typography>}

          {loading ? (
            <Box className="admin-content-grid" aria-label="Loading content">
              {[0, 1, 2].map((key) => <Card key={key} className="admin-story-card"><Skeleton variant="rectangular" height={150} /><CardContent><Skeleton /><Skeleton width="72%" /></CardContent></Card>)}
            </Box>
          ) : filtered.length ? (
            <Box className="admin-content-grid">
              {filtered.map((item) => {
                const category = sampleCategories.find((entry) => entry.id === item.category_id);
                const title = localized(item, 'title', language) || 'Untitled story';
                const summary = localized(item, 'summary', language);
                const publishedStory = item.status === 'published' && type === 'news' && item.slug;
                return (
                  <Card key={item.id} className="admin-story-card">
                    {item.image ? <Box component="img" className="admin-story-image" src={item.image} alt="" loading="lazy" /> : <Box className="admin-story-image admin-story-placeholder"><span>{type === 'news' ? 'FIELD STORY' : label.toUpperCase()}</span></Box>}
                    <CardContent className="admin-story-copy">
                      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                        <span className="admin-story-category">{localized(category, 'name', language) || 'Agriculture'}</span>
                        <StatusChip status={item.status} />
                      </Stack>
                      <Typography component="h2" variant="h6">{title}</Typography>
                      {summary && <Typography className="admin-story-summary">{summary}</Typography>}
                      <Typography className="admin-story-date">{formatDate(item.date || item.created_at, language)}</Typography>
                      <Stack className="admin-story-actions" direction="row" alignItems="center" justifyContent="space-between">
                        {publishedStory
                          ? <Button component={Link} to={`/news/${item.slug}`} target="_blank" rel="noreferrer" endIcon={<OpenInNewRoundedIcon />} size="small">View on News</Button>
                          : <span className="admin-story-preview-note">Not public until published</span>}
                        <Stack direction="row" gap={0.5}>
                          <IconButton component={Link} to={`/admin/${type}/${item.id}/edit`} aria-label={`Edit ${title}`}><EditRoundedIcon fontSize="small" /></IconButton>
                          <IconButton color="error" onClick={() => setDeleteTarget(item)} aria-label={`Delete ${title}`}><DeleteOutlineRoundedIcon fontSize="small" /></IconButton>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          ) : error ? null : (
            <EmptyState title={query || status !== 'all' ? 'No stories match these filters' : 'Your newsroom is ready'} description={query || status !== 'all' ? 'Try another title or status filter.' : 'Create your first story. Save it as a draft, then publish it when it is ready for the public News page.'} />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog open={Boolean(deleteTarget)} title="Delete this content?" description="This removes the item from Supabase and from the public site if it was published." onClose={() => !deleting && setDeleteTarget(null)} onConfirm={remove} />
      <ConfirmDialog
        open={confirmTranslate}
        title={`Translate ${untranslatedNews.length} stories to Tamil?`}
        description="This sends English story text to Google Cloud Translation and may incur usage charges. Existing Tamil text is preserved. Translations are saved in the Tamil fields without changing publication status, so you can review them before publishing."
        confirmLabel="Translate stories"
        confirmColor="primary"
        onClose={() => !translating && setConfirmTranslate(false)}
        onConfirm={() => { setConfirmTranslate(false); void translateAllNews(); }}
      />
    </Box>
  );
}
