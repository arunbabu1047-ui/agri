import { useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, Container, Divider, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import { Link, useParams } from 'react-router-dom';
import { useLanguage, useTranslation } from '../../contexts/LanguageContext';
import { getContent } from '../../services/contentService';
import { news as sampleNews, categories } from '../../data/contentData';
import { localized, formatDate } from '../../utils/formatters';

function isArticleSectionHeading(text) {
  const value = text.trim();
  const tamilHeadings = new Set(['முடிவுரை', 'இந்தியாவில் MF 254 டிராக்டர் விலை – 2026', 'எஞ்சின் மற்றும் செயல்திறன்', 'முக்கிய தொழில்நுட்ப விவரக்குறிப்புகள்', 'விவசாயப் பணிகளில் செயல்திறன்', 'நன்மைகள்', 'வாங்குவதற்கு முன் கவனிக்க வேண்டியவை', 'இறுதி மதிப்புரை']);
  return tamilHeadings.has(value) || (value.length > 2 && value.length <= 80 && /[A-Z]/.test(value) && value === value.toLocaleUpperCase() && !value.includes(':'));
}

function getSpecificationLines(text) {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  if (lines.length < 3 || !lines.every((line) => {
    const separator = line.indexOf(':');
    return separator > 1 && separator <= 45 && line.slice(separator + 1).trim().length > 0;
  })) return null;
  return lines.map((line) => {
    const separator = line.indexOf(':');
    return { label: line.slice(0, separator).trim(), value: line.slice(separator + 1).trim() };
  });
}

function isNumberedArticleHeading(text) {
  return /^\d+\.\s+.{1,100}$/.test(text.trim());
}

function isNamedArticleHeading(text) {
  return /^(conclusion|summary|references|sources|key takeaways)$/i.test(text.trim());
}

function isSpecificationLine(text) {
  const separator = text.indexOf(':');
  return separator > 1 && separator <= 45 && text.slice(separator + 1).trim().length > 0;
}

function ArticleBody({ content }) {
  const blocks = [];
  const paragraphLines = [];
  const flushParagraph = () => {
    if (paragraphLines.length) blocks.push({ type: 'paragraph', text: paragraphLines.splice(0).join('\n') });
  };
  const lines = content.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) { flushParagraph(); continue; }
    if (isArticleSectionHeading(line) || isNamedArticleHeading(line)) {
      flushParagraph(); blocks.push({ type: 'section', text: line }); continue;
    }
    if (isNumberedArticleHeading(line)) {
      flushParagraph(); blocks.push({ type: 'subheading', text: line }); continue;
    }
    if (isSpecificationLine(line)) {
      flushParagraph();
      const specificationLines = [line];
      while (index + 1 < lines.length && isSpecificationLine(lines[index + 1].trim())) {
        index += 1;
        specificationLines.push(lines[index].trim());
      }
      const specifications = getSpecificationLines(specificationLines.join('\n'));
      if (specifications) blocks.push({ type: 'specifications', specifications });
      else blocks.push({ type: 'paragraph', text: specificationLines.join('\n') });
      continue;
    }
    paragraphLines.push(line);
  }
  flushParagraph();

  const sections = [];
  let current = { heading: '', blocks: [] };
  blocks.forEach((block) => {
    if (block.type === 'section') {
      if (current.heading || current.blocks.length) sections.push(current);
      current = { heading: block.text, blocks: [] };
    } else current.blocks.push(block);
  });
  if (current.heading || current.blocks.length) sections.push(current);

  return <Box className="article-section-list">{sections.map((section, sectionIndex) => (
    <Box component="section" className="article-section-card" key={`${section.heading || 'intro'}-${sectionIndex}`}>
      {section.heading && <Typography component="h2" className="article-section-heading">{section.heading}</Typography>}
      <Box className="article-section-content">{section.blocks.map((block, blockIndex) => {
        if (block.type === 'specifications') return <Box className="article-spec-grid" key={`specs-${blockIndex}`}>
          {block.specifications.map((specification) => <Box className="article-spec-card" key={specification.label}>
            <Typography component="span" className="article-spec-label">{specification.label}</Typography>
            <Typography component="strong" className="article-spec-value">{specification.value}</Typography>
          </Box>)}
        </Box>;
        if (block.type === 'subheading') return <Typography component="h3" className="article-subheading" key={`subheading-${blockIndex}`}>{block.text}</Typography>;
        return <Typography component="p" key={`paragraph-${blockIndex}`}>{block.text}</Typography>;
      })}</Box>
    </Box>
  ))}</Box>;
}

export default function NewsDetailPage() {
  const { slug } = useParams(); const { language } = useLanguage(); const { t } = useTranslation(); const [item, setItem] = useState(() => sampleNews.find((entry) => entry.slug === slug)); const [copied, setCopied] = useState(false);
  useEffect(() => { getContent('news', slug, language).then((data) => data && setItem(data)).catch(() => {}); }, [slug, language]);
  if (!item) return <Container className="page-shell"><Typography variant="h3">Story not found</Typography></Container>;
  const category = categories.find((entry) => entry.id === item.category_id);
  const copyLink = async () => { await navigator.clipboard?.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2200); };
  const shareArticle = async () => {
    const shareData = { title: localized(item, 'title', language), text: localized(item, 'summary', language), url: window.location.href };
    if (!navigator.share) { await copyLink(); return; }
    try { await navigator.share(shareData); } catch (error) { if (error.name !== 'AbortError') await copyLink(); }
  };
  return <Container maxWidth="md" className="detail-shell"><Link className="back-link" to="/news"><ArrowBackRoundedIcon fontSize="small" /> {t('common.back')}</Link><Stack direction="row" gap={1} sx={{ mt: 3, mb: 2 }}><Chip label={localized(category, 'name', language)} className="category-chip" /><Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>{formatDate(item.date || item.created_at, language)}{item.district ? ` · ${item.district}` : ''}{item.read_time ? ` · ${item.read_time}` : ''}</Typography></Stack><Typography variant="h1" className="detail-title">{localized(item, 'title', language)}</Typography><Typography className="detail-summary">{localized(item, 'summary', language)}</Typography><Stack className="detail-meta" direction="row" justifyContent="space-between" alignItems="center" sx={{ my: 3 }}><Typography variant="body2" color="text.secondary">{t('common.by')} <b>{item.author_name || 'AB Agri'}</b></Typography><Stack direction="row" gap={1}><ButtonShare onClick={shareArticle} /><ButtonCopy onClick={copyLink} copied={copied} /></Stack></Stack><Box component="img" src={item.image} alt="" className="detail-image" /><Box className="article-body"><ArticleBody content={localized(item, 'body', language)} /></Box>{item.sample && <Alert severity="info" variant="outlined">{t('common.sample')} Â· This demonstration story is not current news or a verified advisory.</Alert>}<Divider sx={{ my: 4 }} /><Stack direction="row" gap={1} flexWrap="wrap">{item.tags?.map((tag) => <Chip key={tag} label={`#${tag}`} variant="outlined" size="small" />)}</Stack></Container>;
}

function ButtonShare({ onClick }) {
  return (
    <Button
      type="button"
      onClick={onClick}
      variant="outlined"
      size="small"
      startIcon={<ShareRoundedIcon fontSize="small" />}
      sx={{ borderRadius: '999px', px: 2, borderColor: 'rgba(23,61,45,.24)', color: 'var(--deep-forest)', bgcolor: 'rgba(255,255,255,.72)' }}
    >
      Share article
    </Button>
  );
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

