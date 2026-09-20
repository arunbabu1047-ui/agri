import { useEffect, useState } from 'react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Alert, Box, Button, Card, CardContent, FormControl, Grid, IconButton, InputLabel, LinearProgress, MenuItem, Select, Snackbar, Stack, TextField, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage, useTranslation } from '../../contexts/LanguageContext';
import { getContent, listCategories, saveContent } from '../../services/contentService';
import { uploadFile } from '../../services/storageService';
import { slugify } from '../../utils/formatters';
import { isValidUrl } from '../../utils/validators';

const blank = { title_ta: '', title_en: '', summary_ta: '', summary_en: '', body_ta: '', body_en: '', description_ta: '', description_en: '', category_id: 'crop', tags: '', source_name: '', source_url: '', youtube_url: '', spoken_language: 'Tamil', type: 'guide', status: 'draft', cover_image_url: '', thumbnail_url: '', video_url: '', file_url: '', external_url: '', file_name: '' };

const bucketFor = { news: 'images', videos: 'videos', resources: 'documents' };

export default function ContentEditorPage({ type }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, isAdmin } = useAuth();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [form, setForm] = useState(blank);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast] = useState({ open: false, severity: 'info', message: '' });
  const singular = type === 'news' ? 'story' : type === 'videos' ? 'video' : 'resource';
  const showToast = (message, severity = 'error') => setToast({ open: true, severity, message });

  useEffect(() => {
    listCategories().then(setCategories).catch((err) => setError(err.message));
    if (id) getContent(type, id).then((item) => item && setForm((current) => ({ ...current, ...item, tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || '' }))).catch((err) => setError(err.message));
  }, [id, type]);

  useEffect(() => {
    const handler = (event) => { if (dirty) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const update = (key, value) => { setDirty(true); setSaved(false); setForm((current) => ({ ...current, [key]: value })); };

  const chooseFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(''); setUploading(true); setUploadProgress(10); update('file_name', file.name);
    try {
      const url = await uploadFile(bucketFor[type], file, '', (progress) => setUploadProgress(progress));
      const key = type === 'news' ? 'cover_image_url' : type === 'videos' ? 'thumbnail_url' : 'file_url';
      update(key, url);
      setUploadProgress(100);
    } catch (err) { setError(err.message); showToast(err.message); } finally { setUploading(false); }
  };

  const title = language === 'ta' ? form.title_ta || form.title_en : form.title_en || form.title_ta;
  const validate = (nextStatus) => {
    if (!form.title_ta || !form.title_en) return t('admin.titleRequired');
    if (nextStatus === 'published' && type === 'news' && (!form.summary_ta || !form.summary_en || !form.body_ta || !form.body_en)) return 'Tamil and English summary and article content are required to publish.';
    if (type === 'videos' && form.youtube_url && !isValidUrl(form.youtube_url)) return 'Enter a valid http(s) video URL.';
    if (form.source_url && !isValidUrl(form.source_url)) return 'Enter a valid source URL.';
    return '';
  };

  const submit = async (event, nextStatus = 'draft') => {
    event?.preventDefault();
    if (uploading) return;
    const finalStatus = nextStatus === 'published' && !isAdmin ? 'pending' : nextStatus;
    const validation = validate(finalStatus);
    if (validation) { setError(validation); showToast(validation); return; }
    setSaving(true); setError('');
    try {
      const payload = { ...form, id, slug: form.slug || slugify(form.title_en), tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean), status: finalStatus, published_at: finalStatus === 'published' ? new Date().toISOString() : null };
      await saveContent(type, payload, profile);
      setDirty(false); setSaved(true); setSaving(false);
      showToast(finalStatus === 'published' ? 'Published successfully.' : 'Draft saved successfully.', 'success');
      setTimeout(() => navigate(`/admin/${type}`), 900);
    } catch (err) { const message = err.message || 'Unable to save this item.'; setError(message); showToast(message); setSaving(false); }
  };

  const field = (key, label, props = {}) => <TextField fullWidth label={label} value={form[key] || ''} onChange={(event) => update(key, event.target.value)} multiline={props.multiline} minRows={props.multiline ? 5 : undefined} />;
  const fileLabel = type === 'videos' ? 'Video thumbnail' : type === 'resources' ? 'PDF document' : 'Cover image';

  return <Box component="form" onSubmit={(event) => submit(event, 'draft')}><Stack direction={{ xs: 'column', sm: 'row' }} gap={2} alignItems={{ sm: 'center' }} sx={{ mb: 3 }}><Button component={Link} to={`/admin/${type}`} startIcon={<ArrowBackRoundedIcon />}>{t('common.back')}</Button><Box sx={{ flexGrow: 1 }}><Typography className="eyebrow">ADMIN / EDITOR</Typography><Typography variant="h3" sx={{ mt: 0.5 }}>{id ? `Edit ${singular}` : `New ${singular}`}</Typography>{title && <Typography color="text.secondary">{title}</Typography>}</Box><Button type="submit" variant="outlined" disabled={saving || uploading} startIcon={<SaveRoundedIcon />}>{t('common.save')}</Button>{(isAdmin || type !== 'news') && <Button type="button" variant="contained" disabled={saving || uploading} onClick={(event) => submit(event, isAdmin ? 'published' : 'pending')} startIcon={<SendRoundedIcon />}>{isAdmin ? t('common.publish') : t('common.submit')}</Button>}</Stack>{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}{saved && <Alert severity="success" sx={{ mb: 2 }}>{t('admin.saved')}</Alert>}<Grid container spacing={2.5}><Grid size={{ xs: 12, md: 8 }}><Card><CardContent sx={{ p: { xs: 2, md: 3 } }}><Typography variant="h6" sx={{ mb: 2.5 }}>Bilingual content</Typography><Grid container spacing={2}><Grid size={{ xs: 12, md: 6 }}>{field('title_ta', 'Tamil title')}</Grid><Grid size={{ xs: 12, md: 6 }}>{field('title_en', 'English title')}</Grid>{type === 'news' ? <><Grid size={{ xs: 12, md: 6 }}>{field('summary_ta', 'Tamil summary', { multiline: true })}</Grid><Grid size={{ xs: 12, md: 6 }}>{field('summary_en', 'English summary', { multiline: true })}</Grid><Grid size={{ xs: 12, md: 6 }}>{field('body_ta', 'Tamil article', { multiline: true })}</Grid><Grid size={{ xs: 12, md: 6 }}>{field('body_en', 'English article', { multiline: true })}</Grid></> : <><Grid size={{ xs: 12, md: 6 }}>{field('description_ta', `Tamil ${singular} description`, { multiline: true })}</Grid><Grid size={{ xs: 12, md: 6 }}>{field('description_en', `English ${singular} description`, { multiline: true })}</Grid></>}</Grid></CardContent></Card></Grid><Grid size={{ xs: 12, md: 4 }}><Card><CardContent sx={{ p: 3 }}><Typography variant="h6" sx={{ mb: 2.5 }}>Publishing details</Typography><Stack gap={2}><FormControl fullWidth size="small"><InputLabel>Category</InputLabel><Select value={form.category_id || ''} label="Category" onChange={(event) => update('category_id', event.target.value)}>{categories.map((category) => <MenuItem key={category.id} value={category.id}>{category.name_en || category.name_ta}</MenuItem>)}</Select></FormControl>{type === 'videos' && <><TextField fullWidth label="Spoken language" value={form.spoken_language} onChange={(event) => update('spoken_language', event.target.value)} /><TextField fullWidth label="YouTube URL (optional)" value={form.youtube_url} onChange={(event) => update('youtube_url', event.target.value)} /></>}{type === 'resources' && <><FormControl fullWidth size="small"><InputLabel>Resource type</InputLabel><Select value={form.type} label="Resource type" onChange={(event) => update('type', event.target.value)}><MenuItem value="guide">Guide / PDF</MenuItem><MenuItem value="article">Reference article</MenuItem><MenuItem value="link">External link</MenuItem></Select></FormControl><TextField fullWidth label="External URL (optional)" value={form.external_url} onChange={(event) => update('external_url', event.target.value)} /></>}{type !== 'resources' && <TextField fullWidth label="Tags" value={form.tags} onChange={(event) => update('tags', event.target.value)} helperText="Comma separated" />}{type !== 'videos' && <TextField fullWidth label="Source URL (optional)" value={form.source_url} onChange={(event) => update('source_url', event.target.value)} />}{type !== 'resources' && <TextField fullWidth label="Source / credit" value={form.source_name} onChange={(event) => update('source_name', event.target.value)} />}</Stack></CardContent></Card><Card sx={{ mt: 2.5 }}><CardContent sx={{ p: 3 }}><Typography variant="h6">Uploads</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Files are validated by the Python API and stored in the backend uploads folder.</Typography><Button component="label" variant="outlined" sx={{ mt: 2 }} fullWidth disabled={uploading}>{uploading ? 'Uploading…' : `Choose ${fileLabel.toLowerCase()}`}<input hidden type="file" accept={type === 'videos' ? 'video/mp4,video/webm,video/quicktime' : type === 'resources' ? 'application/pdf' : 'image/png,image/jpeg,image/webp'} onChange={chooseFile} /></Button>{uploading && <LinearProgress variant="determinate" value={uploadProgress} sx={{ mt: 2 }} />}{form.file_name && <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>{form.file_name}</Typography>}</CardContent></Card></Grid></Grid><Snackbar
        open={toast.open}
        autoHideDuration={4500}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ top: { xs: 16, sm: 78 }, right: { xs: 16, sm: 24 } }}
      >
        <Alert
          severity="info"
          variant="filled"
          icon={<InfoOutlinedIcon sx={{ color: '#fff', fontSize: 22 }} />}
          action={(
            <IconButton
              aria-label="Close notification"
              color="inherit"
              size="small"
              onClick={() => setToast((current) => ({ ...current, open: false }))}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          )}
          sx={{
            width: { xs: 'calc(100vw - 32px)', sm: 360 },
            bgcolor: '#3f7ff3',
            color: '#fff',
            borderRadius: 3,
            boxShadow: '0 12px 28px rgba(31, 70, 170, .28)',
            alignItems: 'center',
            '& .MuiAlert-icon': { color: '#fff', mr: 1.25 },
            '& .MuiAlert-message': { fontWeight: 700, py: 0.65 },
            '& .MuiAlert-action': { pt: 0, mr: -0.75 },
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar></Box>;
}
