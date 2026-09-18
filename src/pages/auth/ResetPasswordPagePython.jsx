import { useState } from 'react';
import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { Link, useSearchParams } from 'react-router-dom';
import { confirmPasswordReset } from '../../services/authService';

export default function ResetPasswordPage() {
  const [params] = useSearchParams(); const token = params.get('token') || ''; const [password, setPassword] = useState(''); const [notice, setNotice] = useState(''); const [error, setError] = useState('');
  const submit = async (event) => { event.preventDefault(); setError(''); try { await confirmPasswordReset(token, password); setNotice('Password updated. You can sign in now.'); } catch (err) { setError(err.message); } };
  return <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '100vh', p: 2 }}><Card sx={{ width: 'min(100%, 460px)' }}><CardContent sx={{ p: 4 }}><Typography variant="h4">Set a new password</Typography><Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>Choose a password for your Agri Pulse account.</Typography>{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}{notice && <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert>}<Stack component="form" onSubmit={submit} gap={2}><TextField fullWidth label="New password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required inputProps={{ minLength: 8 }} /><Button type="submit" variant="contained" disabled={!token}>Update password</Button></Stack><Button component={Link} to="/admin/login" sx={{ mt: 1 }}>Back to sign in</Button></CardContent></Card></Stack>;
}
