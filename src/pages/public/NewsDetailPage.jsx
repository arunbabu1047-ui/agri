import { useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, Container, Divider, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import { Link, useParams } from 'react-router-dom';
import { useLanguage, useTranslation } from '../../contexts/LanguageContext';
import { getContent } from '../../services/contentService';
import { news as sampleNews, categories } from '../../data/contentData';
import { localized, formatDate } from '../../utils/formatters';

export default function NewsDetailPage() {
  const { slug } = useParams(); const { language } = useLanguage(); const { t } = useTranslation(); const [item, setItem] = useState(() => sampleNews.find((entry) => entry.slug === slug)); const [copied, setCopied] = useState(false);
  useEffect(() => { getContent('news', slug, language).then((data) => data && setItem(data)).catch(() => {}); }, [slug, language]);
  if (!item) return <Container className="page-shell"><Typography variant="h3">Story not found</Typography></Container>;
  const category = categories.find((entry) => entry.id === item.category_id);
  const copyLink = async () => { await navigator.clipboard?.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2200); };
  return <Container maxWidth="md" className="detail-shell"><Link className="back-link" to="/news"><ArrowBackRoundedIcon fontSize="small" /> {t('common.back')}</Link><Stack direction="row" gap={1} sx={{ mt: 3, mb: 2 }}><Chip label={localized(category, 'name', language)} className="category-chip" /><Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>{formatDate(item.date || item.created_at, language)} Â· {item.read_time}</Typography></Stack><Typography variant="h1" className="detail-title">{localized(item, 'title', language)}</Typography><Typography className="detail-summary">{localized(item, 'summary', language)}</Typography><Stack className="detail-meta" direction="row" justifyContent="space-between" alignItems="center" sx={{ my: 3 }}><Typography variant="body2" color="text.secondary">{t('common.by')} <b>{item.author_name || 'Agri Pulse editorial team'}</b></Typography><ButtonCopy onClick={copyLink} copied={copied} /></Stack><Box component="img" src={item.image} alt="" className="detail-image" /><Box className="article-body">{localized(item, 'body', language).split('\n\n').map((paragraph) => <Typography key={paragraph} paragraph>{paragraph}</Typography>)}</Box>{item.sample && <Alert severity="info" variant="outlined">{t('common.sample')} Â· This demonstration story is not current news or a verified advisory.</Alert>}<Divider sx={{ my: 4 }} /><Stack direction="row" gap={1} flexWrap="wrap">{item.tags?.map((tag) => <Chip key={tag} label={`#${tag}`} variant="outlined" size="small" />)}</Stack></Container>;
}

function ButtonCopy({ onClick, copied }) {
  return (
    <Button
      type="button"
      onClick={onClick}
      variant={copied ? 'contained' : 'outlined'}
      size="small"
      startIcon={copied ? <CheckRoundedIcon fontSize="small" /> : <ContentCopyRoundedIcon fontSize="small" />}
      sx={{
        borderRadius: '999px',
        px: 2,
        borderColor: copied ? 'transparent' : 'rgba(23,61,45,.24)',
        color: copied ? '#fff' : 'var(--deep-forest)',
        bgcolor: copied ? 'var(--deep-forest)' : 'rgba(255,255,255,.72)',
        '&:hover': { borderColor: 'var(--deep-forest)', bgcolor: copied ? 'var(--deep-forest)' : 'rgba(226,240,225,.9)' },
      }}
    >
      {copied ? 'Copied to clipboard' : 'Copy article link'}
    </Button>
  );
}

