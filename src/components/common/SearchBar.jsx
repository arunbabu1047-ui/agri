import { InputAdornment, TextField } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useTranslation } from '../../contexts/LanguageContext';

export default function SearchBar({ value, onChange, label }) {
  const { t } = useTranslation();
  return <TextField fullWidth value={value} onChange={(event) => onChange(event.target.value)} placeholder={label || t('common.searchPlaceholder')} inputProps={{ 'aria-label': label || t('nav.search') }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon color="action" /></InputAdornment> }} />;
}
