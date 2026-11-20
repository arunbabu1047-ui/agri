import { useEffect, useState } from 'react';
import { Button, Container } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage, useTranslation } from '../../contexts/LanguageContext';
import { listContent } from '../../services/contentService';
import { categories, news, videos } from '../../data/contentData';
import { isSupabaseConfigured } from '../../lib/supabase';
import { formatDate, localized } from '../../utils/formatters';
import SearchBar from '../../components/common/SearchBar';
import NewsCard from '../../components/news/NewsCard';
import VideoCard from '../../components/videos/VideoCard';
import FarmBrief from '../../components/weather/FarmBrief';
import './HomePage.css';

const sources = [
  { type: 'news', samples: news, limit: 6 },
  { type: 'videos', samples: videos, limit: 3 },
];
const destinations = [
  { path: '/news', title: 'readNews', text: 'readNewsText', Icon: ArticleOutlinedIcon },
  { path: '/videos', title: 'watchVideos', text: 'watchVideosText', Icon: PlayCircleOutlineRoundedIcon },
  { path: '/resources', title: 'findGuides', text: 'findGuidesText', Icon: MenuBookOutlinedIcon },
];
const preview = (items, limit) => items.filter((item) => item.status === 'published').slice(0, limit);
const newestFirst = (items) => [...items].sort((a, b) => {
  const aDate = Date.parse(a.date || a.published_at || a.created_at || '') || 0;
  const bDate = Date.parse(b.date || b.published_at || b.created_at || '') || 0;
  return bDate - aDate;
});
const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

function HomeMasthead() {
  const { t } = useTranslation();
  const [allowMotion, setAllowMotion] = useState(() => !window.matchMedia(reducedMotionQuery).matches);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia(reducedMotionQuery);
    function updateMotion(event) {
      setAllowMotion(!event.matches);
    }
    preference.addEventListener('change', updateMotion);
    return () => preference.removeEventListener('change', updateMotion);
  }, []);

  return (
    <div className="editorial-masthead">
      <div className="editorial-masthead-copy">
        <h1>{t('homeLearning.title')}</h1>
        <p>{t('homeLearning.intro')}</p>
      </div>
      <div className="editorial-masthead-media" aria-hidden="true">
        {allowMotion && !videoFailed && (
          <video
            src="/cornfield-loop.mp4"
            poster="/cornfield-poster.webp"
            muted
            autoPlay
            playsInline
            loop
            onError={() => setVideoFailed(true)}
          />
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [content, setContent] = useState(() => Object.fromEntries(sources.map(({ type, samples, limit }) => [
    type, isSupabaseConfigured ? { status: 'loading', items: [] } : { status: 'ready', items: preview(samples, limit) },
  ])));

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    for (const { type, limit } of sources) {
      listContent(type, { language }).then((items) => {
        if (active) {
          setContent((current) => ({ ...current, [type]: { status: 'ready', items: preview(items, limit) } }));
        }
      }).catch(() => {
        if (active) {
          setContent((current) => ({ ...current, [type]: { status: 'error', items: current[type].items } }));
        }
      });
    }
    return () => { active = false; };
  }, [language]);

const [featured, ...latest] = newestFirst(content.news.items);

  function searchNews(event) {
    event.preventDefault();
    const query = search.trim();
    if (query) navigate({ pathname: '/news', search: new URLSearchParams({ q: query }).toString(), hash: '#latest-news' });
  }

  function statusLabel(type) {
    const { status } = content[type];
    if (status === 'loading') return t('common.loading');
    return t('homeLearning.' + (status === 'error' ? 'unavailable' : type + 'Empty'));
  }

  return (
    <div className="editorial-home">
      <Container maxWidth="lg">
        <HomeMasthead />

        <nav className="editorial-destinations" aria-label={t('homeLearning.choose')}>
          {destinations.map(({ path, title, text, Icon }) => (
            <Link to={path} className="editorial-destination" key={path}>
              <span className="editorial-destination-icon"><Icon aria-hidden="true" /></span>
              <span className="editorial-destination-copy">
                <strong>{t('homeLearning.' + title)}</strong>
                <span>{t('homeLearning.' + text)}</span>
              </span>
              <ArrowForwardRoundedIcon aria-hidden="true" />
            </Link>
          ))}
        </nav>

        <FarmBrief />

        <form className="editorial-search" role="search" aria-label={t('homeLearning.search')} onSubmit={searchNews}>
          <SearchBar value={search} onChange={setSearch} label={t('homeLearning.search')} />
          <Button type="submit" variant="contained" disabled={!search.trim()}>{t('nav.search')}</Button>
        </form>

        <div className="editorial-front-grid">
          <section className="editorial-lead" aria-labelledby="editorial-lead-title">
            <h2 id="editorial-lead-title" className="editorial-section-title">
              {t(featured ? 'home.featured' : 'newsLanding.latest')}
            </h2>
            {featured ? <NewsCard item={featured} featured /> : (
              <p className="editorial-status" role="status">{statusLabel('news')}</p>
            )}
          </section>
          {featured && (
            <section className="editorial-latest" aria-labelledby="editorial-latest-title">
              <h2 id="editorial-latest-title" className="editorial-section-title">{t('newsLanding.latest')}</h2>
              {latest.length > 0 && (
                <ul>
                  {latest.map((item) => {
                    const category = categories.find((topic) => topic.id === item.category_id);
                    const date = item.date || item.created_at;
                    return (
                      <li key={item.id}>
                        <Link to={'/news/' + item.slug} className="editorial-headline">
                          <div className="editorial-headline-text">
                            <span className="editorial-headline-meta">
                              {[localized(category, 'name', language), item.sample && t('common.sample')].filter(Boolean).join(' · ')}
                            </span>
                            <h3>{localized(item, 'title', language)}</h3>
                            {date && <span className="editorial-date">{formatDate(date, language)}</span>}
                          </div>
                          {item.image && (
                            <img key={item.image} src={item.image} alt="" loading="lazy" onError={(event) => { event.currentTarget.hidden = true; }} />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
              <Link className="editorial-arrow-link" to="/news">{t('homeLearning.allNews')} <ArrowForwardRoundedIcon aria-hidden="true" /></Link>
            </section>
          )}
        </div>

        <section className="editorial-section" aria-labelledby="editorial-videos-title">
          <div className="editorial-section-heading">
            <h2 id="editorial-videos-title" className="editorial-section-title">{t('newsLanding.watch')}</h2>
            <Link className="editorial-arrow-link" to="/videos">{t('videos.videoLibrary')} <ArrowForwardRoundedIcon aria-hidden="true" /></Link>
          </div>
          {content.videos.items.length > 0 ? (
            <div className="editorial-video-grid">
              {content.videos.items.map((item) => <VideoCard key={item.id} item={item} />)}
            </div>
          ) : <p className="editorial-status" role="status">{statusLabel('videos')}</p>}
        </section>
      </Container>
    </div>
  );
}
