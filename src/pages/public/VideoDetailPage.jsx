import { useEffect, useState } from 'react';
import { Box, Chip, Container, Stack, Typography } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { Link, useParams } from 'react-router-dom';
import { useLanguage, useTranslation } from '../../contexts/LanguageContext';
import { getContent } from '../../services/contentService';
import { videos as sampleVideos } from '../../data/contentData';
import { localized } from '../../utils/formatters';
import { youtubeId } from '../../utils/validators';

export default function VideoDetailPage() { const { slug } = useParams(); const { language } = useLanguage(); const { t } = useTranslation(); const [item, setItem] = useState(() => sampleVideos.find((entry) => entry.slug === slug)); useEffect(() => { getContent('videos', slug).then((data) => data && setItem(data)).catch(() => {}); }, [slug]); if (!item) return <Container className="page-shell"><Typography variant="h3">Video not found</Typography></Container>; const id = youtubeId(item.youtube_url); return <Container maxWidth="lg" className="page-shell"><Link className="back-link" to="/videos">← {t('common.back')}</Link><GridVideo item={item} id={id} /><Stack maxWidth="780px" sx={{ mt: 4 }}><Typography className="eyebrow">{t('videos.spoken')} · {item.spoken_language}</Typography><Typography variant="h2" sx={{ mt: 1 }}>{localized(item, 'title', language)}</Typography><Typography color="text.secondary" sx={{ mt: 2, fontSize: '1.1rem' }}>{localized(item, 'description', language)}</Typography><Stack direction="row" gap={1} sx={{ mt: 2 }}><Chip label={item.spoken_language} /><Chip label={item.duration} variant="outlined" /></Stack></Stack></Container>; }

function GridVideo({ item, id }) { return <Box className="video-player">{id ? <iframe title={item.title_en} src={`https://www.youtube-nocookie.com/embed/${id}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : <><Box component="img" src={item.image} alt="" /><span className="play-overlay"><PlayArrowRoundedIcon /></span></>}</Box>; }
