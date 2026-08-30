import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Fab,
  Paper,
  Typography,
  Stack,
  TextField,
  IconButton,
  Avatar,
  Fade,
  styled,
  CircularProgress,
  Tabs,
  Tab,
  Button,
  Chip,
  Badge,
  useTheme,
} from '@mui/material';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SportsRoundedIcon from '@mui/icons-material/SportsRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

import { aiService } from '../services/aiService';
import { coachChatService } from '../services/coachChatService';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';

const ChatWindow = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: 90,
  right: 24,
  width: 380,
  height: 560,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  borderRadius: 24,
  zIndex: 9999,
  boxShadow: '0 24px 60px rgba(0,0,0,0.45), 0 0 0 1px rgba(198,255,62,0.25)',
  border: 'none',
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(10,12,15,0.95)' : 'rgba(255,255,255,0.96)',
  backdropFilter: 'blur(24px)',
  [theme.breakpoints.down('sm')]: {
    width: 'calc(100% - 32px)',
    right: 16,
    height: '70vh',
    bottom: 85,
  },
}));

const MessageBubble = styled(Box)(({ theme, isUser, isCoach }) => ({
  padding: theme.spacing(1.5, 2),
  borderRadius: 16,
  maxWidth: '85%',
  wordBreak: 'break-word',
  backgroundColor: isUser
    ? '#C6FF3E'
    : isCoach
    ? (theme.palette.mode === 'dark' ? 'rgba(138,124,255,0.15)' : 'rgba(138,124,255,0.12)')
    : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
  color: isUser ? '#000' : theme.palette.text.primary,
  border: isCoach ? '1px solid rgba(138,124,255,0.3)' : 'none',
  borderTopRightRadius: isUser ? 4 : 16,
  borderTopLeftRadius: !isUser ? 4 : 16,
  boxShadow: isUser ? '0 4px 12px rgba(198,255,62,0.2)' : 'none',
  fontWeight: 500,
}));

const COACH_QUICK_CHIPS = [
  'Form check advice',
  'Review my daily macros',
  'Plateau breakthrough tips',
  'Weekly split adjustment',
];

