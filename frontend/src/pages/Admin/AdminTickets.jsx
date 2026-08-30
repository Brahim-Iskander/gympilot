import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  FormControl,
  InputLabel,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  Badge,
  Alert,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  InputAdornment,
} from '@mui/material';
import {
  CloseRounded,
  SendRounded,
  AttachFileRounded,
  LockRounded,
  LockOpenRounded,
  ConfirmationNumberRounded,
  SearchRounded,
  RefreshRounded,
  CheckCircleRounded,
  SupportAgentRounded,
  PersonRounded,
  HelpOutlineRounded,
  PaymentRounded,
  CardMembershipRounded,
  BugReportRounded,
  FeedbackRounded,
  FilterListRounded,
  ZoomInRounded,
} from '@mui/icons-material';

import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

const TOPIC_CONFIG = {
  GENERAL: { label: 'General Inquiry', color: '#8A7CFF', icon: <HelpOutlineRounded fontSize="small" /> },
  PAYMENT: { label: 'Payment Verification', color: '#00E676', icon: <PaymentRounded fontSize="small" /> },
  MEMBERSHIP: { label: 'Membership Upgrade', color: '#FFB300', icon: <CardMembershipRounded fontSize="small" /> },
  TECHNICAL: { label: 'Technical Issue', color: '#FF5252', icon: <BugReportRounded fontSize="small" /> },
  COMPLAINT: { label: 'Feedback / Complaint', color: '#FF4081', icon: <FeedbackRounded fontSize="small" /> },
};

