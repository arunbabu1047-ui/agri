import { ButtonGroup, Button } from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';

const labels = {
  ta: '\u0ba4\u0bae\u0bbf\u0bb4\u0bcd',
  en: 'English',
};

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const options = ['ta', 'en'];

  return (
    <ButtonGroup size="small" variant="text" aria-label="Language selector" className="language-switcher">
      {options.map((code) => (
        <Button key={code} onClick={() => setLanguage(code)} aria-pressed={language === code} variant={language === code ? 'contained' : 'text'}>
          {labels[code]}
        </Button>
      ))}
    </ButtonGroup>
  );
}
