import { Alert } from '@mui/material';
import { useTranslation } from '../../contexts/LanguageContext';

export default function PreviewNotice() { const { t } = useTranslation(); return <Alert severity="info" variant="outlined" sx={{ mb: 3 }}>{t('admin.previewNotice')}</Alert>; }
