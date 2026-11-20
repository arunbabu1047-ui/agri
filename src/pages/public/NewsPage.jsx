import { useEffect, useRef, useState } from 'react';
import { Button, Card, CardActionArea, Container } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useLanguage, useTranslation } from '../../contexts/LanguageContext';
import { listContent } from '../../services/contentService';
import { news as sampleNews, videos as sampleVideos, categories } from '../../data/contentData';
import { isSupabaseConfigured } from '../../lib/supabase';
import { localized } from '../../utils/formatters';
import SearchBar from '../../components/common/SearchBar';
import EmptyState from '../../components/common/EmptyState';
import './NewsPage.css';

const published = (items) => items.filter((item) => item.status === 'published');

export default function NewsPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { hash } = useLocation();
  const resultsSection = useRef(null);
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const [articles, setArticles] = useState(() => isSupabaseConfigured ? [] : published(sampleNews));
  const [videos, setVideos] = useState(() => isSupabaseConfigured ? [] : published(sampleVideos));
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [failed, setFailed] = useState(false);
  const category = params.get('category') || 'all';

  useEffect(() => {
    if (hash === '#latest-news' && resultsSection.current) {
      resultsSection.current.focus({ preventScroll: true });
      resultsSection.current.scrollIntoView();
    }
  }, [hash]);

  function setFilter(key, value, replace = false) {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    }, { replace });
  }

  useEffect(() => {
    let active = true;
    listContent('news', { language }).then((items) => {
      if (active) {
        setArticles(published(items));
        setFailed(false);
      }
    }).catch(() => {
      if (active) setFailed(true);
    }).finally(() => {
      if (active) setLoading(false);
    });
    listContent('videos', { language }).then((items) => {
      if (active) setVideos(published(items));
    }).catch(() => {
      if (active) setVideos([]);
    });
    return () => { active = false; };
  }, [language]);

  const search = query.trim().toLowerCase();
  const hasFilters = Boolean(search) || category !== 'all';
  const filtered = articles.filter((item) => (
    (category === 'all' || item.category_id === category) &&
    (!search || ['en', 'ta', 'kn'].some((lang) => [item[`title_${lang}`], item[`summary_${lang}`]]
      .some((value) => value?.toLowerCase().includes(search))))
  ));
  const featured = articles[0];

  return (
    <div className="public-news">
      <Container maxWidth="lg">
        <header className="public-news-hero">
          <div className="public-news-hero-copy">
            <h1>{t('newsLanding.title')}</h1>
            <p>{t('newsLanding.intro')}</p>
            <Button component="a" href="#latest-news" variant="contained" className="public-news-cta" endIcon={<ArrowDownwardRoundedIcon />}>
              {t('newsLanding.explore')}
            </Button>
          </div>
          {featured && (
            <Link className="public-news-feature" to={`/news/${featured.slug}`}>
              <span className="public-news-label">{t('home.featured')}</span>
              <h2>{localized(featured, 'title', language)}</h2>
              <p>{localized(featured, 'summary', language)}</p>
              <span className="public-news-feature-link">{t('common.readMore')} <ArrowForwardRoundedIcon aria-hidden="true" /></span>
            </Link>
          )}
        </header>

        <section ref={resultsSection} id="latest-news" className="public-news-section" aria-labelledby="latest-news-title" tabIndex={-1}>
          <div className="public-news-section-header public-news-article-header">
            <h2 id="latest-news-title">{t(hasFilters ? 'newsLanding.results' : 'newsLanding.latest')}</h2>
            <div className="public-news-filters">
              <SearchBar value={query} onChange={(value) => setFilter('q', value, true)} label={t('newsLanding.search')} />
              <select aria-label={t('news.filter')} value={category} onChange={(event) => {
                const next = event.target.value;
                setFilter('category', next === 'all' ? '' : next);
              }}>
                <option value="all">{t('newsLanding.allTopics')}</option>
                {categories.map((topic) => <option key={topic.id} value={topic.id}>{localized(topic, 'name', language)}</option>)}
              </select>
            </div>
          </div>
          {hasFilters && !loading && !failed && (
            <p className="public-news-result-count" role="status">{t('newsLanding.resultCount', { count: filtered.length })}</p>
          )}
          {filtered.length > 0 ? (
            <div className="public-news-grid">
              {filtered.map((item) => (
                <Card key={item.id} component="article">
                  <CardActionArea component={Link} to={`/news/${item.slug}`} className="public-news-article">
                    <span className="public-news-label">
                      {[localized(categories.find((entry) => entry.id === item.category_id), 'name', language), item.sample && t('common.sample')].filter(Boolean).join(' · ')}
                    </span>
                    <h3>{localized(item, 'title', language)}</h3>
                    <p>{localized(item, 'summary', language)}</p>
                    <span className="public-news-read">{t('common.readMore')} <ArrowForwardRoundedIcon aria-hidden="true" /></span>
                  </CardActionArea>
                </Card>
              ))}
            </div>
          ) : loading ? <p role="status">{t('common.loading')}</p> : (
            <EmptyState title={t(failed ? 'newsLanding.unavailable' : 'common.noResults')} description={t(failed ? 'newsLanding.tryLater' : 'newsLanding.trySearch')} />
          )}
        </section>

        {videos.length > 0 && (
          <section className="public-news-section" aria-labelledby="news-videos-title">
            <div className="public-news-section-header">
              <h2 id="news-videos-title">{t('newsLanding.watch')}</h2>
              <Link className="public-news-read" to="/videos">{t('videos.videoLibrary')} <ArrowForwardRoundedIcon aria-hidden="true" /></Link>
            </div>
            <div className="public-news-grid">
              {videos.slice(0, 3).map((item) => (
                <Card key={item.id}>
                  <CardActionArea component={Link} to={`/videos/${item.slug}`} className="public-news-video">
                    <span className="public-news-play" aria-hidden="true"><span><PlayArrowRoundedIcon /></span></span>
                    <span className="public-news-video-copy">
                      <span className="public-news-video-title">{localized(item, 'title', language)}</span>
                      <span className="public-news-video-meta">{[item.spoken_language, item.duration].filter(Boolean).join(' · ')}</span>
                    </span>
                  </CardActionArea>
                </Card>
              ))}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
}
