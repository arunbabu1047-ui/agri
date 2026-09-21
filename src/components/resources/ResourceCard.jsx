import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import { useLanguage, useTranslation } from '../../contexts/LanguageContext';
import { localized } from '../../utils/formatters';
import { categories } from '../../data/contentData';

export default function ResourceCard({ item }) {
  const { language } = useLanguage(); const { t } = useTranslation(); const category = categories.find((entry) => entry.id === item.category_id); const Icon = item.type === 'link' ? LinkRoundedIcon : item.type === 'article' ? ArticleRoundedIcon : DescriptionRoundedIcon;
  return <Card className="resource-card"><CardContent sx={{ p: 2.5 }}><Stack direction="row" justifyContent="space-between"><span className="resource-icon"><Icon /></span><Chip size="small" label={t(`resources.${item.type}`)} /></Stack><Typography variant="h6" sx={{ mt: 2, lineHeight: 1.2 }}>{localized(item, 'title', language)}</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>{localized(item, 'description', language)}</Typography><Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2.5 }}><Typography variant="caption" color="text.secondary">{localized(category, 'name', language)}</Typography><ArrowOutwardRoundedIcon fontSize="small" color="primary" /></Stack></CardContent></Card>;
}
