import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  Snackbar,
  Tooltip,
  Avatar,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
} from '@mui/material';
import {
  AddRounded,
  CloseRounded,
  SendRounded,
  AttachFileRounded,
  DeleteRounded,
  LockRounded,
  LockOpenRounded,
  ConfirmationNumberRounded,
  ImageRounded,
  SupportAgentRounded,
  PersonRounded,
  CheckCircleRounded,
  RefreshRounded,
  HelpOutlineRounded,
  PaymentRounded,
  CardMembershipRounded,
  BugReportRounded,
  FeedbackRounded,
  ZoomInRounded,
} from '@mui/icons-material';

import { ticketService } from '../../services/ticketService';
import { useAuth } from '../../context/AuthContext';
import SEO from '../../components/SEO';

const TOPIC_CONFIG = {
  GENERAL: { label: 'General Inquiry', color: '#8A7CFF', icon: <HelpOutlineRounded fontSize="small" /> },
  PAYMENT: { label: 'Payment Verification', color: '#00E676', icon: <PaymentRounded fontSize="small" /> },
  MEMBERSHIP: { label: 'Membership Upgrade', color: '#FFB300', icon: <CardMembershipRounded fontSize="small" /> },
  TECHNICAL: { label: 'Technical Issue', color: '#FF5252', icon: <BugReportRounded fontSize="small" /> },
  COMPLAINT: { label: 'Feedback / Complaint', color: '#FF4081', icon: <FeedbackRounded fontSize="small" /> },
};

