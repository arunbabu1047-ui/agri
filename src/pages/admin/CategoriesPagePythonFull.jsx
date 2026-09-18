import { useEffect, useState } from 'react';
import { Alert, Button, Card, CardContent, Chip, Grid, Stack, TextField, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { useLanguage, useTranslation } from '../../contexts/LanguageContext';
import { createCategory, deleteCategory, listCategories } from '../../services/contentService';
import { slugify } from '../../utils/formatters';

export default function CategoriesPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [nameTa, setNameTa] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { listCategories().then(setItems).catch((err) => setError(err.message)); }, []);

  const add = async () => {
    if (!name.trim() || !nameTa.trim()) { setError('Both English and Tamil names are required.'); return; }
    setError('');
    try {
      const item = await createCategory({ id: slugify(name), name_en: name.trim(), name_ta: nameTa.trim(), icon: '🌱', color: '#e7f3df' });
      setItems((current) => [...current, item]);
      setName(''); setNameTa(''); setNotice('Category added.');
    } catch (err) { setError(err.message); }
  };

  const remove = async (item) => {
    setError('');
    try { await deleteCategory(item.id); setItems((current) => current.filter((entry) => entry.id !== item.id)); setNotice('Category removed.'); } catch (err) { setError(err.message); }
  };

  return <>
    <Typography className="eyebrow">ADMIN / TAXONOMY</Typography>
    <Typography variant="h3" sx={{ mt: 1 }}>{t('admin.categories')}</Typography>
    <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>{t('admin.categoriesText')}</Typography>
    {notice && <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert>}
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, md: 5 }}><Card><CardContent sx={{ p: 3 }}><Typography variant="h6">{t('admin.addCategory')}</Typography><Stack gap={2} sx={{ mt: 2 }}><TextField label="English name" value={name} onChange={(event) => setName(event.target.value)} /><TextField label="Tamil name" value={nameTa} onChange={(event) => setNameTa(event.target.value)} /><Button onClick={add} variant="contained" startIcon={<AddRoundedIcon />}>Add category</Button></Stack></CardContent></Card></Grid>
      <Grid size={{ xs: 12, md: 7 }}><Card><CardContent sx={{ p: 3 }}><Stack gap={1}>{items.map((item) => <Stack key={item.id} direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}><Stack direction="row" gap={1.5} alignItems="center"><Typography fontSize={24}>{item.icon}</Typography><Stack><Typography fontWeight={700}>{item[`name_${language}`] || item.name_en}</Typography><Typography variant="caption" color="text.secondary">{item.name_en} · {item.name_ta}</Typography></Stack></Stack><Chip icon={<DeleteOutlineRoundedIcon />} label="Remove" onClick={() => remove(item)} variant="outlined" /></Stack>)}</Stack></CardContent></Card></Grid>
    </Grid>
  </>;
}
