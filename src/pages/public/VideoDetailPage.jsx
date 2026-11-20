import { useEffect, useState } from 'react';
import { Box, Chip, Container, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Link, useParams } from 'react-router-dom';
import { useLanguage, useTranslation } from '../../contexts/LanguageContext';
import { getContent } from '../../services/contentService';
import { videos as sampleVideos } from '../../data/contentData';
import { isSupabaseConfigured } from '../../lib/supabase';
import { localized } from '../../utils/formatters';
import { isValidUrl, youtubeId } from '../../utils/validators';
import './VideosPage.css';

function VideoDescription({ text }) {
  const blocks = [];
  let list = [];
  const flushList = () => {
    if (list.length) blocks.push({ type: 'list', items: list.splice(0) });
  };
  text.split('\n').forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) { flushList(); return; }
    if (line.startsWith('- ')) { list.push(line.slice(2)); return; }
    flushList();
    const heading = line.match(/^(.*?)\*\*(.+)\*\*$/);
    if (heading && heading[1].length <= 4) blocks.push({ type: 'heading', text: `${heading[1]}${heading[2]}` });
    else blocks.push({ type: 'paragraph', text: line });
  });
  flushList();

  return <Box className="video-description-content">{blocks.map((block, index) => block.type === 'heading'
    ? <Typography key={index} component="h2" variant="h6" sx={{ mt: 2.5, mb: 1 }}>{block.text}</Typography>
    : block.type === 'list'
      ? <Box component="ul" key={index} sx={{ mt: 0, pl: 3 }}>{block.items.map((item) => <li key={item}><Typography component="span">{item}</Typography></li>)}</Box>
      : <Typography key={index} component="p" color="text.secondary" sx={{ mb: 1 }}>{block.text}</Typography>)}</Box>;
}

export default function VideoDetailPage() {
  const { slug } = useParams();
  const { language } = useLanguage();
  const { t } = useTranslation();
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    getContent('videos', slug, language).then((item) => {
      if (active) setResult({ slug, language, item });
    }).catch(() => {
      if (active) setResult({ slug, language, item: null });
    });
    return () => { active = false; };
  }, [slug, language]);

  const loading = isSupabaseConfigured && (result?.slug !== slug || result?.language !== language);
  const item = isSupabaseConfigured ? result?.item : sampleVideos.find((entry) => entry.slug === slug);
  const canView = !loading && item?.status === 'published';
  const title = canView ? localized(item, 'title', language) : '';
  const youtube = canView && [item.youtube_url, item.video_url].map(youtubeId).find((id) => id && /^[\w-]{11}$/.test(id));
  const file = canView && item.video_url && isValidUrl(item.video_url) ? item.video_url : null;

  return (
    <div className="public-videos video-watch">
      <Container maxWidth="md">
        <Link className="back-link" to="/videos"><ArrowBackRoundedIcon fontSize="small" /> {t('videos.videoLibrary')}</Link>
        {loading ? <Typography role="status">{t('common.loading')}</Typography> : canView ? (
          <>
            <Typography variant="h3" component="h1" sx={{ mt: 2 }}>{title}</Typography>
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
              {item.spoken_language && <Chip label={t('videos.spoken') + ' · ' + item.spoken_language} size="small" />}
              {item.duration && <Chip label={item.duration} size="small" variant="outlined" />}
              {item.sample && <Chip label={t('common.sample')} size="small" variant="outlined" />}
            </Stack>
            {youtube || file ? (
              <Box className="video-player">
                {youtube ? (
                  <iframe title={title} src={'https://www.youtube-nocookie.com/embed/' + youtube} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                ) : <video src={file} poster={item.image || undefined} controls playsInline preload="metadata" aria-label={title} />}
              </Box>
            ) : <Typography sx={{ mt: 2 }}>{t('videoLanding.noPlayback')}</Typography>}
            <Box sx={{ mt: 2 }}><VideoDescription text={localized(item, 'description', language)} /></Box>
            {youtube && <a className="video-watch-external" href={'https://www.youtube.com/watch?v=' + youtube}>{t('videoLanding.onYouTube')}</a>}
          </>
        ) : <Typography variant="h4" component="h1" sx={{ mt: 2 }}>{t('videoLanding.missing')}</Typography>}
      </Container>
    </div>
  );
}
