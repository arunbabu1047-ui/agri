import { Chip } from '@mui/material';
import { useTranslation } from '../../contexts/LanguageContext';

export default function StatusChip({ status }) {
  const { t } = useTranslation();
  const map = { published: ['success', 'published'], draft: ['default', 'draft'], pending: ['warning', 'pending'], rejected: ['error', 'rejected'] };
  const [color, key] = map[status] || map.draft;
  return <Chip size="small" color={color} label={t(`common.${key}`)} sx={{ fontWeight: 700, textTransform: 'capitalize' }} />;
}
