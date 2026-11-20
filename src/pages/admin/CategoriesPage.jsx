import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, Grid, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useLanguage, useTranslation } from '../../contexts/LanguageContext';
import { createCategory, deleteCategory, listCategories, listDashboardContent } from '../../services/contentService';
import { slugify } from '../../utils/formatters';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import './CategoriesPage.css';

export default function CategoriesPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [items, setItems] = useState([]);
  const [contentItems, setContentItems] = useState([]);
  const [name, setName] = useState('');
  const [nameTa, setNameTa] = useState('');
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.allSettled([listCategories(), listDashboardContent()]).then(([categoriesResult, contentResult]) => {
      if (!active) return;
      if (categoriesResult.status === 'fulfilled') setItems(categoriesResult.value);
      else setError(categoriesResult.reason?.message || 'Could not load categories.');
      if (contentResult.status === 'fulfilled') setContentItems(contentResult.value.all || []);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const usageByCategory = useMemo(() => contentItems.reduce((counts, item) => {
    if (item.category_id) counts[item.category_id] = (counts[item.category_id] || 0) + 1;
    return counts;
  }, {}), [contentItems]);
  const uncategorizedCount = contentItems.filter((item) => !item.category_id).length;
  const filteredItems = items.filter((item) => `${item.name_en || ''} ${item.name_ta || ''}`.toLowerCase().includes(query.trim().toLowerCase()));

  const add = async (event) => {
    event.preventDefault();
    const englishName = name.trim();
    const tamilName = nameTa.trim();
    if (!englishName || !tamilName) { setError('Enter both the English and Tamil category names.'); return; }
    const id = slugify(englishName);
    if (!id || items.some((item) => item.id === id)) { setError('A category with this English name already exists.'); return; }
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const item = await createCategory({ id, name_en: englishName, name_ta: tamilName, icon: '🌱', color: '#e7f3df' });
      setItems((current) => [...current, item].sort((left, right) => left.name_en.localeCompare(right.name_en)));
      setName('');
      setNameTa('');
      setNotice('Category added. It is ready to use in your content.');
    } catch (err) { setError(err.message || 'Could not add this category.'); }
    finally { setSaving(false); }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    setRemoving(true);
    setError('');
    try {
      await deleteCategory(deleteTarget.id);
      setItems((current) => current.filter((entry) => entry.id !== deleteTarget.id));
      setDeleteTarget(null);
      setNotice('Category removed.');
    } catch (err) { setError(err.message || 'Could not remove this category.'); }
    finally { setRemoving(false); }
  };

  return (
    <Box className="admin-categories-page">
      <header className="admin-categories-hero">
        <Box>
          <Typography className="eyebrow">AB AGRI / TOPIC MANAGER</Typography>
          <Typography component="h1" variant="h3">{t('admin.categories')}</Typography>
          <Typography className="admin-categories-intro">Organize stories, videos, and resources with clear topics.</Typography>
        </Box>
        <Box className="admin-categories-hero-count"><Typography variant="h4">{loading ? '—' : items.length}</Typography><Typography variant="body2">topics</Typography></Box>
      </header>

      {notice && <Alert severity="success" onClose={() => setNotice('')} sx={{ mb: 2 }}>{notice}</Alert>}
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2} className="admin-categories-stats">
        <Grid size={{ xs: 6, md: 4 }}><Card className="admin-categories-stat"><CardContent><CategoryRoundedIcon /><Typography variant="body2">Available topics</Typography><Typography variant="h4">{loading ? '—' : items.length}</Typography></CardContent></Card></Grid>
        <Grid size={{ xs: 6, md: 4 }}><Card className="admin-categories-stat"><CardContent><MenuBookRoundedIcon /><Typography variant="body2">Content using topics</Typography><Typography variant="h4">{loading ? '—' : contentItems.length - uncategorizedCount}</Typography></CardContent></Card></Grid>
        <Grid size={{ xs: 12, md: 4 }}><Card className="admin-categories-stat uncategorized"><CardContent><SearchRoundedIcon /><Typography variant="body2">Without a topic</Typography><Typography variant="h4">{loading ? '—' : uncategorizedCount}</Typography></CardContent></Card></Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card className="admin-categories-panel admin-categories-add"><CardContent>
            <Box className="admin-categories-panel-heading"><Box className="admin-categories-add-icon"><AddRoundedIcon /></Box><Box><Typography variant="h6">{t('admin.addCategory')}</Typography><Typography variant="body2" color="text.secondary">Create a bilingual topic for your library.</Typography></Box></Box>
            <Box component="form" onSubmit={add} className="admin-categories-form">
              <TextField label="English name" value={name} onChange={(event) => setName(event.target.value)} fullWidth required />
              <TextField label="Tamil name" value={nameTa} onChange={(event) => setNameTa(event.target.value)} fullWidth required />
              <Button type="submit" disabled={saving} variant="contained" startIcon={<AddRoundedIcon />} fullWidth>{saving ? 'Adding…' : 'Add category'}</Button>
            </Box>
            <Box className="admin-categories-tip"><Typography variant="overline">TIP</Typography><Typography variant="body2">Use short, recognizable topics. Readers can use them to find related farming information.</Typography></Box>
          </CardContent></Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card className="admin-categories-panel admin-categories-list-panel"><CardContent>
            <Stack className="admin-categories-list-heading" direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={1.5}>
              <Box><Typography variant="h6">Your topics</Typography><Typography variant="body2" color="text.secondary">{loading ? 'Loading topics…' : `${filteredItems.length} ${filteredItems.length === 1 ? 'topic' : 'topics'} available across the site.`}</Typography></Box>
              <TextField className="admin-categories-search" size="small" placeholder="Search topics" value={query} onChange={(event) => setQuery(event.target.value)} InputProps={{ startAdornment: <SearchRoundedIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> }} />
            </Stack>
            {loading ? <Typography color="text.secondary" sx={{ py: 4 }}>Loading categories…</Typography> : filteredItems.length ? (
              <Box className="admin-categories-list">
                {filteredItems.map((item, index) => {
                  const usage = usageByCategory[item.id] || 0;
                  return <Box className="admin-category-card" key={item.id}>
                    <Box className="admin-category-icon" style={{ backgroundColor: item.color || '#edf3e9' }}>{item.icon || '🌱'}</Box>
                    <Box className="admin-category-copy">
                      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                        <Typography className="admin-category-name">{item[`name_${language}`] || item.name_en}</Typography>
                        <Chip size="small" variant="outlined" label={usage === 1 ? '1 item' : `${usage} items`} />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">{item.name_en} <span className="admin-category-separator">·</span> {item.name_ta}</Typography>
                    </Box>
                    {usage ? <Tooltip title="Reassign content before removing this topic"><span><Chip className="admin-category-in-use" size="small" label="In use" /></span></Tooltip> : <Tooltip title="Remove unused topic"><span><IconButton className="admin-category-remove" aria-label={`Remove ${item.name_en}`} onClick={() => setDeleteTarget(item)} size="small"><DeleteOutlineRoundedIcon fontSize="small" /></IconButton></span></Tooltip>}
                    <span className="admin-category-index">{String(index + 1).padStart(2, '0')}</span>
                  </Box>;
                })}
              </Box>
            ) : <Box className="admin-categories-empty"><CategoryRoundedIcon /><Typography>{query ? 'No topics match your search.' : 'No topics yet. Add your first topic to get started.'}</Typography></Box>}
          </CardContent></Card>
        </Grid>
      </Grid>
      <ConfirmDialog open={Boolean(deleteTarget)} title="Remove this topic?" description={`“${deleteTarget?.name_en || ''}” will be removed from the category list.`} onClose={() => !removing && setDeleteTarget(null)} onConfirm={remove} />
    </Box>
  );
}
