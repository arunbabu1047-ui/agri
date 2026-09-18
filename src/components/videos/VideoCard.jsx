import { Card, CardActionArea, CardContent, CardMedia, Chip, Stack, Typography } from '@mui/material';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { localized } from '../../utils/formatters';

export default function VideoCard({ item }) {
  const { language, isTamil } = useLanguage();
  return <Card className="video-card"><CardActionArea component={Link} to={`/videos/${item.slug}`}><BoxMedia item={item} /><CardContent><Stack direction="row" justifyContent="space-between" gap={1} alignItems="center"><Typography variant="h6" sx={{ lineHeight: 1.2 }}>{localized(item, 'title', language)}</Typography><PlayCircleOutlineRoundedIcon color="primary" /></Stack><Typography variant="body2" color="text.secondary" sx={{ mt: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{localized(item, 'description', language)}</Typography><Stack direction="row" gap={1} sx={{ mt: 2 }}><Chip size="small" label={`${isTamil ? 'பேசும் மொழி' : 'Spoken'} · ${item.spoken_language}`} /><Chip size="small" variant="outlined" label={item.duration} /></Stack></CardContent></CardActionArea></Card>;
}

function BoxMedia({ item }) { return <CardMedia component="img" image={item.image} alt="" sx={{ height: 210 }} />; }
