import { useEffect, useState } from 'react';
import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/LanguageContext';

export default function ProfilePage() {
  const { profile, updateProfile } = useAuth();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => setName(profile?.full_name || ''), [profile]);

  const save = async () => {
    setSaving(true); setNotice(''); setError('');
    try { await updateProfile(name); setNotice('Profile saved.'); } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  return <><Typography className="eyebrow">ADMIN / PROFILE</Typography><Typography variant="h3" sx={{ mt: 1 }}>{t('admin.profile')}</Typography><Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>Keep your display details current. Password resets are handled by the Python API.</Typography>{notice && <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert>}{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}<Card sx={{ maxWidth: 680 }}><CardContent sx={{ p: 3 }}><Stack gap={2}><TextField label="Display name" value={name} onChange={(event) => setName(event.target.value)} /><TextField label="Email" value={profile?.email || ''} disabled /><Button onClick={save} variant="contained" disabled={saving} startIcon={<SaveRoundedIcon />} sx={{ alignSelf: 'flex-start' }}>Save profile</Button><Alert severity="info">Use the forgot-password flow on the sign-in page to update your password securely.</Alert></Stack></CardContent></Card></>;
}
