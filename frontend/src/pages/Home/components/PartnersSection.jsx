import { useEffect, useState } from 'react';
import { Box, Container, Stack, Typography, Card, Chip, styled, Skeleton, keyframes } from '@mui/material';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';

import { partnerService } from '../../../services/partnerService';

// Left to Right sliding animation
const scrollGlissLeftToRight = keyframes`
  0% {
    transform: translateX(-50%);
  }
  100% {
    transform: translateX(0%);
  }
`;

// Right to Left sliding animation
const scrollGlissRightToLeft = keyframes`
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-50%);
  }
`;

const ModernPartnerCard = styled(Card)(({ theme }) => ({
  width: 320,
  minWidth: 320,
  borderRadius: 20,
  padding: '20px',
  background: 'rgba(18, 21, 27, 0.75)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(16px)',
  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  position: 'relative',
  overflow: 'hidden',
  flexShrink: 0,

  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: 20,
    padding: '1.5px',
    background: 'linear-gradient(135deg, rgba(198, 255, 62, 0.3), transparent 60%)',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    opacity: 0.5,
    transition: 'opacity 0.4s ease',
  },

  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    borderColor: 'rgba(198, 255, 62, 0.5)',
    boxShadow: '0 20px 40px rgba(198, 255, 62, 0.18)',
    '& .partner-img': {
      transform: 'scale(1.08)',
    },
    '& .partner-arrow': {
      transform: 'translate(3px, -3px)',
      color: '#C6FF3E',
    },
    '&::before': {
      opacity: 1,
    },
  },
}));

