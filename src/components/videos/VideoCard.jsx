import { useState } from 'react';
import { Box, Card, CardActionArea, CardContent, CardMedia, Chip, Stack, Typography } from '@mui/material';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import { Link } from 'react-router-dom';
import { useLanguage, useTranslation } from '../../contexts/LanguageContext';
import { localized } from '../../utils/formatters';

export default function VideoCard({ item }) {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const [failedImage, setFailedImage] = useState(null);
  const thumbnail = item.sample ? null : item.image;

  return (
    <Card className="video-card">
      <CardActionArea component={Link} to={'/videos/' + item.slug}>
        {thumbnail && thumbnail !== failedImage ? (
          <CardMedia component="img" image={thumbnail} alt="" loading="lazy" onError={() => setFailedImage(thumbnail)} sx={{ height: 210 }} />
        ) : (
          <Box aria-hidden="true" className="MuiCardMedia-root video-thumbnail-placeholder" sx={{ height: 210, display: 'grid', placeItems: 'center', bgcolor: '#dce9d2' }}>
            <PlayCircleOutlineRoundedIcon color="primary" sx={{ fontSize: 42 }} />
          </Box>
        )}
        <CardContent>
          <Stack direction="row" justifyContent="space-between" gap={1} alignItems="center">
            <Typography component="h3" variant="h6" sx={{ lineHeight: 1.2 }}>{localized(item, 'title', language)}</Typography>
            <PlayCircleOutlineRoundedIcon color="primary" />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {localized(item, 'description', language)}
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
            {item.spoken_language && <Chip size="small" label={t('videos.spoken') + ' · ' + item.spoken_language} />}
            {item.duration && <Chip size="small" variant="outlined" label={item.duration} />}
            {item.sample && <Chip size="small" variant="outlined" label={t('common.sample')} />}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
