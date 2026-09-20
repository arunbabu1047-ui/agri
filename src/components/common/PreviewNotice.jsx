import { Alert } from '@mui/material';
import { useTranslation } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

export default function PreviewNotice() { const { t } = useTranslation(); const { isDemoMode } = useAuth(); if (!isDemoMode) return null; return <Alert severity="info" variant="outlined" sx={{ mb: 3 }}>{t('admin.previewNotice')}</Alert>; }
