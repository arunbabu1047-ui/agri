import { Button, ButtonGroup, Stack, Typography } from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';

export default function CategoryFilter({ categories, value, onChange }) {
  const { language } = useLanguage();
  return <Stack className="category-filter" direction="row" spacing={1} alignItems="center" sx={{ overflowX: 'auto', pb: 1 }}>
    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap', mr: 1 }}>Topic</Typography>
    <ButtonGroup variant="outlined" size="small" sx={{ flexWrap: 'nowrap' }}>
      <Button onClick={() => onChange('all')} variant={value === 'all' ? 'contained' : 'outlined'}>All</Button>
      {categories.map((category) => <Button key={category.id} onClick={() => onChange(category.id)} variant={value === category.id ? 'contained' : 'outlined'} sx={{ whiteSpace: 'nowrap' }}>{category[`name_${language}`]}</Button>)}
    </ButtonGroup>
  </Stack>;
}

