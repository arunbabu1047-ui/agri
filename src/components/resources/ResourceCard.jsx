import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import { useLanguage, useTranslation } from '../../contexts/LanguageContext';
import { localized } from '../../utils/formatters';
import { isValidUrl } from '../../utils/validators';
import { categories } from '../../data/contentData';

const icons = { guide: DescriptionRoundedIcon, article: ArticleRoundedIcon, link: LinkRoundedIcon };

export default function ResourceCard({ item }) {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const category = categories.find((entry) => entry.id === item.category_id);
  const Icon = icons[item.type] || DescriptionRoundedIcon;
  const files = [item.file_url, item.media_url];
  const links = [item.external_url, item.source_url];
  const href = (item.type === 'link' ? [...links, ...files] : [...files, ...links])
    .find((url) => url && isValidUrl(url));
  const title = localized(item, 'title', language);

  return (
    <Card component="article" className="resource-card">
      <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
          <span className="resource-icon" aria-hidden="true"><Icon /></span>
          <Stack direction="row" justifyContent="flex-end" flexWrap="wrap" gap={0.75}>
            {icons[item.type] && <Chip size="small" label={t('resources.' + item.type)} />}
            {item.sample && <Chip size="small" variant="outlined" label={t('common.sample')} />}
          </Stack>
        </Stack>
        <Typography component="h3" variant="h6" sx={{ mt: 2, lineHeight: 1.2 }}>{title}</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>{localized(item, 'description', language)}</Typography>
        <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center" justifyContent="space-between" sx={{ mt: 'auto', pt: 2.5 }}>
          {category && <Typography variant="caption" color="text.secondary">{localized(category, 'name', language)}</Typography>}
          {href ? (
            <a className="resource-card-link" href={href} aria-label={t('resources.download') + ' — ' + title}>
              {t('resources.download')} <ArrowOutwardRoundedIcon fontSize="small" aria-hidden="true" />
            </a>
          ) : (
            <Typography variant="caption" color="text.secondary">{t('resourceLanding.noLink')}</Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
