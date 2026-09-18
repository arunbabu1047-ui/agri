import {
  Box,
  Container,
  Divider,
  Grid,
  Link as MuiLink,
  Stack,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useTranslation } from "../../contexts/LanguageContext";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <Box component="footer" className="site-footer">
      <Container maxWidth="lg">
        <Grid container spacing={5}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Link to="/" className="brand footer-brand">
              <span className="brand-mark"><img src="/ab-agri-logo.png" alt="" /></span>
              <span>
                <b>AB</b> Agri<small>KNOWLEDGE FOR THE FIELD</small>
              </span>
            </Link>
            <Typography
              color="rgba(255,255,255,.65)"
              sx={{ mt: 2, maxWidth: 360 }}
            >
              {t("home.subtitle")}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <Typography className="footer-title">Explore</Typography>
            <Stack gap={1.3}>
              {[
                ["/news", "nav.news"],
                ["/videos", "nav.videos"],
                ["/resources", "nav.resources"],
              ].map(([path, label]) => (
                <MuiLink key={path} component={Link} to={path}>
                  {t(label)}
                </MuiLink>
              ))}
            </Stack>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <Typography className="footer-title">About</Typography>
            <Stack gap={1.3}>
              {[
                ["/about", "nav.about"],
                ["/contact", "nav.contact"],
              ].map(([path, label]) => (
                <MuiLink key={path} component={Link} to={path}>
                  {t(label)}
                </MuiLink>
              ))}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography className="footer-title">Stay connected</Typography>
            <Typography color="rgba(255,255,255,.65)" variant="body2">
              {t("contact.email")}
            </Typography>
            <MuiLink href="mailto:arun@agricultureofab.site">
              arun@agricultureofab.site
            </MuiLink>
            <MuiLink href="https://wa.me/?text=Discover%20AB%20Agri%20-%20practical%20agriculture%20knowledge%20for%20the%20field" target="_blank" rel="noreferrer" sx={{ display: "block", mt: 1.2 }}>Share on WhatsApp</MuiLink>
            <Typography
              color="rgba(255,255,255,.65)"
              variant="body2"
              sx={{ mt: 1.4 }}
            >
              A configurable contact point for your team.
            </Typography>
          </Grid>
        </Grid>
        <Divider sx={{ my: 5, borderColor: "rgba(255,255,255,.14)" }} />
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          gap={1}
        >
          <Typography variant="caption" color="rgba(255,255,255,.45)">
            © 2025 AB Agri{" "}
          </Typography>
          <Typography variant="caption" color="rgba(255,255,255,.45)">
            Built for useful decisions in the field.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
