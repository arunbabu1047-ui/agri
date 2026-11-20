import { useEffect, useState } from 'react';
import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { confirmPasswordReset } from '../../services/authService';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [ready, setReady] = useState(false);
  const [checkingLink, setCheckingLink] = useState(true);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function validateRecoveryLink() {
      if (!supabase) {
        if (active) {
          setError('Supabase is not configured for this app.');
          setCheckingLink(false);
        }
        return;
      }

      const hash = new URLSearchParams(window.location.hash.replace(/^#\??/, ''));
      const tokenHash = params.get('token_hash');

      if (tokenHash) {
        const { error: verifyError } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' });
        if (verifyError) {
          if (active) setError('This reset link is invalid or expired. Request a new one.');
        } else if (active) {
          setReady(true);
        }
        if (active) setCheckingLink(false);
        return;
      }

      const isRecoveryLink = hash.get('type') === 'recovery';
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!active) return;

      if (isRecoveryLink && data.session) setReady(true);
      else setError(sessionError?.message || 'This reset link is invalid or expired. Request a new one.');
      setCheckingLink(false);
    }

    validateRecoveryLink().catch((validationError) => {
      if (active) {
        setError(validationError.message || 'Could not validate this reset link. Request a new one.');
        setCheckingLink(false);
      }
    });

    return () => { active = false; };
  }, [params]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await confirmPasswordReset(password);
      setNotice('Password updated. You can sign in with your new password.');
    } catch (err) {
      setError(err.message || 'Could not update the password. Request a new reset link.');
    }
  };

  return <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '100vh', p: 2 }}><Card sx={{ width: 'min(100%, 460px)' }}><CardContent sx={{ p: 4 }}><Typography className="eyebrow">AB AGRI / SECURE ACCESS</Typography><Typography variant="h4" sx={{ mt: 1 }}>Set a new password</Typography><Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>Choose a password for your AB Agri account.</Typography>{checkingLink && <Alert severity="info" sx={{ mb: 2 }}>Checking your secure reset link…</Alert>}{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}{notice && <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert>}{ready && !notice && <Stack component="form" onSubmit={submit} gap={2}><TextField fullWidth label="New password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required inputProps={{ minLength: 8 }} /><Button type="submit" variant="contained" disabled={checkingLink}>Update password</Button></Stack>}<Button component={Link} to="/admin/login" sx={{ mt: 1 }}>Back to sign in</Button></CardContent></Card></Stack>;
}
