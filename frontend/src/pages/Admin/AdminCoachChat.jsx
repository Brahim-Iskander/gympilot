import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  SendRounded,
  SearchRounded,
  SportsRounded,
  PersonRounded,
  CheckCircleRounded,
  RefreshRounded,
  FitnessCenterRounded,
  MonitorWeightRounded,
  ChatBubbleOutlineRounded,
  QuickreplyRounded,
  TrackChangesRounded,
} from '@mui/icons-material';

import { coachChatService } from '../../services/coachChatService';
import { getApiErrorMessage } from '../../utils/errors';
import { useLanguage } from '../../i18n/LanguageContext';

const QUICK_REPLIES = [
  'Great progress! Keep adding 1-2 reps or micro-weight progression per compound set.',
  'For optimal muscle recovery, ensure you hit your protein target and time 40g carbs pre-workout.',
  'Please record a 5-second video clip of your squat or bench form so I can evaluate your bar path.',
  'Drink at least 3.5L of water daily and prioritize 7.5+ hours of quality sleep for CNS recovery.',
  'If you are experiencing plateau fatigue, let us schedule a light deload week with 60% intensity.',
];

export default function AdminCoachChat() {
  const theme = useTheme();
  const { t } = useLanguage();

  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'unread'

  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);

  // Load conversations list
  const loadConversations = useCallback(async (quiet = false) => {
    try {
      if (!quiet) setLoadingConversations(true);
      const data = await coachChatService.getConversations();
      setConversations(data || []);
      
      // Auto-select first conversation if none selected
      if (!selectedUserId && data && data.length > 0) {
        setSelectedUserId(data[0].userId);
      }
    } catch (err) {
      console.error('Failed to load coach conversations:', err);
      if (!quiet) setError(getApiErrorMessage(err) || 'Failed to load conversations.');
    } finally {
      if (!quiet) setLoadingConversations(false);
    }
  }, [selectedUserId]);

  // Load messages for the currently selected user
  const loadMessages = useCallback(async (userId, quiet = false) => {
    if (!userId) return;
    try {
      if (!quiet) setLoadingMessages(true);
      const data = await coachChatService.getConversationMessages(userId);
      setMessages(data || []);
    } catch (err) {
      console.error('Failed to load conversation messages:', err);
    } finally {
      if (!quiet) setLoadingMessages(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // When selected user changes, load their messages
  useEffect(() => {
    if (selectedUserId) {
      loadMessages(selectedUserId);
    }
  }, [selectedUserId, loadMessages]);

  // Real-time polling every 3.5s for live chat updates
  useEffect(() => {
    const interval = setInterval(() => {
      loadConversations(true);
      if (selectedUserId) {
        loadMessages(selectedUserId, true);
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [selectedUserId, loadConversations, loadMessages]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || !selectedUserId || sending) return;

    try {
      setSending(true);
      const newMsg = await coachChatService.sendCoachMessage(selectedUserId, textToSend.trim());
      setMessages((prev) => [...prev, newMsg]);
      if (!customText) setInputMessage('');
      
      // Refresh conversations list to update latest snippet
      loadConversations(true);
    } catch (err) {
      console.error('Failed to send coach reply:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      (c.userFullName && c.userFullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.userEmail && c.userEmail.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filterType === 'unread') {
      return matchesSearch && c.unreadCount > 0;
    }
    return matchesSearch;
  });

  const selectedConversation = conversations.find((c) => c.userId === selectedUserId);
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={2}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="h5" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800 }}>
              Coach Live Desk
            </Typography>
            {totalUnread > 0 && (
              <Chip
                label={`${totalUnread} Unread`}
                size="small"
                color="error"
                sx={{ fontWeight: 800, fontSize: '0.72rem', height: 22 }}
              />
            )}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Live athlete consultation, progressive overload feedback, and nutrition guidance.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshRounded />}
            onClick={() => {
              loadConversations();
              if (selectedUserId) loadMessages(selectedUserId);
            }}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      {/* Main Dual-Pane Card */}
      <Card
        elevation={0}
        sx={{
          flex: 1,
          display: 'flex',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3.5,
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        {/* Left Pane: Conversations List */}
        <Box
          sx={{
            width: { xs: '100%', md: 360 },
            borderRight: '1px solid',
            borderColor: 'divider',
            display: { xs: selectedUserId ? 'none' : 'flex', md: 'flex' },
            flexDirection: 'column',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
          }}
        >
          {/* Search & Filter Bar */}
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search athletes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2.5, fontSize: '0.875rem' },
              }}
            />

            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
              <Chip
                label={`All (${conversations.length})`}
                size="small"
                onClick={() => setFilterType('all')}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  bgcolor: filterType === 'all' ? 'primary.main' : 'transparent',
                  color: filterType === 'all' ? '#000' : 'text.secondary',
                  border: '1px solid',
                  borderColor: filterType === 'all' ? 'primary.main' : 'divider',
                }}
              />
              <Chip
                label={`Unread (${totalUnread})`}
                size="small"
                onClick={() => setFilterType('unread')}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  bgcolor: filterType === 'unread' ? 'error.main' : 'transparent',
                  color: filterType === 'unread' ? '#fff' : 'text.secondary',
                  border: '1px solid',
                  borderColor: filterType === 'unread' ? 'error.main' : 'divider',
                }}
              />
            </Stack>
          </Box>

          {/* Conversations List Items */}
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            {loadingConversations ? (
              <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
                <CircularProgress size={28} />
              </Stack>
            ) : filteredConversations.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <ChatBubbleOutlineRounded sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  No active conversations
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {filteredConversations.map((conv) => {
                  const isSelected = conv.userId === selectedUserId;
                  const timeFormatted = conv.lastMessageAt
                    ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '';

                  return (
                    <ListItem key={conv.userId} disablePadding sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                      <ListItemButton
                        onClick={() => setSelectedUserId(conv.userId)}
                        selected={isSelected}
                        sx={{
                          py: 1.75,
                          px: 2,
                          '&.Mui-selected': {
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(198,255,62,0.08)' : 'rgba(198,255,62,0.12)',
                            borderLeft: '4px solid #C6FF3E',
                          },
                          '&:hover': {
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Badge
                            color="error"
                            badgeContent={conv.unreadCount > 0 ? conv.unreadCount : 0}
                            overlap="circular"
                          >
                            <Avatar
                              sx={{
                                bgcolor: isSelected ? 'primary.main' : 'rgba(255,255,255,0.1)',
                                color: isSelected ? '#000' : 'text.primary',
                                fontWeight: 800,
                              }}
                            >
                              {conv.userFullName?.charAt(0) || 'A'}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle2" fontWeight={conv.unreadCount > 0 ? 800 : 600} noWrap>
                                {conv.userFullName || 'Athlete'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                {timeFormatted}
                              </Typography>
                            </Stack>
                          }
                          secondary={
                            <Stack spacing={0.5} sx={{ mt: 0.25 }}>
                              <Typography
                                variant="caption"
                                color={conv.unreadCount > 0 ? 'text.primary' : 'text.secondary'}
                                fontWeight={conv.unreadCount > 0 ? 700 : 400}
                                noWrap
                                sx={{ display: 'block', maxWidth: 220 }}
                              >
                                {conv.lastSenderRole === 'COACH' ? 'You: ' : ''}
                                {conv.lastMessage || 'No messages yet'}
                              </Typography>
                              {conv.goal && (
                                <Box>
                                  <Chip
                                    label={conv.goal.replace('_', ' ')}
                                    size="small"
                                    sx={{
                                      height: 18,
                                      fontSize: '0.62rem',
                                      fontWeight: 800,
                                      bgcolor: 'rgba(198,255,62,0.12)',
                                      color: 'primary.main',
                                    }}
                                  />
                                </Box>
                              )}
                            </Stack>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Box>
        </Box>

        {/* Right Pane: Active Live Chat */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {selectedConversation ? (
            <>
              {/* Active Conversation Header & Athlete Profile Inspector */}
              <Box
                sx={{
                  p: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  gap={1.5}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: '#C6FF3E', color: '#000', fontWeight: 800 }}>
                      {selectedConversation.userFullName?.charAt(0) || 'A'}
                    </Avatar>
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle1" fontWeight={800}>
                          {selectedConversation.userFullName || 'Athlete'}
                        </Typography>
                        <Chip
                          label="Athlete"
                          size="small"
                          sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, bgcolor: 'rgba(255,255,255,0.08)' }}
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {selectedConversation.userEmail}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Athlete Context Stats */}
                  <Stack direction="row" spacing={1.5} flexWrap="wrap">
                    {selectedConversation.goal && (
                      <Paper
                        elevation={0}
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2,
                          bgcolor: 'rgba(198,255,62,0.1)',
                          border: '1px solid rgba(198,255,62,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.75,
                        }}
                      >
                        <TrackChangesRounded sx={{ fontSize: 16, color: 'primary.main' }} />
                        <Typography variant="caption" fontWeight={700} color="primary.main">
                          Goal: {selectedConversation.goal.replace('_', ' ')}
                        </Typography>
                      </Paper>
                    )}

                    {selectedConversation.weightKg && (
                      <Paper
                        elevation={0}
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2,
                          bgcolor: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.75,
                        }}
                      >
                        <MonitorWeightRounded sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" fontWeight={700} color="text.primary">
                          {selectedConversation.weightKg} kg
                        </Typography>
                      </Paper>
                    )}
                  </Stack>
                </Stack>
              </Box>

              {/* Messages History */}
              <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {loadingMessages ? (
                  <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
                    <CircularProgress size={28} />
                  </Stack>
                ) : (
                  messages.map((msg, idx) => {
                    const isCoach = msg.senderRole === 'COACH';
                    const time = msg.createdAt
                      ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '';

                    return (
                      <Stack
                        key={msg.id || idx}
                        direction={isCoach ? 'row-reverse' : 'row'}
                        spacing={1.5}
                        alignItems="flex-start"
                      >
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: isCoach ? 'primary.main' : 'rgba(255,255,255,0.1)',
                            color: isCoach ? '#000' : 'text.primary',
                            fontWeight: 800,
                            fontSize: '0.8rem',
                          }}
                        >
                          {isCoach ? 'C' : (msg.senderName?.charAt(0) || 'U')}
                        </Avatar>

                        <Box sx={{ maxWidth: { xs: '85%', sm: '70%' } }}>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5, justifyContent: isCoach ? 'flex-end' : 'flex-start' }}>
                            <Typography variant="caption" fontWeight={700} color={isCoach ? 'primary.main' : 'text.secondary'}>
                              {isCoach ? (msg.senderName || 'GymPilot staff') : msg.senderName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                              {time}
                            </Typography>
                          </Stack>

                          <Paper
                            elevation={0}
                            sx={{
                              p: 1.75,
                              borderRadius: 3,
                              borderTopRightRadius: isCoach ? 4 : 20,
                              borderTopLeftRadius: !isCoach ? 4 : 20,
                              bgcolor: isCoach ? '#C6FF3E' : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'),
                              color: isCoach ? '#000' : 'text.primary',
                              boxShadow: isCoach ? '0 4px 14px rgba(198,255,62,0.2)' : 'none',
                            }}
                          >
                            <Typography variant="body2" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap', fontWeight: 500 }}>
                              {msg.message}
                            </Typography>
                          </Paper>
                        </Box>
                      </Stack>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Quick Coach Reply Templates */}
              <Box sx={{ px: 2, pt: 1, pb: 0.5, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ overflowX: 'auto', pb: 0.5 }}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <QuickreplyRounded fontSize="small" /> Quick:
                  </Typography>
                  {QUICK_REPLIES.map((reply, i) => (
                    <Chip
                      key={i}
                      label={reply.length > 35 ? reply.substring(0, 35) + '...' : reply}
                      size="small"
                      onClick={() => handleSendMessage(reply)}
                      sx={{
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        bgcolor: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        '&:hover': { bgcolor: 'rgba(198,255,62,0.15)', borderColor: 'primary.main' },
                      }}
                    />
                  ))}
                </Stack>
              </Box>

              {/* Message Input Box */}
              <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder={`Reply to ${selectedConversation.userFullName || 'Athlete'}... (Press Enter to send)`}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  InputProps={{
                    sx: { borderRadius: 3, pr: 1 },
                    endAdornment: (
                      <IconButton
                        color="primary"
                        onClick={() => handleSendMessage()}
                        disabled={!inputMessage.trim() || sending}
                        sx={{
                          bgcolor: inputMessage.trim() ? 'primary.main' : 'transparent',
                          color: inputMessage.trim() ? '#000 !important' : 'text.secondary',
                          '&:hover': { bgcolor: 'primary.dark' },
                        }}
                      >
                        {sending ? <CircularProgress size={18} /> : <SendRounded fontSize="small" />}
                      </IconButton>
                    ),
                  }}
                />
              </Box>
            </>
          ) : (
            <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', p: 4, textAlign: 'center' }}>
              <SportsRounded sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
              <Typography variant="h6" fontWeight={800} color="text.secondary">
                Select an Athlete to Start Coaching
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mt: 0.5 }}>
                Choose a conversation from the left pane to review inquiry history and reply to athlete questions.
              </Typography>
            </Stack>
          )}
        </Box>
      </Card>
    </Box>
  );
}
