import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/LanguageContext';

export default function ProfilePage() { const { profile } = useAuth(); const { t } = useTranslation(); return <><Typography className="eyebrow">ADMIN / PROFILE</Typography><Typography variant="h3" sx={{ mt: 1 }}>{t('admin.profile')}</Typography><Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>Keep your display details current. Password resets are handled by Supabase Auth.</Typography><Card sx={{ maxWidth: 680 }}><CardContent sx={{ p: 3 }}><Stack gap={2}><TextField label="Display name" defaultValue={profile?.full_name || 'Agri Pulse Admin'} /><TextField label="Email" defaultValue={profile?.email || 'admin@agripulse.preview'} disabled /><Button variant="contained" startIcon={<SaveRoundedIcon />} sx={{ alignSelf: 'flex-start' }}>Save profile</Button><Alert severity="info">Use the forgot-password flow on the sign-in page to update your password securely.</Alert></Stack></CardContent></Card></>; }
