import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  Alert,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  CircularProgress,
  Divider,
} from '@mui/material';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';

import { referralService } from '../../../services/referralService';

export default function ReferralHub() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await referralService.getReferralStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load referral stats:', err);
      setError('Could not load referral data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!stats?.referralLink) return;
    navigator.clipboard?.writeText(stats.referralLink);
    setToast({
      open: true,
      message: 'Referral link copied to clipboard! Send it to your friends.',
      severity: 'success',
    });
  };

  const handleCopyCode = () => {
    if (!stats?.referralCode) return;
    navigator.clipboard?.writeText(stats.referralCode);
    setToast({
      open: true,
      message: `Referral code "${stats.referralCode}" copied to clipboard!`,
      severity: 'success',
    });
  };

  const handleNativeShare = async () => {
    if (!stats?.referralLink) return;
    const shareData = {
      title: 'Join me on GymPilot!',
      text: `Join me on GymPilot to level up your fitness workouts! Use my invite code "${stats.referralCode}" to get 10 free bonus points on signup:`,
      url: stats.referralLink,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsAppShare = () => {
    if (!stats?.referralLink) return;
    const message = encodeURIComponent(
      `Join me on GymPilot to crush workouts and track gym progress! Sign up with my link to get 10 bonus points: ${stats.referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
  };

  const handleEmailShare = () => {
    if (!stats?.referralLink) return;
    const subject = encodeURIComponent('Join me on GymPilot (10 Free Bonus Points!)');
    const body = encodeURIComponent(
      `Hey!\n\nI'm using GymPilot to log workouts, track PRs, and get AI fitness insights. Sign up using my referral link to get 10 free bonus points:\n\n${stats.referralLink}\n\nHappy training!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  if (loading) {
    return (
      <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: 'primary.main', mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Loading your referral dashboard & points ledger...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" variant="outlined" sx={{ borderRadius: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Top Banner & Overview */}
      <Card
        sx={{
          p: { xs: 2.5, sm: 4 },
          mb: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(198, 255, 62, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
          border: '1px solid rgba(198, 255, 62, 0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} gap={3}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <CardGiftcardRoundedIcon sx={{ color: 'primary.main', fontSize: 26 }} />
              <Chip
                label="Refer & Earn Rewards"
                size="small"
                sx={{ bgcolor: 'rgba(198,255,62,0.15)', color: '#C6FF3E', fontWeight: 800, border: '1px solid rgba(198,255,62,0.3)' }}
              />
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif", mb: 0.5 }}>
              Invite Friends, Earn Points 🎁
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 520 }}>
              Give friends <strong>10 bonus points</strong> when they sign up, and you will earn <strong>5 points</strong> for every member who joins with your link.
            </Typography>
          </Box>

          {/* Points Balance Pill */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              minWidth: { xs: '100%', sm: 220 },
              textAlign: 'center',
              boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
              Your Total Points
            </Typography>
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mt: 0.5 }}>
              <EmojiEventsRoundedIcon sx={{ color: '#FFD700', fontSize: 32 }} />
              <Typography variant="h3" sx={{ fontWeight: 900, fontFamily: "'Sora', sans-serif", color: 'primary.main' }}>
                {stats?.totalPoints ?? 0}
              </Typography>
              <Typography variant="subtitle1" fontWeight={700} color="text.secondary">
                pts
              </Typography>
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.08)' }} />

        {/* Shareable Link Bar */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={7}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.8 }}>
              YOUR UNIQUE REFERRAL LINK
            </Typography>
            <TextField
              fullWidth
              size="medium"
              value={stats?.referralLink || ''}
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <AutoAwesomeRoundedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Copy Link">
                      <IconButton onClick={handleCopyLink} edge="end" sx={{ color: 'primary.main' }}>
                        <ContentCopyRoundedIcon />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
                sx: { fontFamily: 'monospace', fontWeight: 600, bgcolor: 'rgba(0,0,0,0.2)' },
              }}
            />
          </Grid>

          <Grid item xs={12} md={5}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.8 }}>
              QUICK SHARE
            </Typography>
            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              <Button
                variant="contained"
                onClick={handleNativeShare}
                startIcon={<ShareRoundedIcon />}
                sx={{ fontWeight: 700, px: 2.5, py: 1.2, borderRadius: 2 }}
              >
                Share Link
              </Button>
              <Tooltip title="Share on WhatsApp">
                <Button
                  variant="outlined"
                  onClick={handleWhatsAppShare}
                  sx={{
                    minWidth: 46,
                    px: 1.5,
                    color: '#25D366',
                    borderColor: 'rgba(37, 211, 102, 0.4)',
                    '&:hover': { borderColor: '#25D366', bgcolor: 'rgba(37, 211, 102, 0.1)' },
                  }}
                >
                  <WhatsAppIcon />
                </Button>
              </Tooltip>
              <Tooltip title="Share via Email">
                <Button
                  variant="outlined"
                  onClick={handleEmailShare}
                  sx={{
                    minWidth: 46,
                    px: 1.5,
                    color: '#8A7CFF',
                    borderColor: 'rgba(138, 124, 255, 0.4)',
                    '&:hover': { borderColor: '#8A7CFF', bgcolor: 'rgba(138, 124, 255, 0.1)' },
                  }}
                >
                  <EmailRoundedIcon />
                </Button>
              </Tooltip>
            </Stack>
          </Grid>
        </Grid>
      </Card>

      {/* Metrics Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: 'rgba(198,255,62,0.1)', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GroupAddRoundedIcon />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Friends Referred
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
                  {stats?.friendsReferredCount ?? 0}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: 'rgba(0,230,118,0.1)', color: '#00E676', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <EmojiEventsRoundedIcon />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Points from Referrals
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
                  +{stats?.pointsEarnedFromReferrals ?? 0} pts
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: 'rgba(138,124,255,0.1)', color: '#8A7CFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CardGiftcardRoundedIcon />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Your Referral Code
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'monospace', color: '#8A7CFF' }}>
                    {stats?.referralCode}
                  </Typography>
                  <Tooltip title="Copy Code">
                    <IconButton size="small" onClick={handleCopyCode}>
                      <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* How it works Banner */}
      <Card sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'rgba(255,255,255,0.01)' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif", mb: 2 }}>
          How the Referral System Works
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: 'primary.main', color: '#000', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                1
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={700}>
                  Share Your Unique Link
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Send your referral link or code to friends, gym buddies, or social followers.
                </Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: 'primary.main', color: '#000', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                2
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={700}>
                  Friend Signs Up (+10 pts)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Your friend unlocks 10 bonus points right upon completing their registration.
                </Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: 'primary.main', color: '#000', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                3
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={700}>
                  You Earn +5 Points
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  5 reward points are automatically deposited into your account ledger per referral.
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Card>

      {/* Friends & Points Ledger Tables */}
      <Grid container spacing={3}>
        {/* Referred Friends */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <PersonOutlineRoundedIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
                  Referred Friends ({stats?.referredFriends?.length ?? 0})
                </Typography>
              </Stack>
            </Stack>

            {stats?.referredFriends?.length > 0 ? (
              <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider' } }}>
                      <TableCell>Friend</TableCell>
                      <TableCell align="center">Joined</TableCell>
                      <TableCell align="right">Reward</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.referredFriends.map((friend, idx) => (
                      <TableRow key={idx} hover sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)' } }}>
                        <TableCell sx={{ fontWeight: 600 }}>{friend.name}</TableCell>
                        <TableCell align="center" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                          {friend.joinedAt ? new Date(friend.joinedAt).toLocaleDateString() : 'Recent'}
                        </TableCell>
                        <TableCell align="right">
                          <Chip label={`+${friend.pointsEarned} pts`} size="small" sx={{ bgcolor: 'rgba(0,230,118,0.1)', color: '#00E676', fontWeight: 800 }} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No friends referred yet. Share your link to start earning rewards!
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Points History Ledger */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <HistoryRoundedIcon sx={{ color: '#8A7CFF' }} />
                <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
                  Points History Ledger
                </Typography>
              </Stack>
            </Stack>

            {stats?.recentTransactions?.length > 0 ? (
              <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider' } }}>
                      <TableCell>Event</TableCell>
                      <TableCell align="center">Date</TableCell>
                      <TableCell align="right">Points</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.recentTransactions.map((tx) => (
                      <TableRow key={tx.id} hover sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)' } }}>
                        <TableCell sx={{ fontWeight: 600 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {tx.description || tx.reason}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'Recent'}
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${tx.points >= 0 ? '+' : ''}${tx.points} pts`}
                            size="small"
                            sx={{
                              bgcolor: tx.points >= 0 ? 'rgba(198,255,62,0.1)' : 'rgba(255,82,82,0.1)',
                              color: tx.points >= 0 ? 'primary.main' : '#FF5252',
                              fontWeight: 800,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No points activity logged yet.
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar feedback */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: 2, fontWeight: 600 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
