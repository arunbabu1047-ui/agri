import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import en from '../locales/en.json';
import ta from '../locales/ta.json';

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ta: { translation: ta } },
  lng: localStorage.getItem('agri-language') || 'ta',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(i18n.language || 'ta');
  useEffect(() => {
    i18n.changeLanguage(language);
    localStorage.setItem('agri-language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = 'ltr';
  }, [language]);
  const value = useMemo(() => ({ language, setLanguage, isTamil: language === 'ta' }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() { return useContext(LanguageContext); }
export { useTranslation };
