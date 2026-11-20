import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';
import Footer from '../components/navigation/Footer';
import { useLanguage, useTranslation } from '../contexts/LanguageContext';
import './public-motion.css';

export default function PublicLayout() {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  useEffect(() => {
    if (language === 'kn') setLanguage('en');
  }, [language, setLanguage]);

  return (
    <>
      <a className="public-skip-link" href="#public-main">{t('accessibility.skip')}</a>
      <Navbar />
      <main id="public-main" tabIndex={-1}><Outlet /></main>
      <Footer />
    </>
  );
}
