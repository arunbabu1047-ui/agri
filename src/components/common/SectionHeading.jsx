import { Box, Stack, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Link } from 'react-router-dom';

export default function SectionHeading({ eyebrow, title, subtitle, link, linkLabel }) {
  return <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'flex-end' }} gap={2} sx={{ mb: 4 }}>
    <Box><Typography className="eyebrow">{eyebrow}</Typography><Typography variant="h3" sx={{ mt: 0.8 }}>{title}</Typography>{subtitle && <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 580 }}>{subtitle}</Typography>}</Box>
    {link && <Link className="arrow-link" to={link}>{linkLabel}<ArrowForwardRoundedIcon fontSize="small" /></Link>}
  </Stack>;
}
