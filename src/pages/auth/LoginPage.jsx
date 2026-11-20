import { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Checkbox, FormControlLabel, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/LanguageContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { requestPasswordReset } from '../../services/authService';

export default function LoginPage() {
  const { t } = useTranslation(); const { signIn, previewSignIn, isAuthenticated } = useAuth(); const navigate = useNavigate(); const location = useLocation();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [show, setShow] = useState(false); const [remember, setRemember] = useState(true); const [mode, setMode] = useState('login'); const [error, setError] = useState(''); const [notice, setNotice] = useState(''); const [loading, setLoading] = useState(false);
  const destination = location.state?.from || '/admin';
  useEffect(() => { if (isAuthenticated && mode === 'login') navigate(destination, { replace: true }); }, [destination, isAuthenticated, mode, navigate]);
  const submit = async (event) => { event.preventDefault(); setError(''); setNotice(''); if (!email || (mode === 'login' && !password)) { setError('Enter the required fields.'); return; } setLoading(true); try { if (mode === 'reset') { await requestPasswordReset(email); setNotice('If the account exists, a reset email has been requested.'); } else { await signIn(email, password, remember); navigate(location.state?.from || '/admin'); } } catch (err) { setError(err.message || 'Unable to sign in.'); } finally { setLoading(false); } };
  return (
    <Box className="auth-shell auth-editorial">
      <Box component="header" className="auth-topbar">
        <Link to="/" className="brand">
          <span className="brand-mark auth-logo-mark"><img src="/ab-agri-logo.png" alt="AB Agri logo" /></span>
          <span><b>AB</b> Agri<small>KNOWLEDGE FOR THE FIELD</small></span>
        </Link>
        <Link to="/" className="back-link"><ArrowBackRoundedIcon fontSize="small" /> {t('auth.backToSite')}</Link>
      </Box>
      <Box component="main" className="auth-editorial-main">
        <Box className="auth-editorial-hero">
          {/* Free stock footage: Pexels, by Özgür Sürmeli. */}
          <video className="auth-editorial-video" src="/green-field-tractor.mp4" poster="https://images.pexels.com/videos/33971961/farmer-plowing-the-field-with-a-tractor-33971961.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=1260" muted autoPlay loop playsInline preload="metadata" aria-hidden="true" />
          <Box className="auth-editorial-hero-copy">
            <Typography className="eyebrow">AB AGRI / CONTENT WORKSPACE</Typography>
            <Typography component="h1">Good farming knowledge, ready for the field.</Typography>
            <Typography>Sign in to publish bilingual stories, practical videos, and trusted farming resources.</Typography>
          </Box>
        </Box>
        <Card className="auth-card auth-editorial-card">
          <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
            <Typography className="eyebrow">{mode === 'reset' ? 'ACCOUNT ACCESS' : 'EDITOR SIGN IN'}</Typography>
            <Typography variant="h3" sx={{ mt: 1 }}>{mode === 'reset' ? 'Reset your password' : t('auth.welcome')}</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>{mode === 'reset' ? 'Enter your email and we’ll send a secure reset link if an account exists.' : t('auth.subtitle')}</Typography>
            {isSupabaseConfigured ? <>
              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              {notice && <Alert severity="success" sx={{ mt: 2 }}>{notice}</Alert>}
              <Box component="form" onSubmit={submit} sx={{ mt: 3 }}>
                <Stack gap={2}>
                  <TextField label={t('auth.email')} type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
                  {mode === 'login' && <TextField label={t('auth.password')} required type={show ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShow((value) => !value)} aria-label="Show password">{show ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}</IconButton></InputAdornment> }} />}
                </Stack>
                {mode === 'login' && <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}><FormControlLabel control={<Checkbox checked={remember} onChange={(event) => setRemember(event.target.checked)} size="small" />} label="Remember me" /><Button type="button" size="small" onClick={() => { setMode('reset'); setError(''); }}>{t('auth.forgot')}</Button></Stack>}
                <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ mt: 2 }}>{mode === 'reset' ? 'Send reset link' : t('auth.signIn')}</Button>
              </Box>
              {mode === 'reset' && <Button fullWidth sx={{ mt: 1 }} onClick={() => setMode('login')}>{t('common.back')}</Button>}
            </> : <Box className="auth-preview-state">
              <Alert severity="success" variant="outlined">Local preview mode is ready. You can explore the admin workspace without signing in.</Alert>
              <Button onClick={() => { previewSignIn(); navigate('/admin'); }} variant="contained" fullWidth size="large">Open local preview</Button>
            </Box>}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
