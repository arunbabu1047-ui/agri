import { useEffect, useState } from 'react';
import { Button, Container } from '@mui/material';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage, useTranslation } from '../../contexts/LanguageContext';
import { listContent } from '../../services/contentService';
import { videos as sampleVideos, categories } from '../../data/contentData';
import { isSupabaseConfigured } from '../../lib/supabase';
import { localized } from '../../utils/formatters';
import SearchBar from '../../components/common/SearchBar';
import VideoCard from '../../components/videos/VideoCard';
import EmptyState from '../../components/common/EmptyState';
import './VideosPage.css';

const published = (items) => items.filter((item) => item.status === 'published');

export default function VideosPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [content, setContent] = useState(() => isSupabaseConfigured
    ? { items: [], status: 'loading' }
    : { items: published(sampleVideos), status: 'ready' });
  const category = params.get('category') || 'all';

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    listContent('videos', { language }).then((items) => {
      if (active) setContent({ items: published(items), status: 'ready' });
    }).catch(() => {
      if (active) setContent((current) => ({ ...current, status: 'error' }));
    });
    return () => { active = false; };
  }, [language]);

  const { items, status } = content;
  const featured = items[0];
  const search = query.trim().toLowerCase();
  const filtered = items.filter((item) => (category === 'all' || item.category_id === category) &&
    (!search || ['en', 'ta', 'kn'].some((code) => [item['title_' + code], item['description_' + code]]
      .some((value) => value?.toLowerCase().includes(search)))));

  return (
    <div className="public-videos">
      <Container maxWidth="lg">
        <section className="videos-hero" aria-labelledby="videos-title">
          <div className="videos-hero-copy">
            <h1 id="videos-title">{t('videoLanding.title')}</h1>
            <p>{t('videoLanding.intro')}</p>
            <Button component="a" href="#video-library" variant="contained" className="videos-cta" endIcon={<ArrowDownwardRoundedIcon />}>
              {t('videoLanding.browse')}
            </Button>
          </div>
          {featured && (
            <Link className="videos-feature" to={'/videos/' + featured.slug}>
              <span className="videos-feature-play"><PlayArrowRoundedIcon aria-hidden="true" /></span>
              <div>
                <span className="videos-feature-label">{t('videoLanding.featured')}</span>
                <h2>{localized(featured, 'title', language)}</h2>
                <span>{t('videos.watch')}{featured.duration && ' · ' + featured.duration}</span>
              </div>
            </Link>
          )}
        </section>

        <section id="video-library" className="video-library" aria-labelledby="video-library-title">
          <div className="video-library-header">
            <h2 id="video-library-title">{t('videos.videoLibrary')}</h2>
            <div className="video-library-filters">
              <SearchBar value={query} onChange={setQuery} label={t('videoLanding.search')} />
              <select aria-label={t('news.filter')} value={category} onChange={(event) => {
                const next = event.target.value;
                setParams(next === 'all' ? {} : { category: next });
              }}>
                <option value="all">{t('newsLanding.allTopics')}</option>
                {categories.map((topic) => <option key={topic.id} value={topic.id}>{localized(topic, 'name', language)}</option>)}
              </select>
            </div>
          </div>
          {filtered.length > 0 ? (
            <div className="video-library-grid">
              {filtered.map((item) => <VideoCard key={item.id} item={item} />)}
            </div>
          ) : status === 'loading' ? <p role="status">{t('common.loading')}</p> : (
            <EmptyState
              title={t(status === 'error' ? 'homeLearning.unavailable' : items.length ? 'videoLanding.noMatches' : 'homeLearning.videosEmpty')}
              description={t(status === 'error' || !items.length ? 'newsLanding.tryLater' : 'newsLanding.trySearch')}
            />
          )}
        </section>
      </Container>
    </div>
  );
}
