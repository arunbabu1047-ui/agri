import { Card, CardActionArea, CardContent, CardMedia, Chip, Stack, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { localized, formatDate } from '../../utils/formatters';
import { categories } from '../../data/contentData';

export default function NewsCard({ item, featured = false }) {
  const { language } = useLanguage();
  const category = categories.find((entry) => entry.id === item.category_id);
  return <Card className={featured ? 'news-card featured-card' : 'news-card'}><CardActionArea component={Link} to={`/news/${item.slug}`} sx={{ height: '100%' }}><CardMedia component="img" image={item.image} alt="" sx={{ height: featured ? 330 : 200 }} /><CardContent sx={{ p: featured ? 3 : 2.5 }}><Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 1.4 }}><Chip label={localized(category, 'name', language)} size="small" className="category-chip" />{item.sample && <Chip label={language === 'ta' ? 'மாதிரி' : 'Sample'} size="small" variant="outlined" />}</Stack><Typography variant={featured ? 'h4' : 'h6'} sx={{ lineHeight: 1.18 }}>{localized(item, 'title', language)}</Typography><Typography color="text.secondary" sx={{ mt: 1.2, display: '-webkit-box', WebkitLineClamp: featured ? 3 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{localized(item, 'summary', language)}</Typography><Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2.5 }}><Typography variant="caption" color="text.secondary">{formatDate(item.date || item.created_at, language)}</Typography><ArrowForwardRoundedIcon fontSize="small" color="primary" /></Stack></CardContent></CardActionArea></Card>;
}
