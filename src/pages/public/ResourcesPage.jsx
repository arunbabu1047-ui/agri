import { useEffect, useState } from 'react';
import { Button, Container } from '@mui/material';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import { useSearchParams } from 'react-router-dom';
import { useLanguage, useTranslation } from '../../contexts/LanguageContext';
import { listContent } from '../../services/contentService';
import { resources as sampleResources, categories } from '../../data/contentData';
import { isSupabaseConfigured } from '../../lib/supabase';
import { localized } from '../../utils/formatters';
import SearchBar from '../../components/common/SearchBar';
import ResourceCard from '../../components/resources/ResourceCard';
import EmptyState from '../../components/common/EmptyState';
import './ResourcesPage.css';

const formats = [
  ['all', 'resourceLanding.allFormats'],
  ['guide', 'resourceLanding.guides'],
  ['article', 'resourceLanding.articles'],
  ['link', 'resourceLanding.links'],
];
const published = (items) => items.filter((item) => item.status === 'published');

export default function ResourcesPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [content, setContent] = useState(() => isSupabaseConfigured
    ? { items: [], status: 'loading' }
    : { items: published(sampleResources), status: 'ready' });
  const category = params.get('category') || 'all';
  const requestedFormat = params.get('type');
  const format = formats.some(([value]) => value === requestedFormat) ? requestedFormat : 'all';

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    listContent('resources', { language }).then((items) => {
      if (active) setContent({ items: published(items), status: 'ready' });
    }).catch(() => {
      if (active) setContent((current) => ({ ...current, status: 'error' }));
    });
    return () => { active = false; };
  }, [language]);

  function setFilter(key, value) {
    const next = new URLSearchParams(params);
    if (value === 'all') next.delete(key);
    else next.set(key, value);
    setParams(next);
  }

  const { items, status } = content;
  const search = query.trim().toLowerCase();
  const filtered = items.filter((item) => (category === 'all' || item.category_id === category) &&
    (format === 'all' || item.type === format) &&
    (!search || ['en', 'ta', 'kn'].some((code) => [item['title_' + code], item['description_' + code]]
      .some((value) => value?.toLowerCase().includes(search)))));

  return (
    <div className="public-resources">
      <Container maxWidth="lg">
        <section className="resources-hero" aria-labelledby="resources-title">
          <div className="resources-hero-copy">
            <h1 id="resources-title">{t('resourceLanding.title')}</h1>
            <p>{t('resourceLanding.intro')}</p>
            <Button component="a" href="#resource-library" variant="contained" className="resources-cta" endIcon={<ArrowDownwardRoundedIcon />}>
              {t('resourceLanding.browse')}
            </Button>
          </div>
          <div className="resource-formats" role="group" aria-labelledby="resource-formats-title">
            <h2 id="resource-formats-title">{t('resources.type')}</h2>
            <div className="resource-format-buttons">
              {formats.map(([value, label]) => (
                <Button key={value} aria-pressed={format === value} onClick={() => setFilter('type', value)}>{t(label)}</Button>
              ))}
            </div>
          </div>
        </section>

        <section id="resource-library" className="resource-library" aria-labelledby="resource-library-title">
          <div className="resource-library-header">
            <h2 id="resource-library-title">{t('resources.title')}</h2>
            <div className="resource-library-filters">
              <SearchBar value={query} onChange={setQuery} label={t('resourceLanding.search')} />
              <select aria-label={t('news.filter')} value={category} onChange={(event) => setFilter('category', event.target.value)}>
                <option value="all">{t('newsLanding.allTopics')}</option>
                {categories.map((topic) => <option key={topic.id} value={topic.id}>{localized(topic, 'name', language)}</option>)}
              </select>
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="resource-library-grid">
              {filtered.map((item) => <ResourceCard key={item.id} item={item} />)}
            </div>
          ) : status === 'loading' ? <p role="status">{t('common.loading')}</p> : (
            <EmptyState
              title={t(status === 'error' ? 'homeLearning.unavailable' : items.length ? 'resourceLanding.noMatches' : 'resourceLanding.empty')}
              description={t(status === 'error' || !items.length ? 'newsLanding.tryLater' : 'resourceLanding.tryFilters')}
            />
          )}
        </section>
      </Container>
    </div>
  );
}