export default function SupportTickets() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, OPEN, CLOSED

  // Create ticket dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('GENERAL');
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Ticket detail dialog / thread
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loadingTicket, setLoadingTicket] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyImage, setReplyImage] = useState(null);
  const [replyImagePreview, setReplyImagePreview] = useState(null);
  const [sendingReply, setSendingReply] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  // Full image viewer
  const [previewModalImg, setPreviewModalImg] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  const fileInputRef = useRef(null);
  const replyFileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketService.getMyTickets();
      setTickets(data || []);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const openTicketDetail = async (ticketId) => {
    try {
      setLoadingTicket(true);
      const data = await ticketService.getTicket(ticketId);
      setSelectedTicket(data);
      // Update local unread state in list
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, unreadByUser: false } : t))
      );
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

  // Image handling for Create Ticket
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setCreateError('Only JPG, PNG, and WebP images are allowed.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setCreateError('Image size must be less than 2MB.');
      return;
    }

    setCreateError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageFile({
        base64: reader.result,
        type: file.type,
      });
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Image handling for Reply
  const handleReplyImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setToast({ open: true, message: 'Only JPG, PNG, and WebP images are allowed.', severity: 'warning' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setToast({ open: true, message: 'Image size must be less than 2MB.', severity: 'warning' });
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

  // Submit Create Ticket
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setCreateError('Please fill in both the subject and the message.');
      return;
    }

    try {
      setCreating(true);
      setCreateError('');
      const newTicket = await ticketService.createTicket({
        subject: subject.trim(),
        topic,
        message: message.trim(),
        imageBase64: imageFile?.base64 || null,
        imageType: imageFile?.type || null,
      });

      setCreateOpen(false);
      setSubject('');
      setTopic('GENERAL');
      setMessage('');
      handleRemoveImage();

      // Refresh list and open new ticket
      fetchTickets();
      openTicketDetail(newTicket.id);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create ticket.');
    } finally {
      setCreating(false);
    }
  };

  // Send reply in thread
  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket || sendingReply) return;

    try {
      setSendingReply(true);
      const updated = await ticketService.replyToTicket(selectedTicket.id, {
        message: replyMessage.trim(),
        imageBase64: replyImage?.base64 || null,
        imageType: replyImage?.type || null,
      });

      setSelectedTicket(updated);
      setReplyMessage('');
      handleRemoveReplyImage();
      fetchTickets();
    } catch (err) {
      console.error('Failed to send reply:', err);
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
        updated = await ticketService.closeTicket(selectedTicket.id);
      } else {
        updated = await ticketService.reopenTicket(selectedTicket.id);
      }
      setSelectedTicket(updated);
      fetchTickets();
    } catch (err) {
      console.error('Failed to change ticket status:', err);
    } finally {
      setTogglingStatus(false);
    }
  };

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    if (statusFilter === 'OPEN') return t.status === 'OPEN';
    if (statusFilter === 'CLOSED') return t.status === 'CLOSED';
    return true;
  });

  const openCount = tickets.filter((t) => t.status === 'OPEN').length;
  const closedCount = tickets.filter((t) => t.status === 'CLOSED').length;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SEO
        title="Athlete Help Desk & Support Tickets"
        description="Submit inquiry tickets, report issues, and communicate with the GymPilot technical and billing team."
        path="/support"
        noIndex
      />
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
        }}
      >
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                color: '#000',
                width: 40,
                height: 40,
                boxShadow: '0 4px 14px rgba(198,255,62,0.4)',
              }}
            >
              <ConfirmationNumberRounded />
            </Avatar>
            <Typography variant="h4" fontWeight={900} sx={{ fontFamily: "'Sora', sans-serif" }}>
              Support Center
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Submit questions, payment verification proofs, or membership requests directly to our administration team.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<RefreshRounded />}
            onClick={fetchTickets}
            disabled={loading}
            sx={{ borderRadius: 3 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={() => setCreateOpen(true)}
            sx={{
              bgcolor: 'primary.main',
              color: '#000',
              fontWeight: 800,
              borderRadius: 3,
              px: 3,
              boxShadow: '0 8px 20px rgba(198,255,62,0.3)',
              '&:hover': { bgcolor: '#b3f520' },
            }}
          >
            New Ticket
          </Button>
        </Stack>
      </Box>

      {/* Tabs / Filter bar */}
      <Paper
        elevation={0}
        sx={{
          p: 1,
          mb: 3,
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 1.5,
        }}
      >
        <Tabs
          value={statusFilter}
          onChange={(e, val) => setStatusFilter(val)}
          sx={{
            minHeight: 40,
            '& .MuiTabs-indicator': {
              borderRadius: 2,
              bgcolor: 'primary.main',
            },
          }}
        >
          <Tab
            value="ALL"
            label={`All Tickets (${tickets.length})`}
            sx={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'none', minHeight: 40 }}
          />
          <Tab
            value="OPEN"
            label={
              <Stack direction="row" spacing={0.75} alignItems="center">
                <span>Active ({openCount})</span>
                {openCount > 0 && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: '#00E676',
                      boxShadow: '0 0 6px #00E676',
                    }}
                  />
                )}
              </Stack>
            }
            sx={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'none', minHeight: 40 }}
          />
          <Tab
            value="CLOSED"
            label={`Resolved (${closedCount})`}
            sx={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'none', minHeight: 40 }}
          />
        </Tabs>
      </Paper>

      {/* Tickets List */}
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
            {statusFilter === 'ALL'
              ? 'No support tickets found'
              : statusFilter === 'OPEN'
              ? 'No active tickets'
              : 'No resolved tickets'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Have a question or need assistance with your membership or payment? Open a ticket anytime!
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={() => setCreateOpen(true)}
            sx={{
              bgcolor: 'primary.main',
              color: '#000',
              fontWeight: 800,
              borderRadius: 3,
            }}
          >
            Create Your First Ticket
          </Button>
        </Card>
      ) : (
        <Grid container spacing={2}>
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
              <Grid item xs={12} key={ticket.id}>
                <Card
                  elevation={0}
                  onClick={() => openTicketDetail(ticket.id)}
                  sx={{
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: ticket.unreadByUser ? 'primary.main' : 'divider',
                    boxShadow: ticket.unreadByUser ? '0 4px 20px rgba(198,255,62,0.15)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'visible',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    },
                  }}
                >
                  {ticket.unreadByUser && (
                    <Chip
                      label="NEW ADMIN REPLY"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -10,
                        right: 16,
                        bgcolor: 'primary.main',
                        color: '#000',
                        fontWeight: 900,
                        fontSize: '0.65rem',
                        boxShadow: '0 2px 8px rgba(198,255,62,0.5)',
                      }}
                    />
                  )}
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      spacing={1.5}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
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
                        </Stack>

                        <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 0.5, lineHeight: 1.3 }}>
                          {ticket.subject}
                        </Typography>

                        {ticket.messages?.[0]?.message && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap
                            sx={{ maxWidth: { xs: '100%', md: '80%' } }}
                          >
                            {ticket.messages[0].message}
                          </Typography>
                        )}
                      </Box>

                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}
                      >
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {timeAgo}
                          </Typography>
                          <Typography variant="caption" fontWeight={700} color="primary.main">
                            {ticket.messageCount || 1} message{ticket.messageCount > 1 ? 's' : ''}
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                          View Thread
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* ========================================================
          CREATE TICKET DIALOG
      ========================================================= */}
      <Dialog
        open={createOpen}
        onClose={() => !creating && setCreateOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            border: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <DialogTitle sx={{ p: 3, pb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={800} sx={{ fontFamily: "'Sora', sans-serif" }}>
              Open a Support Ticket
            </Typography>
            <IconButton onClick={() => setCreateOpen(false)} disabled={creating} size="small">
              <CloseRounded />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 3, pt: 1 }}>
          {createError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {createError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleCreateTicket} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField
              label="Subject / Summary"
              placeholder="e.g. Payment proof for Premium upgrade"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              fullWidth
              disabled={creating}
            />

            <FormControl fullWidth>
              <InputLabel id="ticket-topic-label">Category / Topic</InputLabel>
              <Select
                labelId="ticket-topic-label"
                value={topic}
                label="Category / Topic"
                onChange={(e) => setTopic(e.target.value)}
                disabled={creating}
              >
                {Object.entries(TOPIC_CONFIG).map(([key, config]) => (
                  <MenuItem key={key} value={key}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ color: config.color, display: 'flex' }}>{config.icon}</Box>
                      <Typography variant="body2">{config.label}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Your Message"
              placeholder="Describe your issue or provide details about your payment / request..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              multiline
              rows={4}
              required
              fullWidth
              disabled={creating}
            />

            {/* Image Attachment Upload */}
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 1 }}>
                OPTIONAL ATTACHMENT (JPG, PNG, WEBP — MAX 2MB):
              </Typography>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleImageSelect}
              />

              {!imagePreview ? (
                <Button
                  variant="outlined"
                  startIcon={<AttachFileRounded />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={creating}
                  sx={{
                    borderRadius: 2.5,
                    borderStyle: 'dashed',
                    py: 1.5,
                    width: '100%',
                    justifyContent: 'center',
                  }}
                >
                  Attach Screenshot or Proof
                </Button>
              ) : (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: 'rgba(255,255,255,0.03)',
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      component="img"
                      src={imagePreview}
                      alt="Attachment preview"
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        objectFit: 'cover',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    />
                    <Box>
                      <Typography variant="body2" fontWeight={700}>
                        Image attached
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Ready to send with ticket
                      </Typography>
                    </Box>
                  </Stack>
                  <IconButton color="error" size="small" onClick={handleRemoveImage} disabled={creating}>
                    <DeleteRounded fontSize="small" />
                  </IconButton>
                </Paper>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setCreateOpen(false)} disabled={creating} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateTicket}
            disabled={creating || !subject.trim() || !message.trim()}
            startIcon={creating ? <CircularProgress size={16} /> : <SendRounded />}
            sx={{
              bgcolor: 'primary.main',
              color: '#000',
              fontWeight: 800,
              borderRadius: 2,
              px: 3,
            }}
          >
            {creating ? 'Submitting...' : 'Submit Ticket'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================
          TICKET DETAIL & THREAD CONVERSATION MODAL
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
            {/* Thread Header */}
            <Box
              sx={{
                p: 2.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                background: 'linear-gradient(135deg, rgba(198,255,62,0.06) 0%, rgba(138,124,255,0.04) 100%)',
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
                    Created on{' '}
                    {new Date(selectedTicket.createdAt).toLocaleDateString(undefined, {
                      month: 'long',
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
                      Mark as Resolved
                    </Button>
                  ) : (
                    <Chip
                      icon={<LockRounded sx={{ fontSize: '14px !important' }} />}
                      label="Conversation Ended"
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

            {/* Thread Messages */}
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
                const isUser = msg.senderRole === 'USER';
                const time = msg.createdAt
                  ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '';

                return (
                  <Stack
                    key={msg.id || idx}
                    direction={isUser ? 'row-reverse' : 'row'}
                    spacing={1.5}
                    alignItems="flex-start"
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: isUser ? '#C6FF3E' : '#8A7CFF',
                        color: isUser ? '#000' : '#fff',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                      }}
                    >
                      {isUser ? <PersonRounded fontSize="small" /> : <SupportAgentRounded fontSize="small" />}
                    </Avatar>

                    <Box sx={{ maxWidth: { xs: '85%', sm: '75%' } }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        justifyContent={isUser ? 'flex-end' : 'flex-start'}
                        sx={{ mb: 0.5 }}
                      >
                        <Typography
                          variant="caption"
                          fontWeight={800}
                          sx={{ color: isUser ? 'text.secondary' : '#8A7CFF' }}
                        >
                          {isUser ? 'You' : msg.senderName || 'GymPilot Admin Team'}
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
                          borderTopRightRadius: isUser ? 4 : 16,
                          borderTopLeftRadius: !isUser ? 4 : 16,
                          bgcolor: isUser
                            ? '#C6FF3E'
                            : theme.palette.mode === 'dark'
                            ? 'rgba(138,124,255,0.12)'
                            : 'rgba(138,124,255,0.08)',
                          color: isUser ? '#000' : 'text.primary',
                          border: isUser ? 'none' : '1px solid rgba(138,124,255,0.2)',
                          boxShadow: isUser ? '0 4px 14px rgba(198,255,62,0.2)' : 'none',
                        }}
                      >
                        <Typography variant="body2" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap', fontWeight: 500 }}>
                          {msg.message}
                        </Typography>

                        {/* Image attachment if exists */}
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
                                borderColor: isUser ? 'rgba(0,0,0,0.15)' : 'divider',
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
                                color: isUser ? 'rgba(0,0,0,0.6)' : 'text.secondary',
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

            {/* Reply Input Area / Closed Notice */}
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
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.02)',
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: 1.5,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LockRounded sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                      Ticket Resolved & Closed
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 520, lineHeight: 1.5 }}>
                    This conversation has ended and no new messages can be sent. You can still view the entire history. If you need further assistance, please open a new ticket.
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddRounded />}
                    onClick={() => {
                      setSelectedTicket(null);
                      setCreateOpen(true);
                    }}
                    sx={{
                      bgcolor: 'primary.main',
                      color: '#000',
                      fontWeight: 800,
                      borderRadius: 2,
                      px: 2.5,
                      py: 0.75,
                      mt: 0.5,
                    }}
                  >
                    Open New Ticket
                  </Button>
                </Paper>
              ) : (
                <>
                  {/* Reply image attachment preview */}
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
                      placeholder="Type your reply..."
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
                        bgcolor: 'primary.main',
                        color: '#000',
                        fontWeight: 800,
                        borderRadius: 3,
                        px: 2.5,
                        height: 48,
                        minWidth: 48,
                        '&:hover': { bgcolor: '#b3f520' },
                      }}
                    >
                      {sendingReply ? <CircularProgress size={18} /> : <SendRounded />}
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
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
