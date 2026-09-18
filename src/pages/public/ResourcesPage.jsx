import { useEffect, useMemo, useState } from 'react';
import { Container, Grid, Stack } from '@mui/material';
import { useLanguage, useTranslation } from '../../contexts/LanguageContext';
import { listContent } from '../../services/contentService';
import { resources as sampleResources, categories } from '../../data/contentData';
import SectionHeading from '../../components/common/SectionHeading';
import SearchBar from '../../components/common/SearchBar';
import CategoryFilter from '../../components/common/CategoryFilter';
import ResourceCard from '../../components/resources/ResourceCard';
import EmptyState from '../../components/common/EmptyState';

export default function ResourcesPage() { const { t } = useTranslation(); const { language } = useLanguage(); const [items, setItems] = useState(sampleResources); const [query, setQuery] = useState(''); const [category, setCategory] = useState('all'); useEffect(() => { listContent('resources').then(setItems).catch(() => {}); }, []); const filtered = useMemo(() => items.filter((item) => (category === 'all' || item.category_id === category) && `${item.title_en} ${item.title_ta} ${item.description_en} ${item.description_ta}`.toLowerCase().includes(query.toLowerCase())), [items, category, query]); return <Container maxWidth="lg" className="page-shell"><SectionHeading eyebrow="LIBRARY / REFERENCES" title={t('resources.title')} subtitle={t('resources.subtitle')} /><Stack gap={2.5} sx={{ mb: 4 }}><SearchBar value={query} onChange={setQuery} /><CategoryFilter categories={categories} value={category} onChange={setCategory} /></Stack>{filtered.length ? <Grid container spacing={2.5}>{filtered.map((item) => <Grid key={item.id} size={{ xs: 12, md: 4 }}><ResourceCard item={item} /></Grid>)}</Grid> : <EmptyState title={t('common.noResults')} description={language === 'ta' ? 'வேறு தேடல் சொல்லை முயற்சிக்கவும்.' : 'Try another search term.'} />}</Container>; }
