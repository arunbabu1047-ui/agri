import { ButtonGroup, Button } from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return <ButtonGroup size="small" variant="text" aria-label="Language selector" className="language-switcher">
    <Button onClick={() => setLanguage('ta')} variant={language === 'ta' ? 'contained' : 'text'}>தமிழ்</Button>
    <Button onClick={() => setLanguage('en')} variant={language === 'en' ? 'contained' : 'text'}>English</Button>
  </ButtonGroup>;
}