export default function AdminTickets() {
  const theme = useTheme();
  const { user: currentAdmin } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(''); // '' (all), 'OPEN', 'CLOSED'
  const [topicFilter, setTopicFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Stats
  const [stats, setStats] = useState({ open: 0, closed: 0, unread: 0, total: 0 });

  // Selected ticket for triage
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loadingTicket, setLoadingTicket] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyImage, setReplyImage] = useState(null);
  const [replyImagePreview, setReplyImagePreview] = useState(null);
  const [sendingReply, setSendingReply] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  // Full image viewer
  const [previewModalImg, setPreviewModalImg] = useState(null);

  const replyFileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const fetchTicketsAndStats = async () => {
    try {
      setLoading(true);
      const [ticketsData, statsData] = await Promise.all([
        adminService.getTickets({
          status: statusFilter || undefined,
          topic: topicFilter || undefined,
        }),
        adminService.getTicketStats(),
      ]);

      setTickets(ticketsData || []);
      if (statsData) setStats(statsData);
    } catch (err) {
      console.error('Failed to load admin tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketsAndStats();
  }, [statusFilter, topicFilter]);

  const openTicketDetail = async (ticketId) => {
    try {
      setLoadingTicket(true);
      const data = await adminService.getTicketById(ticketId);
      setSelectedTicket(data);
      // Mark as read in local state
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, unreadByAdmin: false } : t))
      );
      setStats((prev) => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
    } catch (err) {
      console.error('Failed to load ticket detail:', err);
    } finally {
      setLoadingTicket(false);
    }
  };

  useEffect(() => {
    if (selectedTicket) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedTicket?.messages]);

  // Reply Image handling
  const handleReplyImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Only JPG, PNG, and WebP images are allowed.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setReplyImage({
        base64: reader.result,
        type: file.type,
      });
      setReplyImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveReplyImage = () => {
    setReplyImage(null);
    setReplyImagePreview(null);
    if (replyFileInputRef.current) replyFileInputRef.current.value = '';
  };

  // Send admin reply
  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket || sendingReply) return;

    try {
      setSendingReply(true);
      const updated = await adminService.replyToTicket(selectedTicket.id, {
        message: replyMessage.trim(),
        imageBase64: replyImage?.base64 || null,
        imageType: replyImage?.type || null,
      });

      setSelectedTicket(updated);
      setReplyMessage('');
      handleRemoveReplyImage();
      fetchTicketsAndStats();
    } catch (err) {
      console.error('Failed to send admin reply:', err);
    } finally {
      setSendingReply(false);
    }
  };

  // Toggle ticket status (Close / Reopen)
  const handleToggleStatus = async () => {
    if (!selectedTicket || togglingStatus) return;

    try {
      setTogglingStatus(true);
      let updated;
      if (selectedTicket.status === 'OPEN') {
        updated = await adminService.closeTicket(selectedTicket.id);
      } else {
        updated = await adminService.reopenTicket(selectedTicket.id);
      }
      setSelectedTicket(updated);
      fetchTicketsAndStats();
    } catch (err) {
      console.error('Failed to change ticket status:', err);
    } finally {
      setTogglingStatus(false);
    }
  };

  // Search filter
  const filteredTickets = tickets.filter((t) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.subject?.toLowerCase().includes(query) ||
      t.userFullName?.toLowerCase().includes(query) ||
      t.userEmail?.toLowerCase().includes(query)
    );
  });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
            <Avatar
              sx={{
                bgcolor: 'error.main',
                color: '#fff',
                width: 40,
                height: 40,
                boxShadow: '0 4px 14px rgba(255,82,82,0.4)',
              }}
            >
              <ConfirmationNumberRounded />
            </Avatar>
            <Typography variant="h4" fontWeight={900} sx={{ fontFamily: "'Sora', sans-serif" }}>
              Support Ticket Desk
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Manage, triage, and reply to user support tickets, payment verifications, and account requests.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshRounded />}
          onClick={fetchTicketsAndStats}
          disabled={loading}
          sx={{ borderRadius: 3 }}
        >
          Refresh Desk
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: stats.unread > 0 ? 'error.main' : 'divider',
              boxShadow: stats.unread > 0 ? '0 4px 20px rgba(255,82,82,0.15)' : 'none',
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              NEEDS ATTENTION
            </Typography>
            <Typography variant="h4" fontWeight={900} sx={{ color: stats.unread > 0 ? 'error.main' : 'text.primary', my: 0.5 }}>
              {stats.unread}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Unread messages from users
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              ACTIVE TICKETS
            </Typography>
            <Typography variant="h4" fontWeight={900} sx={{ color: '#00E676', my: 0.5 }}>
              {stats.open}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Currently open
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              RESOLVED TICKETS
            </Typography>
            <Typography variant="h4" fontWeight={900} sx={{ color: 'text.secondary', my: 0.5 }}>
              {stats.closed}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Closed & completed
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              TOTAL TICKETS
            </Typography>
            <Typography variant="h4" fontWeight={900} sx={{ my: 0.5 }}>
              {stats.total}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              All time tickets created
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by subject, athlete name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={6} md={3.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="OPEN">Open Only</MenuItem>
                <MenuItem value="CLOSED">Resolved Only</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={3.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Topic / Category</InputLabel>
              <Select
                value={topicFilter}
                label="Topic / Category"
                onChange={(e) => setTopicFilter(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {Object.entries(TOPIC_CONFIG).map(([key, cfg]) => (
                  <MenuItem key={key} value={key}>
                    {cfg.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Tickets Table */}
      {loading ? (
        <Box sx={{ py: 10, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress color="primary" />
        </Box>
      ) : filteredTickets.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 4,
            bgcolor: 'background.paper',
            border: '1px dashed',
            borderColor: 'divider',
          }}
        >
          <ConfirmationNumberRounded sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            No support tickets match your filters
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria or topic filters.
          </Typography>
        </Card>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 3,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>User / Athlete</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Subject & Message</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Topic</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Updated</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTickets.map((ticket) => {
                const topicInfo = TOPIC_CONFIG[ticket.topic] || TOPIC_CONFIG.GENERAL;
                const isOpen = ticket.status === 'OPEN';
                const timeAgo = ticket.updatedAt
                  ? new Date(ticket.updatedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '';

                return (
                  <TableRow
                    key={ticket.id}
                    hover
                    onClick={() => openTicketDetail(ticket.id)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: ticket.unreadByAdmin ? 'rgba(255,82,82,0.05)' : 'transparent',
                    }}
                  >
                    {/* User */}
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 34, height: 34, bgcolor: '#8A7CFF', fontWeight: 800, fontSize: '0.8rem' }}>
                          {ticket.userFullName?.charAt(0) || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={800}>
                            {ticket.userFullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {ticket.userEmail}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* Subject */}
                    <TableCell sx={{ maxWidth: 320 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {ticket.unreadByAdmin && (
                          <Chip
                            label="UNREAD"
                            size="small"
                            sx={{
                              bgcolor: 'error.main',
                              color: '#fff',
                              fontWeight: 900,
                              fontSize: '0.65rem',
                              height: 18,
                            }}
                          />
                        )}
                        <Typography variant="body2" fontWeight={700} noWrap>
                          {ticket.subject}
                        </Typography>
                      </Stack>
                      {ticket.messages?.[0]?.message && (
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                          {ticket.messages[0].message}
                        </Typography>
                      )}
                    </TableCell>

                    {/* Topic */}
                    <TableCell>
                      <Chip
                        icon={topicInfo.icon}
                        label={topicInfo.label}
                        size="small"
                        sx={{
                          bgcolor: `${topicInfo.color}15`,
                          color: topicInfo.color,
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          border: `1px solid ${topicInfo.color}30`,
                        }}
                      />
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Chip
                        icon={isOpen ? <LockOpenRounded sx={{ fontSize: '14px !important' }} /> : <LockRounded sx={{ fontSize: '14px !important' }} />}
                        label={isOpen ? 'Open' : 'Resolved'}
                        size="small"
                        sx={{
                          bgcolor: isOpen ? 'rgba(0,230,118,0.1)' : 'rgba(255,255,255,0.05)',
                          color: isOpen ? '#00E676' : 'text.secondary',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      />
                    </TableCell>

                    {/* Time */}
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {timeAgo}
                      </Typography>
                    </TableCell>

                    {/* Action */}
                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          openTicketDetail(ticket.id);
                        }}
                        sx={{ borderRadius: 2, fontWeight: 700 }}
                      >
                        Triage & Reply
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ========================================================
          ADMIN TICKET TRIAGE & CONVERSATION MODAL
      ========================================================= */}
      <Dialog
        open={Boolean(selectedTicket || loadingTicket)}
        onClose={() => setSelectedTicket(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            border: '1px solid',
            borderColor: 'divider',
            height: '85vh',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {loadingTicket ? (
          <Box sx={{ p: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : selectedTicket ? (
          <>
            {/* Modal Header */}
            <Box
              sx={{
                p: 2.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                background: 'linear-gradient(135deg, rgba(255,82,82,0.06) 0%, rgba(138,124,255,0.04) 100%)',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <Chip
                      icon={TOPIC_CONFIG[selectedTicket.topic]?.icon}
                      label={TOPIC_CONFIG[selectedTicket.topic]?.label || selectedTicket.topic}
                      size="small"
                      sx={{
                        bgcolor: `${TOPIC_CONFIG[selectedTicket.topic]?.color}15`,
                        color: TOPIC_CONFIG[selectedTicket.topic]?.color,
                        fontWeight: 800,
                        fontSize: '0.7rem',
                      }}
                    />
                    <Chip
                      icon={
                        selectedTicket.status === 'OPEN' ? (
                          <LockOpenRounded sx={{ fontSize: '14px !important' }} />
                        ) : (
                          <LockRounded sx={{ fontSize: '14px !important' }} />
                        )
                      }
                      label={selectedTicket.status === 'OPEN' ? 'Open Ticket' : 'Resolved'}
                      size="small"
                      sx={{
                        bgcolor: selectedTicket.status === 'OPEN' ? 'rgba(0,230,118,0.1)' : 'rgba(255,255,255,0.08)',
                        color: selectedTicket.status === 'OPEN' ? '#00E676' : 'text.secondary',
                        fontWeight: 800,
                        fontSize: '0.7rem',
                      }}
                    />
                  </Stack>
                  <Typography variant="h6" fontWeight={800} sx={{ fontFamily: "'Sora', sans-serif" }}>
                    {selectedTicket.subject}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    From <strong>{selectedTicket.userFullName}</strong> ({selectedTicket.userEmail}) • Created{' '}
                    {new Date(selectedTicket.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1} alignItems="center">
                  {selectedTicket.status === 'OPEN' ? (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<CheckCircleRounded />}
                      onClick={handleToggleStatus}
                      disabled={togglingStatus}
                      sx={{
                        borderRadius: 2,
                        fontWeight: 700,
                        color: '#00E676',
                        borderColor: 'rgba(0,230,118,0.3)',
                        '&:hover': { borderColor: '#00E676', bgcolor: 'rgba(0,230,118,0.08)' },
                      }}
                    >
                      Mark Resolved
                    </Button>
                  ) : (
                    <Chip
                      icon={<LockRounded sx={{ fontSize: '14px !important' }} />}
                      label="Resolved & Closed"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.08)',
                        color: 'text.secondary',
                        fontWeight: 800,
                      }}
                    />
                  )}
                  <IconButton onClick={() => setSelectedTicket(null)} size="small">
                    <CloseRounded />
                  </IconButton>
                </Stack>
              </Stack>
            </Box>

            {/* Conversation Thread */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 2.5,
                bgcolor: 'background.default',
              }}
            >
              {selectedTicket.messages?.map((msg, idx) => {
                const isAdminMsg = msg.senderRole === 'ADMIN';
                const time = msg.createdAt
                  ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '';

                return (
                  <Stack
                    key={msg.id || idx}
                    direction={isAdminMsg ? 'row-reverse' : 'row'}
                    spacing={1.5}
                    alignItems="flex-start"
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: isAdminMsg ? 'error.main' : '#C6FF3E',
                        color: isAdminMsg ? '#fff' : '#000',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                      }}
                    >
                      {isAdminMsg ? <SupportAgentRounded fontSize="small" /> : <PersonRounded fontSize="small" />}
                    </Avatar>

                    <Box sx={{ maxWidth: { xs: '85%', sm: '75%' } }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        justifyContent={isAdminMsg ? 'flex-end' : 'flex-start'}
                        sx={{ mb: 0.5 }}
                      >
                        <Typography
                          variant="caption"
                          fontWeight={800}
                          sx={{ color: isAdminMsg ? 'error.main' : 'text.primary' }}
                        >
                          {isAdminMsg ? `Admin (${msg.senderName})` : selectedTicket.userFullName}
                        </Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                          {time}
                        </Typography>
                      </Stack>

                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          borderTopRightRadius: isAdminMsg ? 4 : 16,
                          borderTopLeftRadius: !isAdminMsg ? 4 : 16,
                          bgcolor: isAdminMsg
                            ? (theme.palette.mode === 'dark' ? 'rgba(255,82,82,0.12)' : 'rgba(255,82,82,0.08)')
                            : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                          border: isAdminMsg ? '1px solid rgba(255,82,82,0.2)' : '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <Typography variant="body2" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap', fontWeight: 500 }}>
                          {msg.message}
                        </Typography>

                        {/* Image attachment */}
                        {msg.imageBase64 && (
                          <Box sx={{ mt: 1.5 }}>
                            <Box
                              component="img"
                              src={msg.imageBase64}
                              alt="Attached proof"
                              onClick={() => setPreviewModalImg(msg.imageBase64)}
                              sx={{
                                maxWidth: '100%',
                                maxHeight: 220,
                                borderRadius: 2,
                                cursor: 'pointer',
                                objectFit: 'cover',
                                border: '1px solid',
                                borderColor: 'divider',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'scale(1.02)' },
                              }}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mt: 0.5,
                                color: 'text.secondary',
                                cursor: 'pointer',
                                fontWeight: 700,
                              }}
                              onClick={() => setPreviewModalImg(msg.imageBase64)}
                            >
                              <ZoomInRounded sx={{ fontSize: 16, mr: 0.5 }} /> Click image to enlarge
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    </Box>
                  </Stack>
                );
              })}
              <div ref={messagesEndRef} />
            </Box>

            {/* Admin Reply Box / Closed Banner */}
            <Box
              sx={{
                p: 2.5,
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              {selectedTicket.status === 'CLOSED' ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.02)',
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1.5,
                  }}
                >
                  <LockRounded sx={{ color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    This ticket has been marked as resolved and closed. The conversation has ended and no further messages can be sent.
                  </Typography>
                </Paper>
              ) : (
                <>
                  {replyImagePreview && (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1,
                        mb: 1.5,
                        borderRadius: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        bgcolor: 'rgba(255,255,255,0.03)',
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                          component="img"
                          src={replyImagePreview}
                          alt="Attachment preview"
                          sx={{ width: 36, height: 36, borderRadius: 1.5, objectFit: 'cover' }}
                        />
                        <Typography variant="caption" fontWeight={700}>
                          Image attached
                        </Typography>
                      </Stack>
                      <IconButton size="small" color="error" onClick={handleRemoveReplyImage}>
                        <CloseRounded fontSize="small" />
                      </IconButton>
                    </Paper>
                  )}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    ref={replyFileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleReplyImageSelect}
                  />

                  <Stack direction="row" spacing={1} alignItems="flex-end">
                    <IconButton
                      onClick={() => replyFileInputRef.current?.click()}
                      disabled={sendingReply}
                      color={replyImage ? 'primary' : 'default'}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.05)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                      }}
                    >
                      <AttachFileRounded />
                    </IconButton>

                    <TextField
                      fullWidth
                      multiline
                      maxRows={4}
                      placeholder="Type official admin response to athlete..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      disabled={sendingReply}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply();
                        }
                      }}
                      InputProps={{
                        sx: { borderRadius: 3 },
                      }}
                    />

                    <Button
                      variant="contained"
                      onClick={handleSendReply}
                      disabled={!replyMessage.trim() || sendingReply}
                      sx={{
                        bgcolor: 'error.main',
                        color: '#fff',
                        fontWeight: 800,
                        borderRadius: 3,
                        px: 2.5,
                        height: 48,
                        minWidth: 48,
                        '&:hover': { bgcolor: '#d32f2f' },
                      }}
                    >
                      {sendingReply ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <SendRounded />}
                    </Button>
                  </Stack>
                </>
              )}
            </Box>
          </>
        ) : null}
      </Dialog>

      {/* ========================================================
          FULL IMAGE PREVIEW MODAL
      ========================================================= */}
      <Dialog
        open={Boolean(previewModalImg)}
        onClose={() => setPreviewModalImg(null)}
        maxWidth="lg"
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none',
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ position: 'relative', p: 1 }}>
          <IconButton
            onClick={() => setPreviewModalImg(null)}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'rgba(0,0,0,0.7)',
              color: '#fff',
              '&:hover': { bgcolor: '#000' },
              zIndex: 10,
            }}
          >
            <CloseRounded />
          </IconButton>
          <Box
            component="img"
            src={previewModalImg}
            alt="Enlarged proof"
            sx={{
              maxWidth: '90vw',
              maxHeight: '85vh',
              borderRadius: 3,
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            }}
          />
        </Box>
      </Dialog>
    </Container>
  );
}
