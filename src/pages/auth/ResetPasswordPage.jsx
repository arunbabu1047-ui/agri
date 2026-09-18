import { useState } from 'react';
import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { Link, useSearchParams } from 'react-router-dom';
import { confirmPasswordReset } from '../../services/authService';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#\??/, ''));
  const token = params.get('token') || hashParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState(token ? '' : 'This reset link is missing its security token. Please request a new link.');
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await confirmPasswordReset(token, password);
      setNotice('Password updated. You can sign in now.');
    } catch (err) {
      setError(err.message || 'This reset link is invalid or expired.');
    }
  };
  return <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '100vh', p: 2 }}><Card sx={{ width: 'min(100%, 460px)' }}><CardContent sx={{ p: 4 }}><Typography className="eyebrow">AB AGRI / SECURE ACCESS</Typography><Typography variant="h4" sx={{ mt: 1 }}>Set a new password</Typography><Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>Choose a password for your AB Agri account.</Typography>{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}{notice && <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert>}{!notice && <Stack component="form" onSubmit={submit} gap={2}><TextField fullWidth label="New password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required inputProps={{ minLength: 8 }} /><Button type="submit" variant="contained" disabled={!token}>Update password</Button></Stack>}<Button component={Link} to="/admin/login" sx={{ mt: 1 }}>Back to sign in</Button></CardContent></Card></Stack>;
}
