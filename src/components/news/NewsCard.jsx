import { Card, CardActionArea, CardContent, CardMedia, Chip, Stack, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Link } from 'react-router-dom';
import { useLanguage, useTranslation } from '../../contexts/LanguageContext';
import { localized, formatDate } from '../../utils/formatters';
import { categories } from '../../data/contentData';

export default function NewsCard({ item, featured = false }) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const category = categories.find((entry) => entry.id === item.category_id);
  const date = item.date || item.created_at;

  return (
    <Card component="article" className={featured ? 'news-card featured-card' : 'news-card'}>
      <CardActionArea component={Link} to={'/news/' + item.slug} sx={{ height: '100%' }}>
        {item.image && (
          <CardMedia
            key={item.image}
            component="img"
            image={item.image}
            alt=""
            loading={featured ? 'eager' : 'lazy'}
            onError={(event) => { event.currentTarget.hidden = true; }}
            sx={{ height: featured ? 330 : 200, '&[hidden]': { display: 'none' } }}
          />
        )}
        <CardContent sx={{ p: featured ? 3 : 2.5 }}>
          <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 1.4 }}>
            {category && <Chip label={localized(category, 'name', language)} size="small" className="category-chip" />}
            {item.sample && <Chip label={t('common.sample')} size="small" variant="outlined" />}
          </Stack>
          <Typography component="h3" variant={featured ? 'h4' : 'h6'} sx={{ lineHeight: 1.18 }}>
            {localized(item, 'title', language)}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1.2, display: '-webkit-box', WebkitLineClamp: featured ? 3 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {localized(item, 'summary', language)}
          </Typography>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mt: 2.5 }}>
            <Typography variant="caption" color="text.secondary">{formatDate(date, language)}{item.district ? ` · ${item.district}` : ''}</Typography>
            <Typography component="span" variant="body2" color="primary" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontWeight: 800 }}>
              {t('common.readMore')} <ArrowForwardRoundedIcon fontSize="small" aria-hidden="true" />
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
