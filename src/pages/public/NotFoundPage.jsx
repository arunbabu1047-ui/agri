import { Button, Container, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../contexts/LanguageContext';

export default function NotFoundPage() { const { t } = useTranslation(); return <Container className="not-found"><Typography className="not-found-number">404</Typography><Typography variant="h2">This path hasn’t been planted yet.</Typography><Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>The page you’re looking for may have moved or is still a seed.</Typography><Button component={Link} to="/" variant="contained">{t('nav.home')}</Button></Container>; }
