import { Button, Container } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../contexts/LanguageContext';
import './AboutPage.css';

const sections = [
  { path: '/news', title: 'about.news', description: 'about.newsDescription', Icon: ArticleOutlinedIcon },
  { path: '/videos', title: 'about.videos', description: 'about.videosDescription', Icon: PlayCircleOutlineRoundedIcon },
  { path: '/resources', title: 'about.resources', description: 'about.resourcesDescription', Icon: MenuBookOutlinedIcon },
];

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="public-about">
      <Container maxWidth="lg">
        <section className="about-hero" aria-labelledby="about-title">
          <div className="about-hero-copy">
            <h1 id="about-title">{t('about.title')}</h1>
            <p>{t('about.intro')}</p>
            <p>{t('about.body')}</p>
          </div>
          <div className="about-hero-photo" aria-hidden="true" />
        </section>

        <section className="about-explore" aria-labelledby="about-explore-title">
          <h2 id="about-explore-title">{t('about.explore')}</h2>
          <div className="about-explore-grid">
            {sections.map(({ path, title, description, Icon }) => (
              <Link to={path} className="about-explore-card" key={path}>
                <span className="about-card-icon"><Icon aria-hidden="true" /></span>
                <h3>{t(title)}</h3>
                <p>{t(description)}</p>
                <ArrowForwardRoundedIcon className="about-card-arrow" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>

        <section className="about-contact" aria-labelledby="about-contact-title">
          <h2 id="about-contact-title">{t('about.contactPrompt')}</h2>
          <Button component={Link} to="/contact" variant="outlined" endIcon={<ArrowForwardRoundedIcon />}>
            {t('nav.contact')}
          </Button>
        </section>
      </Container>
    </div>
  );
}
