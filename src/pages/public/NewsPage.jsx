import { useEffect, useMemo, useState } from 'react';
import { Container, Grid, Stack, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useLanguage, useTranslation } from '../../contexts/LanguageContext';
import { listContent } from '../../services/contentService';
import { news as sampleNews, categories } from '../../data/contentData';
import SectionHeading from '../../components/common/SectionHeading';
import SearchBar from '../../components/common/SearchBar';
import CategoryFilter from '../../components/common/CategoryFilter';
import NewsCard from '../../components/news/NewsCard';
import EmptyState from '../../components/common/EmptyState';

export default function NewsPage() {
  const { t } = useTranslation(); const { language } = useLanguage(); const [params, setParams] = useSearchParams(); const [query, setQuery] = useState(''); const [items, setItems] = useState(sampleNews.filter((item) => item.status === 'published')); const category = params.get('category') || 'all';
  useEffect(() => { listContent('news').then(setItems).catch(() => {}); }, []);
  const filtered = useMemo(() => items.filter((item) => (category === 'all' || item.category_id === category) && `${item.title_en} ${item.title_ta} ${item.title_kn} ${item.summary_en} ${item.summary_ta} ${item.summary_kn}`.toLowerCase().includes(query.toLowerCase())), [items, category, query]);
  return <Container maxWidth="lg" className="page-shell"><SectionHeading eyebrow="STORIES / FIELD NOTES" title={t('news.title')} subtitle={t('news.subtitle')} /><Stack gap={2.5} sx={{ mb: 4 }}><SearchBar value={query} onChange={setQuery} /><CategoryFilter categories={categories} value={category} onChange={(next) => { next === 'all' ? setParams({}) : setParams({ category: next }); }} /></Stack>{filtered.length ? <Grid container spacing={2.5}>{filtered.map((item) => <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}><NewsCard item={item} /></Grid>)}</Grid> : <EmptyState title={t('common.noResults')} description={language === 'ta' ? 'வேறு தேடல் சொல்லை முயற்சிக்கவும்.' : 'Try another search term or category.'} />}</Container>;
}
