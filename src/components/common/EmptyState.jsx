import { Stack, Typography } from '@mui/material';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';

export default function EmptyState({ title = 'Nothing here yet', description = 'Try a different search or check back later.' }) {
  return <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ minHeight: 240, textAlign: 'center', color: 'text.secondary' }}><SearchOffRoundedIcon sx={{ fontSize: 42, color: 'primary.light' }} /><Typography variant="h6" color="text.primary">{title}</Typography><Typography>{description}</Typography></Stack>;
}
