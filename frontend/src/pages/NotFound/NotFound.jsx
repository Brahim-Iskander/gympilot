import { Box, Button, Container, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SEO from '../../components/SEO';
import { useLanguage } from '../../i18n';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <>
      <SEO title={`${t('notFound.title')} (404)`} description={t('notFound.description')} noIndex />
      <Container maxWidth="sm" sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
        <Typography sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, fontSize: { xs: 72, md: 96 }, color: 'primary.main' }}>
          {t('notFound.code')}
        </Typography>
        <Typography variant="h5" component="h1" fontWeight={700} sx={{ mt: 1 }}>
          {t('notFound.title')}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {t('notFound.description')}
        </Typography>
        <Button component={RouterLink} to="/" variant="contained" size="large" sx={{ mt: 4, alignSelf: 'center' }}>
          {t('notFound.backHome')}
        </Button>
      </Container>
    </>
  );
}