export default function ChatBot() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0 = AI Bot, 1 = Live Coach

  // AI Chat state
  const [aiMessages, setAiMessages] = useState([
    { role: 'ai', content: 'Hi! I am GymPilot AI. How can I help you with your workouts, nutrition, or technique today?' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Coach Live Chat state
  const [coachMessages, setCoachMessages] = useState([]);
  const [coachInput, setCoachInput] = useState('');
  const [isCoachSending, setIsCoachSending] = useState(false);
  const [loadingCoachMessages, setLoadingCoachMessages] = useState(false);
  const [coachUnreadCount, setCoachUnreadCount] = useState(0);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages, coachMessages, isAiTyping, isOpen, activeTab]);

  const isMember = Boolean(
    user?.hasActiveMembership ||
    (user?.membershipStatus === 'ACTIVE' && user?.membershipTier && user?.membershipTier !== 'FREE')
  );

  // Load coach messages when user is logged in AND is an active member
  const loadCoachMessages = useCallback(async (quiet = false) => {
    if (!user || !isMember) return;
    try {
      if (!quiet) setLoadingCoachMessages(true);
      const msgs = await coachChatService.getMessages();
      setCoachMessages(msgs || []);
    } catch (err) {
      console.error('Failed to load coach messages:', err);
    } finally {
      if (!quiet) setLoadingCoachMessages(false);
    }
  }, [user, isMember]);

  // Poll for coach messages and unread counts
  useEffect(() => {
    if (!user || !isMember) return;

    loadCoachMessages(true);

    const interval = setInterval(() => {
      if (isOpen && activeTab === 1) {
        loadCoachMessages(true);
      } else {
        coachChatService.getUnreadCount()
          .then((count) => setCoachUnreadCount(count))
          .catch(() => {});
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [user, isMember, isOpen, activeTab, loadCoachMessages]);

  // Handle sending message in AI mode
  const handleSendAi = async () => {
    if (!aiInput.trim()) return;

    const userMessage = { role: 'user', content: aiInput.trim() };
    setAiMessages((prev) => [...prev, userMessage]);
    setAiInput('');
    setIsAiTyping(true);

    try {
      const aiResponseText = await aiService.chat(userMessage.content);
      setAiMessages((prev) => [...prev, { role: 'ai', content: aiResponseText }]);
    } catch (error) {
      setAiMessages((prev) => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Handle sending message in Coach mode
  const handleSendCoach = async (textToSend = null) => {
    const text = textToSend || coachInput;
    if (!text.trim() || isCoachSending || !user) return;

    try {
      setIsCoachSending(true);
      const newMsg = await coachChatService.sendMessage(text.trim());
      setCoachMessages((prev) => [...prev, newMsg]);
      if (!textToSend) setCoachInput('');
    } catch (err) {
      console.error('Failed to send message to coach:', err);
    } finally {
      setIsCoachSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (activeTab === 0) {
        handleSendAi();
      } else {
        handleSendCoach();
      }
    }
  };

  const handleSignInRedirect = () => {
    setIsOpen(false);
    navigate('/login');
  };

  const handleRegisterRedirect = () => {
    setIsOpen(false);
    navigate('/register');
  };

  return (
    <>
      <Fade in={isOpen}>
        <ChatWindow elevation={0}>
          {/* Header */}
          <Box
            sx={{
              p: 2,
              background: 'linear-gradient(135deg, rgba(198,255,62,0.15) 0%, rgba(138,124,255,0.08) 100%)',
              borderBottom: '1px solid',
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  sx={{
                    bgcolor: activeTab === 0 ? '#C6FF3E' : '#8A7CFF',
                    color: activeTab === 0 ? '#000' : '#fff',
                    width: 38,
                    height: 38,
                    boxShadow: activeTab === 0 ? '0 4px 12px rgba(198,255,62,0.4)' : '0 4px 12px rgba(138,124,255,0.4)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {activeTab === 0 ? <SmartToyRoundedIcon sx={{ fontSize: 22 }} /> : <SportsRoundedIcon sx={{ fontSize: 22 }} />}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif", lineHeight: 1.2 }}>
                    {activeTab === 0 ? 'GymPilot AI Bot' : 'GymPilot staff'}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: activeTab === 0 ? '#C6FF3E' : '#8A7CFF',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: activeTab === 0 ? '#C6FF3E' : '#8A7CFF',
                        boxShadow: activeTab === 0 ? '0 0 8px #C6FF3E' : '0 0 8px #8A7CFF',
                      }}
                    />
                    {activeTab === 0 ? 'Instant AI Active' : 'Live Certified Coaches'}
                  </Typography>
                </Box>
              </Stack>
              <IconButton
                size="small"
                onClick={() => setIsOpen(false)}
                sx={{ bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>

            {/* Mode Switcher Tabs */}
            <Tabs
              value={activeTab}
              onChange={(e, val) => {
                setActiveTab(val);
                if (val === 1 && user) {
                  loadCoachMessages(true);
                  setCoachUnreadCount(0);
                }
              }}
              variant="fullWidth"
              sx={{
                minHeight: 36,
                bgcolor: 'rgba(255,255,255,0.05)',
                borderRadius: 2.5,
                p: 0.5,
                '& .MuiTabs-indicator': {
                  display: 'none',
                },
              }}
            >
              <Tab
                label={
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <SmartToyRoundedIcon sx={{ fontSize: 16 }} />
                    <span>AI Assistant</span>
                  </Stack>
                }
                sx={{
                  minHeight: 32,
                  py: 0.5,
                  borderRadius: 2,
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: '#000',
                  },
                }}
              />
              <Tab
                label={
                  <Badge color="error" badgeContent={coachUnreadCount > 0 ? coachUnreadCount : 0}>
                    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ pr: coachUnreadCount > 0 ? 1 : 0 }}>
                      <SportsRoundedIcon sx={{ fontSize: 16 }} />
                      <span>Live Coach</span>
                    </Stack>
                  </Badge>
                }
                sx={{
                  minHeight: 32,
                  py: 0.5,
                  borderRadius: 2,
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    bgcolor: '#8A7CFF',
                    color: '#fff',
                  },
                }}
              />
            </Tabs>
          </Box>

          {/* Tab 0: AI Bot Content */}
          {activeTab === 0 && (
            <>
              {/* Messages Area */}
              <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {aiMessages.map((msg, idx) => (
                  <Stack key={idx} direction={msg.role === 'user' ? 'row-reverse' : 'row'} spacing={1.5} alignItems="flex-start">
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        bgcolor: msg.role === 'user' ? 'rgba(255,255,255,0.1)' : 'transparent',
                        border: msg.role === 'ai' ? '1px solid rgba(198,255,62,0.5)' : 'none',
                      }}
                    >
                      {msg.role === 'user' ? <PersonRoundedIcon sx={{ fontSize: 16 }} /> : <SmartToyRoundedIcon sx={{ fontSize: 16, color: '#C6FF3E' }} />}
                    </Avatar>
                    <MessageBubble isUser={msg.role === 'user'}>
                      <Typography variant="body2" sx={{ lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                        {msg.content.split(/(https?:\/\/[^\s]+)/g).map((part, i) => {
                          if (part.match(/^https?:\/\/[^\s]+$/)) {
                            return (
                              <Box key={i} component="span" sx={{ display: 'inline-block', my: 0.5 }}>
                                <a
                                  href={part}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: msg.role === 'user' ? '#000' : '#C6FF3E',
                                    fontWeight: 700,
                                    textDecoration: 'underline',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                >
                                  {part.includes('youtube') ? '▶ Watch Tutorial on YouTube' : part}
                                </a>
                              </Box>
                            );
                          }
                          return part;
                        })}
                      </Typography>
                    </MessageBubble>
                  </Stack>
                ))}
                {isAiTyping && (
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Avatar sx={{ width: 28, height: 28, bgcolor: 'transparent', border: '1px solid rgba(198,255,62,0.5)' }}>
                      <SmartToyRoundedIcon sx={{ fontSize: 16, color: '#C6FF3E' }} />
                    </Avatar>
                    <MessageBubble isUser={false}>
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ height: 20 }}>
                        <CircularProgress size={12} sx={{ color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>Typing response...</Typography>
                      </Stack>
                    </MessageBubble>
                  </Stack>
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* AI Input Area */}
              <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  placeholder="Ask AI anything about workouts or diet..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  InputProps={{
                    sx: { borderRadius: 3, pr: 1, py: 1 },
                    endAdornment: (
                      <IconButton
                        color="primary"
                        onClick={handleSendAi}
                        disabled={!aiInput.trim() || isAiTyping}
                        sx={{
                          bgcolor: aiInput.trim() ? 'primary.main' : 'transparent',
                          color: aiInput.trim() ? '#000 !important' : 'text.secondary',
                          '&:hover': { bgcolor: 'primary.dark' },
                          width: 32,
                          height: 32,
                        }}
                      >
                        <SendRoundedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    ),
                  }}
                />
              </Box>
            </>
          )}

          {/* Tab 1: Live Coach Content */}
          {activeTab === 1 && (
            <>
              {!user ? (
                /* Unauthenticated Lock View */
                <Box
                  sx={{
                    flex: 1,
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    background: 'linear-gradient(180deg, rgba(138,124,255,0.06) 0%, rgba(0,0,0,0) 100%)',
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: '50%',
                      bgcolor: 'rgba(138,124,255,0.15)',
                      border: '1px solid rgba(138,124,255,0.3)',
                      mb: 2,
                    }}
                  >
                    <SportsRoundedIcon sx={{ fontSize: 36, color: '#8A7CFF' }} />
                  </Paper>

                  <Chip
                    label="Certified Coaching Support"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(138,124,255,0.15)',
                      color: '#8A7CFF',
                      fontWeight: 800,
                      fontSize: '0.7rem',
                      mb: 1.5,
                      border: '1px solid rgba(138,124,255,0.3)',
                    }}
                  />

                  <Typography variant="h6" fontWeight={800} sx={{ fontFamily: "'Sora', sans-serif", mb: 1 }}>
                    Talk 1-on-1 with a Real Coach
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.5 }}>
                    Get real-time feedback on your form, personalized progressive overload cues, and custom nutrition macro tweaks.
                  </Typography>

                  <Stack spacing={1.5} sx={{ width: '100%' }}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<LockRoundedIcon />}
                      onClick={handleSignInRedirect}
                      sx={{
                        bgcolor: '#8A7CFF',
                        color: '#fff',
                        fontWeight: 800,
                        py: 1.25,
                        borderRadius: 3,
                        '&:hover': { bgcolor: '#7362ff' },
                      }}
                    >
                      Sign In to Chat with Coach
                    </Button>

                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={handleRegisterRedirect}
                      sx={{
                        borderColor: 'rgba(255,255,255,0.15)',
                        fontWeight: 700,
                        py: 1,
                        borderRadius: 3,
                      }}
                    >
                      Create Free Account
                    </Button>
                  </Stack>
                </Box>
              ) : !isMember ? (
                /* Non-Member Lock View */
                <Box
                  sx={{
                    flex: 1,
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    overflowY: 'auto',
                    background: 'linear-gradient(180deg, rgba(255,152,0,0.08) 0%, rgba(0,0,0,0) 100%)',
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255,152,0,0.15)',
                      border: '1px solid rgba(255,152,0,0.3)',
                      mb: 2,
                    }}
                  >
                    <LockRoundedIcon sx={{ fontSize: 36, color: '#FF9800' }} />
                  </Paper>

                  <Chip
                    label="Active Membership Required"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,152,0,0.15)',
                      color: '#FF9800',
                      fontWeight: 800,
                      fontSize: '0.7rem',
                      mb: 1.5,
                      border: '1px solid rgba(255,152,0,0.3)',
                    }}
                  />

                  <Typography variant="h6" fontWeight={800} sx={{ fontFamily: "'Sora', sans-serif", mb: 1 }}>
                    Live Coach Chat is Gated
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.5 }}>
                    1-on-1 live chat with certified coaches is available for <strong>Basic</strong> & <strong>Premium</strong> members. Non-members can use our AI Support Bot anytime!
                  </Typography>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      width: '100%',
                      bgcolor: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 3,
                      mb: 3,
                      textAlign: 'left',
                    }}
                  >
                    <Typography variant="caption" color="#FF9800" fontWeight={800} display="block" sx={{ mb: 1 }}>
                      YOUR SUPPORT ACCESS:
                    </Typography>
                    <Stack spacing={1}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CheckCircleRoundedIcon sx={{ fontSize: 16, color: '#C6FF3E' }} />
                        <Typography variant="body2" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <SmartToyRoundedIcon sx={{ fontSize: 16, color: '#C6FF3E' }} />
                          GymPilot AI Assistant (Included)
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LockRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <SportsRoundedIcon sx={{ fontSize: 16, color: '#8A7CFF' }} />
                          1-on-1 Certified Coach Access (Member Only)
                        </Typography>
                      </Stack>
                    </Stack>
                  </Paper>

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => setActiveTab(0)}
                    sx={{
                      bgcolor: '#C6FF3E',
                      color: '#000',
                      fontWeight: 800,
                      py: 1.25,
                      borderRadius: 3,
                      '&:hover': { bgcolor: '#b3f520' },
                    }}
                  >
                    Use AI Support Assistant
                  </Button>
                </Box>
              ) : (
                /* Authenticated Member Live Coach Chat */
                <>
                  <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {loadingCoachMessages ? (
                      <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
                        <CircularProgress size={24} sx={{ color: '#8A7CFF' }} />
                      </Stack>
                    ) : (
                      coachMessages.map((msg, idx) => {
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
                                width: 28,
                                height: 28,
                                bgcolor: isUser ? 'rgba(255,255,255,0.1)' : '#8A7CFF',
                                color: isUser ? 'text.primary' : '#fff',
                                fontWeight: 800,
                                fontSize: '0.75rem',
                              }}
                            >
                              {isUser ? <PersonRoundedIcon sx={{ fontSize: 16 }} /> : 'C'}
                            </Avatar>

                            <Box sx={{ maxWidth: '85%' }}>
                              {!isUser && (
                                <Typography variant="caption" color="#8A7CFF" fontWeight={800} sx={{ display: 'block', mb: 0.25, fontSize: '0.68rem' }}>
                                  {msg.senderName || 'GymPilot staff'}
                                </Typography>
                              )}
                              <MessageBubble isUser={isUser} isCoach={!isUser}>
                                <Typography variant="body2" sx={{ lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                                  {msg.message}
                                </Typography>
                              </MessageBubble>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25, fontSize: '0.65rem', textAlign: isUser ? 'right' : 'left' }}>
                                {time}
                              </Typography>
                            </Box>
                          </Stack>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </Box>

                  {/* Coach Quick Chips */}
                  <Box sx={{ px: 2, pt: 1, pb: 0.5, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" spacing={0.75} sx={{ overflowX: 'auto', pb: 0.5 }}>
                      {COACH_QUICK_CHIPS.map((chip, i) => (
                        <Chip
                          key={i}
                          label={chip}
                          size="small"
                          onClick={() => handleSendCoach(chip)}
                          sx={{
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            bgcolor: 'rgba(138,124,255,0.1)',
                            color: '#8A7CFF',
                            border: '1px solid rgba(138,124,255,0.2)',
                            '&:hover': { bgcolor: 'rgba(138,124,255,0.2)' },
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>

                  {/* Coach Input Area */}
                  <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <TextField
                      fullWidth
                      multiline
                      maxRows={3}
                      placeholder="Ask coach about form, macros, plateaus..."
                      value={coachInput}
                      onChange={(e) => setCoachInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      InputProps={{
                        sx: { borderRadius: 3, pr: 1, py: 1 },
                        endAdornment: (
                          <IconButton
                            color="primary"
                            onClick={() => handleSendCoach()}
                            disabled={!coachInput.trim() || isCoachSending}
                            sx={{
                              bgcolor: coachInput.trim() ? '#8A7CFF' : 'transparent',
                              color: coachInput.trim() ? '#fff !important' : 'text.secondary',
                              '&:hover': { bgcolor: '#7362ff' },
                              width: 32,
                              height: 32,
                            }}
                          >
                            {isCoachSending ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <SendRoundedIcon sx={{ fontSize: 16 }} />}
                          </IconButton>
                        ),
                      }}
                    />
                  </Box>
                </>
              )}
            </>
          )}
        </ChatWindow>
      </Fade>

      {/* Floating Action Button */}
      <Fab
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          background: 'linear-gradient(135deg, #C6FF3E 0%, #A2E01F 100%)',
          boxShadow: '0 8px 32px rgba(198,255,62,0.5)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          width: 64,
          height: 64,
          '&:hover': {
            transform: 'scale(1.1) translateY(-4px)',
            boxShadow: '0 12px 40px rgba(198,255,62,0.6)',
            background: 'linear-gradient(135deg, #D4FF66 0%, #B3F520 100%)',
          },
          '@keyframes pulse': {
            '0%': { boxShadow: '0 0 0 0 rgba(198,255,62, 0.6)' },
            '70%': { boxShadow: '0 0 0 20px rgba(198,255,62, 0)' },
            '100%': { boxShadow: '0 0 0 0 rgba(198,255,62, 0)' },
          },
          animation: !isOpen ? 'pulse 2.5s infinite' : 'none',
        }}
      >
        <Badge color="error" badgeContent={coachUnreadCount > 0 ? coachUnreadCount : 0}>
          {isOpen ? (
            <CloseRoundedIcon sx={{ color: '#000', fontSize: 28 }} />
          ) : (
            <ChatBubbleOutlineRoundedIcon sx={{ color: '#000', fontSize: 28 }} />
          )}
        </Badge>
      </Fab>
    </>
  );
}
