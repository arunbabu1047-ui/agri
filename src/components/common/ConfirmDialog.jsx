import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useTranslation } from '../../contexts/LanguageContext';

export default function ConfirmDialog({ open, title, description, onClose, onConfirm }) {
  const { t } = useTranslation();
  return <Dialog open={open} onClose={onClose}><DialogTitle>{title}</DialogTitle><DialogContent><Typography color="text.secondary">{description}</Typography></DialogContent><DialogActions><Button onClick={onClose}>{t('common.cancel')}</Button><Button color="error" onClick={onConfirm}>Delete</Button></DialogActions></Dialog>;
}