export default function PartnersSection() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPartners() {
      try {
        setLoading(true);
        const data = await partnerService.getPublicPartners();
        setPartners(data ?? []);
      } catch (err) {
        console.error('Failed to load partners', err);
      } finally {
        setLoading(false);
      }
    }
    loadPartners();
  }, []);

  // Multiply partner lists to achieve smooth, seamless infinite looping scroll
  const displayPartnersRow1 = partners.length > 0 ? [...partners, ...partners, ...partners] : [];
  // Reverse order for row 2 to give visual variety
  const displayPartnersRow2 = partners.length > 0 ? [...partners].reverse().concat([...partners].reverse(), [...partners].reverse()) : [];

  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 }, position: 'relative', overflow: 'hidden' }}>
      {/* Background ambient glow */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 900,
          height: 500,
          background: 'radial-gradient(circle, rgba(198,255,62,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Stack spacing={1.5} alignItems="center" sx={{ textAlign: 'center', mb: 7 }}>
          <Chip
            icon={<VerifiedRoundedIcon sx={{ fontSize: '1.1rem !important', color: '#C6FF3E !important' }} />}
            label="OFFICIAL NETWORK"
            size="small"
            sx={{
              bgcolor: 'rgba(198,255,62,0.1)',
              color: '#C6FF3E',
              fontWeight: 800,
              letterSpacing: '0.08em',
              fontSize: '0.72rem',
              border: '1px solid rgba(198,255,62,0.25)',
              px: 1,
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontFamily: "'Sora','Inter',sans-serif",
              fontWeight: 800,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              letterSpacing: '-0.02em',
            }}
          >
            Partnered with Industry Leaders
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 620, fontSize: '1.05rem', lineHeight: 1.7 }}>
            We collaborate with world-class fitness, equipment, and nutrition brands to power your ultimate bodybuilding transformation.
          </Typography>
        </Stack>
      </Container>

      {/* Dual Row Gliding Slider Container */}
      <Stack
        spacing={3}
        sx={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          py: 2,
          // Left and right gradient fade masks
          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: { xs: 60, md: 200 },
            zIndex: 3,
            pointerEvents: 'none',
          },
          '&::before': {
            left: 0,
            background: 'linear-gradient(to right, #0A0C0F 0%, transparent 100%)',
          },
          '&::after': {
            right: 0,
            background: 'linear-gradient(to left, #0A0C0F 0%, transparent 100%)',
          },
          // Pause slider animation on hover so users can easily click!
          '&:hover .gliss-track': {
            animationPlayState: 'paused',
          },
        }}
      >
        {loading ? (
          <Stack direction="row" spacing={3} justifyContent="center" sx={{ px: 4 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" width={320} height={200} sx={{ borderRadius: 5, flexShrink: 0 }} />
            ))}
          </Stack>
        ) : partners.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">No active partners right now.</Typography>
          </Box>
        ) : (
          <>
            {/* ROW 1: Left to Right */}
            <Box
              className="gliss-track"
              sx={{
                display: 'flex',
                gap: 3,
                width: 'max-content',
                animation: `${scrollGlissLeftToRight} 38s linear infinite`,
                willChange: 'transform',
              }}
            >
              {displayPartnersRow1.map((partner, index) => (
                <ModernPartnerCard
                  key={`r1-${partner.id || partner.name}-${index}`}
                  component="a"
                  href={partner.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {/* Image Banner */}
                  <Box
                    sx={{
                      width: '100%',
                      height: 125,
                      borderRadius: 3.5,
                      overflow: 'hidden',
                      position: 'relative',
                      bgcolor: 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <Box
                      component="img"
                      className="partner-img"
                      src={partner.imageUrl}
                      alt={partner.name}
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=300&q=80';
                      }}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(18,21,27,0.85) 0%, transparent 60%)',
                      }}
                    />
                    <Chip
                      label="Official Partner"
                      size="small"
                      sx={{
                        position: 'absolute',
                        bottom: 10,
                        left: 10,
                        bgcolor: 'rgba(10,12,15,0.75)',
                        color: '#C6FF3E',
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(198,255,62,0.3)',
                      }}
                    />
                  </Box>

                  {/* Content */}
                  <Stack spacing={0.75} sx={{ px: 0.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1" fontWeight={800} color="text.primary" sx={{ fontSize: '1.1rem' }}>
                        {partner.name}
                      </Typography>
                      <LaunchRoundedIcon
                        className="partner-arrow"
                        sx={{ fontSize: 18, color: 'text.secondary', transition: 'transform 0.3s ease, color 0.3s ease' }}
                      />
                    </Stack>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.5,
                        fontSize: '0.82rem',
                      }}
                    >
                      {partner.description}
                    </Typography>
                  </Stack>
                </ModernPartnerCard>
              ))}
            </Box>

            {/* ROW 2: Right to Left */}
            <Box
              className="gliss-track"
              sx={{
                display: 'flex',
                gap: 3,
                width: 'max-content',
                animation: `${scrollGlissRightToLeft} 42s linear infinite`,
                willChange: 'transform',
              }}
            >
              {displayPartnersRow2.map((partner, index) => (
                <ModernPartnerCard
                  key={`r2-${partner.id || partner.name}-${index}`}
                  component="a"
                  href={partner.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {/* Image Banner */}
                  <Box
                    sx={{
                      width: '100%',
                      height: 125,
                      borderRadius: 3.5,
                      overflow: 'hidden',
                      position: 'relative',
                      bgcolor: 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <Box
                      component="img"
                      className="partner-img"
                      src={partner.imageUrl}
                      alt={partner.name}
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=300&q=80';
                      }}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(18,21,27,0.85) 0%, transparent 60%)',
                      }}
                    />
                    <Chip
                      label="Verified Partner"
                      size="small"
                      sx={{
                        position: 'absolute',
                        bottom: 10,
                        left: 10,
                        bgcolor: 'rgba(10,12,15,0.75)',
                        color: '#8A7CFF',
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(138,124,255,0.3)',
                      }}
                    />
                  </Box>

                  {/* Content */}
                  <Stack spacing={0.75} sx={{ px: 0.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1" fontWeight={800} color="text.primary" sx={{ fontSize: '1.1rem' }}>
                        {partner.name}
                      </Typography>
                      <LaunchRoundedIcon
                        className="partner-arrow"
                        sx={{ fontSize: 18, color: 'text.secondary', transition: 'transform 0.3s ease, color 0.3s ease' }}
                      />
                    </Stack>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.5,
                        fontSize: '0.82rem',
                      }}
                    >
                      {partner.description}
                    </Typography>
                  </Stack>
                </ModernPartnerCard>
              ))}
            </Box>
          </>
        )}
      </Stack>
    </Box>
  );
}
