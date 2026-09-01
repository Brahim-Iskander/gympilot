import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../../components/SEO';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Skeleton,
  Chip,
} from '@mui/material';
import {
  PeopleRounded,
  PersonAddRounded,
  BlockRounded,
  VisibilityRounded,
  TrendingUpRounded,
  CardMembershipRounded,
  WorkspacePremiumRounded,
  StarRounded,
  GroupRounded,
  ConfirmationNumberRounded,
  ArrowForwardRounded,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from 'recharts';

import { adminService } from '../../services/adminService';

function StatCard({ title, value, subtitle, icon: Icon, color = 'primary.main', bgColor, loading }) {
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
              {title}
            </Typography>
            {loading ? (
              <Skeleton width={80} height={40} />
            ) : (
              <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, mb: 0.5 }}>
                {value?.toLocaleString() ?? 0}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Paper
            elevation={0}
            sx={{
              p: 1.25,
              borderRadius: 2.5,
              bgcolor: bgColor ?? (color === 'error.main' ? 'rgba(244,67,54,0.12)' : 'rgba(198,255,62,0.12)'),
              color: color,
            }}
          >
            <Icon fontSize="medium" />
          </Paper>
        </Stack>
      </CardContent>
    </Card>
  );
}

function MemberTierBar({ label, icon: Icon, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
        <Typography variant="body2" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          {Icon && <Icon sx={{ fontSize: 16, color }} />}
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={700} color={color}>{value.toLocaleString()} ({pct}%)</Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 8, borderRadius: 4,
          bgcolor: 'rgba(255,255,255,0.06)',
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 },
        }}
      />
    </Box>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [ticketStats, setTicketStats] = useState(null);
  const [visitorPeriod, setVisitorPeriod] = useState('daily');
  const [regPeriod, setRegPeriod] = useState('daily');
  const [visitorData, setVisitorData] = useState([]);
  const [regData, setRegData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const [dashRes, ticketRes] = await Promise.allSettled([
          adminService.getDashboardStats(),
          adminService.getTicketStats(),
        ]);
        if (dashRes.status === 'fulfilled') setStats(dashRes.value);
        if (ticketRes.status === 'fulfilled') setTicketStats(ticketRes.value);
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  useEffect(() => {
    async function loadVisitorData() {
      try {
        const res = await adminService.getVisitorAnalytics(visitorPeriod);
        setVisitorData(res?.data ?? []);
      } catch (err) {
        console.error('Failed to load visitor chart', err);
      }
    }
    loadVisitorData();
  }, [visitorPeriod]);

  useEffect(() => {
    async function loadRegData() {
      try {
        const res = await adminService.getRegistrationAnalytics(regPeriod);
        setRegData(res?.data ?? []);
      } catch (err) {
        console.error('Failed to load registration chart', err);
      }
    }
    loadRegData();
  }, [regPeriod]);

  return (
    <Container maxWidth="xl" disableGutters>
      <SEO
        title="System Dashboard — Admin"
        description="GymPilot platform management, user registration trends, and activity stats."
        path="/admin"
        noIndex
      />
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight={800}>
              System Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Real-time platform activity, visitor analytics, and growth statistics
            </Typography>
          </Box>
          <Chip icon={<TrendingUpRounded />} label="Live Tracking" color="success" variant="outlined" sx={{ fontWeight: 700 }} />
        </Stack>
      </Box>

      {/* Stat Cards Grid */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Registered Users"
            value={stats?.totalUsers}
            subtitle={`+${stats?.newUsersThisMonth ?? 0} this month`}
            icon={PeopleRounded}
            color="primary.main"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="New Signups Today"
            value={stats?.newUsersToday}
            subtitle={`+${stats?.newUsersThisWeek ?? 0} this week`}
            icon={PersonAddRounded}
            color="primary.main"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Visits Today"
            value={stats?.visitsToday}
            subtitle={`${stats?.visitsThisMonth?.toLocaleString() ?? 0} this month`}
            icon={VisibilityRounded}
            color="primary.main"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Banned Accounts"
            value={stats?.bannedUsers}
            subtitle="Restricted users"
            icon={BlockRounded}
            color="error.main"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* ─── Membership Overview ──────────────────────────────────────────── */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
          <CardMembershipRounded sx={{ color: '#8A7CFF' }} />
          <Box>
            <Typography variant="h5" fontWeight={800}>Membership Overview</Typography>
            <Typography variant="body2" color="text.secondary">Active member count and tier breakdown</Typography>
          </Box>
        </Stack>

        <Grid container spacing={2.5}>
          {/* Total Active Members */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Members"
              value={stats?.totalMembers}
              subtitle={`${stats?.activeMembersCount ?? 0} subscriptions active`}
              icon={CardMembershipRounded}
              color="#8A7CFF"
              bgColor="rgba(138,124,255,0.12)"
              loading={loading}
            />
          </Grid>
          {/* Free Users */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Free Tier Users"
              value={stats?.freeUsersCount}
              subtitle="No active membership"
              icon={GroupRounded}
              color="#98A1AC"
              bgColor="rgba(152,161,172,0.12)"
              loading={loading}
            />
          </Grid>
          {/* Basic Members */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Basic Members"
              value={stats?.basicMembersCount}
              subtitle="Live coach access"
              icon={StarRounded}
              color="#8A7CFF"
              bgColor="rgba(138,124,255,0.12)"
              loading={loading}
            />
          </Grid>
          {/* Premium Members */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Premium Members"
              value={stats?.premiumMembersCount}
              subtitle="Full priority access"
              icon={WorkspacePremiumRounded}
              color="#FFB800"
              bgColor="rgba(255,184,0,0.12)"
              loading={loading}
            />
          </Grid>
        </Grid>

        {/* Tier Breakdown Panel */}
        <Grid container spacing={3} sx={{ mt: 0.5 }}>
          {/* Bar breakdown */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>Tier Distribution</Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
                Breakdown of users by membership tier
              </Typography>
              {loading ? (
                <Stack spacing={2}>{[1,2,3].map(i => <Skeleton key={i} height={28} />)}</Stack>
              ) : (
                <Stack spacing={2.5}>
                  <MemberTierBar
                    label="Free"
                    icon={GroupRounded}
                    value={stats?.freeUsersCount ?? 0}
                    total={stats?.totalUsers ?? 1}
                    color="#98A1AC"
                  />
                  <MemberTierBar
                    label="Basic"
                    icon={StarRounded}
                    value={stats?.basicMembersCount ?? 0}
                    total={stats?.totalUsers ?? 1}
                    color="#8A7CFF"
                  />
                  <MemberTierBar
                    label="Premium"
                    icon={WorkspacePremiumRounded}
                    value={stats?.premiumMembersCount ?? 0}
                    total={stats?.totalUsers ?? 1}
                    color="#FFB800"
                  />
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Active subscriptions</Typography>
                    <Chip
                      label={`${stats?.activeMembersCount ?? 0} active`}
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ fontWeight: 700 }}
                    />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Inactive subscriptions</Typography>
                    <Chip
                      label={`${stats?.inactiveMembersCount ?? 0} inactive`}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 700 }}
                    />
                  </Stack>
                </Stack>
              )}
            </Paper>
          </Grid>

          {/* Pie chart */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>Membership Mix</Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                Visual breakdown across all tiers
              </Typography>
              {loading ? (
                <Skeleton variant="circular" width={180} height={180} sx={{ mx: 'auto', mt: 3 }} />
              ) : (
                <Box sx={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Free',    value: stats?.freeUsersCount    ?? 0 },
                          { name: 'Basic',   value: stats?.basicMembersCount  ?? 0 },
                          { name: 'Premium', value: stats?.premiumMembersCount ?? 0 },
                        ]}
                        cx="50%" cy="50%"
                        innerRadius={60} outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        <Cell fill="#98A1AC" />
                        <Cell fill="#8A7CFF" />
                        <Cell fill="#FFB800" />
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#12151B', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8 }}
                        labelStyle={{ color: '#fff', fontWeight: 700 }}
                      />
                      <Legend
                        formatter={(value) => <span style={{ color: '#fff', fontWeight: 600 }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* ─── Support Tickets Overview ──────────────────────────────────────── */}
      <Box sx={{ mb: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: ticketStats?.unread > 0 ? 'error.main' : 'divider',
            bgcolor: 'background.paper',
            background: 'linear-gradient(135deg, rgba(255,82,82,0.05) 0%, rgba(138,124,255,0.03) 100%)',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
            sx={{ mb: 2.5 }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <ConfirmationNumberRounded sx={{ color: 'error.main', fontSize: 28 }} />
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Support Ticket Operations
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Triage athlete inquiries, payment verification requests, and account changes
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="contained"
              endIcon={<ArrowForwardRounded />}
              onClick={() => navigate('/admin/tickets')}
              sx={{
                bgcolor: 'error.main',
                color: '#fff',
                fontWeight: 800,
                borderRadius: 2.5,
                px: 2.5,
                '&:hover': { bgcolor: '#d32f2f' },
              }}
            >
              Open Ticket Desk
            </Button>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,82,82,0.08)', border: '1px solid rgba(255,82,82,0.2)' }}>
                <Typography variant="caption" color="error.main" fontWeight={800} display="block">
                  NEEDS ATTENTION
                </Typography>
                <Typography variant="h5" fontWeight={900} sx={{ color: 'error.main', my: 0.25 }}>
                  {ticketStats?.unread ?? 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Unread messages
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.2)' }}>
                <Typography variant="caption" color="#00E676" fontWeight={800} display="block">
                  ACTIVE / OPEN
                </Typography>
                <Typography variant="h5" fontWeight={900} sx={{ color: '#00E676', my: 0.25 }}>
                  {ticketStats?.open ?? 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  In progress
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={800} display="block">
                  RESOLVED
                </Typography>
                <Typography variant="h5" fontWeight={900} sx={{ my: 0.25 }}>
                  {ticketStats?.closed ?? 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Closed tickets
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={800} display="block">
                  TOTAL SUBMISSIONS
                </Typography>
                <Typography variant="h5" fontWeight={900} sx={{ my: 0.25 }}>
                  {ticketStats?.total ?? 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  All-time tickets
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Charts Row */}
      <Grid container spacing={3}>
        {/* Visitor Traffic Chart */}
        <Grid item xs={12} lg={6}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Visitor Traffic
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  API requests breakdown ({visitorPeriod})
                </Typography>
              </Box>

              <ToggleButtonGroup
                size="small"
                value={visitorPeriod}
                exclusive
                onChange={(_, val) => val && setVisitorPeriod(val)}
                sx={{ '& .MuiToggleButton-root': { textTransform: 'capitalize', px: 1.5, py: 0.5, fontWeight: 600 } }}
              >
                <ToggleButton value="daily">Daily</ToggleButton>
                <ToggleButton value="monthly">Monthly</ToggleButton>
                <ToggleButton value="yearly">Yearly</ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={visitorData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="visitorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C6FF3E" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#C6FF3E" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" tick={{ fill: '#98A1AC', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#98A1AC', fontSize: 11 }} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#12151B', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8 }}
                    labelStyle={{ color: '#fff', fontWeight: 700 }}
                  />
                  <Area type="monotone" dataKey="count" name="Visits" stroke="#C6FF3E" strokeWidth={3} fillOpacity={1} fill="url(#visitorGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* User Registrations Chart */}
        <Grid item xs={12} lg={6}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  User Growth
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  New account registrations ({regPeriod})
                </Typography>
              </Box>

              <ToggleButtonGroup
                size="small"
                value={regPeriod}
                exclusive
                onChange={(_, val) => val && setRegPeriod(val)}
                sx={{ '& .MuiToggleButton-root': { textTransform: 'capitalize', px: 1.5, py: 0.5, fontWeight: 600 } }}
              >
                <ToggleButton value="daily">Daily</ToggleButton>
                <ToggleButton value="monthly">Monthly</ToggleButton>
                <ToggleButton value="yearly">Yearly</ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" tick={{ fill: '#98A1AC', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#98A1AC', fontSize: 11 }} allowDecimals={false} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#12151B', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8 }}
                    labelStyle={{ color: '#fff', fontWeight: 700 }}
                  />
                  <Bar dataKey="count" name="New Users" fill="#8A7CFF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
