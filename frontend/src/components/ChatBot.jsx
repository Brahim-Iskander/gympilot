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
import CardMembershipRoundedIcon from '@mui/icons-material/CardMembershipRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';

import { aiService } from '../services/aiService';
import { coachChatService } from '../services/coachChatService';
import { communityChatService } from '../services/communityChatService';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';

const ChatWindow = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: 90,
  right: 24,
  width: 410,
  height: 600,
  maxHeight: 'calc(100vh - 110px)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  borderRadius: 24,
  zIndex: 9999,
  boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(198,255,62,0.25)',
  border: 'none',
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(10,12,15,0.96)' : 'rgba(255,255,255,0.97)',
  backdropFilter: 'blur(24px)',
  [theme.breakpoints.down('sm')]: {
    width: 'calc(100% - 24px)',
    right: 12,
    height: 'calc(100vh - 95px)',
    maxHeight: 'calc(100vh - 95px)',
    bottom: 78,
    borderRadius: 20,
  },
}));

const MessageBubble = styled(Box)(({ theme, isUser, isCoach, isCommunitySelf }) => {
  let bgColor = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  let textColor = theme.palette.text.primary;
  let border = 'none';

  if (isUser) {
    bgColor = '#C6FF3E';
    textColor = '#000';
  } else if (isCommunitySelf) {
    bgColor = '#00E5FF';
    textColor = '#000';
  } else if (isCoach) {
    bgColor = theme.palette.mode === 'dark' ? 'rgba(138,124,255,0.15)' : 'rgba(138,124,255,0.12)';
    border = '1px solid rgba(138,124,255,0.3)';
  }

  return {
    padding: theme.spacing(1.25, 1.75),
    borderRadius: 16,
    maxWidth: '85%',
    wordBreak: 'break-word',
    backgroundColor: bgColor,
    color: textColor,
    border,
    borderTopRightRadius: isUser || isCommunitySelf ? 4 : 16,
    borderTopLeftRadius: !isUser && !isCommunitySelf ? 4 : 16,
    boxShadow: isUser
      ? '0 4px 12px rgba(198,255,62,0.2)'
      : isCommunitySelf
      ? '0 4px 12px rgba(0,229,255,0.25)'
      : 'none',
    fontWeight: 500,
  };
});

const COACH_QUICK_CHIPS = [
  'Form check advice',
  'Review my daily macros',
  'Plateau breakthrough tips',
  'Weekly split adjustment',
];

const COMMUNITY_QUICK_CHIPS = [
  '🔥 Hit a new PR today!',
  '💪 Who is working out now?',
  '🥗 Favorite post-workout meal?',
  '⚡ Leg day motivation!',
];

export default function ChatBot() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0 = AI Bot, 1 = Live Coach, 2 = Community Chat (Free)

  // AI Chat state
  const [aiMessages, setAiMessages] = useState([
    { role: 'ai', content: 'Hi! I am GymPilot AI. How can I help you with your workouts, nutrition, or technique today?' },
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Coach Live Chat state
  const [coachMessages, setCoachMessages] = useState([]);
  const [coachInput, setCoachInput] = useState('');
  const [isCoachSending, setIsCoachSending] = useState(false);
  const [loadingCoachMessages, setLoadingCoachMessages] = useState(false);
  const [coachUnreadCount, setCoachUnreadCount] = useState(0);

  // Community Chat state (100% Free for all users)
  const [communityMessages, setCommunityMessages] = useState([]);
  const [communityInput, setCommunityInput] = useState('');
  const [isCommunitySending, setIsCommunitySending] = useState(false);
  const [loadingCommunityMessages, setLoadingCommunityMessages] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages, coachMessages, communityMessages, isAiTyping, isOpen, activeTab]);

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

  // Load community messages (free for all)
  const loadCommunityMessages = useCallback(async (quiet = false) => {
    try {
      if (!quiet) setLoadingCommunityMessages(true);
      const msgs = await communityChatService.getMessages();
      setCommunityMessages(msgs || []);
    } catch (err) {
      console.error('Failed to load community messages:', err);
    } finally {
      if (!quiet) setLoadingCommunityMessages(false);
    }
  }, []);

  // Poll for coach messages and community messages
  useEffect(() => {
    if (isOpen && activeTab === 2) {
      loadCommunityMessages(true);
    }

    if (user && isMember) {
      loadCoachMessages(true);
    }

    const interval = setInterval(() => {
      if (isOpen && activeTab === 1 && user && isMember) {
        loadCoachMessages(true);
      } else if (isOpen && activeTab === 2) {
        loadCommunityMessages(true);
      } else if (user && isMember) {
        coachChatService.getUnreadCount()
          .then((count) => setCoachUnreadCount(count))
          .catch(() => {});
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [user, isMember, isOpen, activeTab, loadCoachMessages, loadCommunityMessages]);

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

  // Handle sending message in Community mode (Free)
  const handleSendCommunity = async (textToSend = null) => {
    const text = textToSend || communityInput;
    if (!text.trim() || isCommunitySending || !user) return;

    try {
      setIsCommunitySending(true);
      const newMsg = await communityChatService.sendMessage(text.trim());
      setCommunityMessages((prev) => [...prev, newMsg]);
      if (!textToSend) setCommunityInput('');
    } catch (err) {
      console.error('Failed to send community message:', err);
    } finally {
      setIsCommunitySending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (activeTab === 0) {
        handleSendAi();
      } else if (activeTab === 1) {
        handleSendCoach();
      } else if (activeTab === 2) {
        handleSendCommunity();
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

  const getTabColor = (tab) => {
    if (tab === 0) return '#C6FF3E';
    if (tab === 1) return '#8A7CFF';
    return '#00E5FF';
  };

  const getTabTitle = () => {
    if (activeTab === 0) return 'GymPilot AI Bot';
    if (activeTab === 1) return 'GymPilot Coaching Staff';
    return 'Athletes Community';
  };

  const getTabSubtitle = () => {
    if (activeTab === 0) return 'Instant AI Active';
    if (activeTab === 1) return 'Live Certified Coaches';
    return 'Free Public Live Chat';
  };

  return (
    <>
      <Fade in={isOpen}>
        <ChatWindow elevation={0}>
          {/* Header */}
          <Box
            sx={{
              p: 2,
              background:
                activeTab === 0
                  ? 'linear-gradient(135deg, rgba(198,255,62,0.15) 0%, rgba(0,0,0,0) 100%)'
                  : activeTab === 1
                  ? 'linear-gradient(135deg, rgba(138,124,255,0.15) 0%, rgba(0,0,0,0) 100%)'
                  : 'linear-gradient(135deg, rgba(0,229,255,0.15) 0%, rgba(0,0,0,0) 100%)',
              borderBottom: '1px solid',
              borderColor: 'rgba(255,255,255,0.08)',
              transition: 'background 0.3s ease',
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  sx={{
                    bgcolor: getTabColor(activeTab),
                    color: activeTab === 1 ? '#fff' : '#000',
                    width: 38,
                    height: 38,
                    boxShadow: `0 4px 14px ${getTabColor(activeTab)}44`,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {activeTab === 0 ? (
                    <SmartToyRoundedIcon sx={{ fontSize: 22 }} />
                  ) : activeTab === 1 ? (
                    <SportsRoundedIcon sx={{ fontSize: 22 }} />
                  ) : (
                    <GroupsRoundedIcon sx={{ fontSize: 22 }} />
                  )}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif", lineHeight: 1.2 }}>
                    {getTabTitle()}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: getTabColor(activeTab),
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
                        bgcolor: getTabColor(activeTab),
                        boxShadow: `0 0 8px ${getTabColor(activeTab)}`,
                      }}
                    />
                    {getTabSubtitle()}
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

            {/* Mode Switcher Tabs (AI Bot, Live Coach, Community Free) */}
            <Tabs
              value={activeTab}
              onChange={(e, val) => {
                setActiveTab(val);
                if (val === 1 && user) {
                  loadCoachMessages(true);
                  setCoachUnreadCount(0);
                } else if (val === 2) {
                  loadCommunityMessages(true);
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
              {/* Tab 0: AI Bot */}
              <Tab
                label={
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <SmartToyRoundedIcon sx={{ fontSize: 15 }} />
                    <span>AI Bot</span>
                  </Stack>
                }
                sx={{
                  minHeight: 32,
                  py: 0.5,
                  borderRadius: 2,
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  textTransform: 'none',
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: '#000',
                  },
                }}
              />

              {/* Tab 1: Live Coach */}
              <Tab
                label={
                  <Badge color="error" badgeContent={coachUnreadCount > 0 ? coachUnreadCount : 0}>
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ pr: coachUnreadCount > 0 ? 0.5 : 0 }}>
                      <SportsRoundedIcon sx={{ fontSize: 15 }} />
                      <span>Coach</span>
                    </Stack>
                  </Badge>
                }
                sx={{
                  minHeight: 32,
                  py: 0.5,
                  borderRadius: 2,
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  textTransform: 'none',
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    bgcolor: '#8A7CFF',
                    color: '#fff',
                  },
                }}
              />

              {/* Tab 2: Community Chat (Free) */}
              <Tab
                label={
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <GroupsRoundedIcon sx={{ fontSize: 15 }} />
                    <span>Community</span>
                    <Box
                      component="span"
                      sx={{
                        fontSize: '0.55rem',
                        fontWeight: 900,
                        bgcolor: 'rgba(0,229,255,0.2)',
                        color: '#00E5FF',
                        px: 0.5,
                        py: 0.1,
                        borderRadius: 1,
                        lineHeight: 1,
                      }}
                    >
                      FREE
                    </Box>
                  </Stack>
                }
                sx={{
                  minHeight: 32,
                  py: 0.5,
                  borderRadius: 2,
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  textTransform: 'none',
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    bgcolor: '#00E5FF',
                    color: '#000',
                  },
                }}
              />
            </Tabs>
          </Box>

          {/* ════════════════════════════════════════════════════════════════
              TAB 0: AI Bot Content
          ════════════════════════════════════════════════════════════════ */}
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

          {/* ════════════════════════════════════════════════════════════════
              TAB 1: Live Coach Content
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 1 && (
            <>
              {!user ? (
                /* Unauthenticated Lock View */
                <Box
                  sx={{
                    flex: 1,
                    overflowY: 'auto',
                    p: { xs: 2.5, sm: 3 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    background: 'linear-gradient(180deg, rgba(138,124,255,0.08) 0%, rgba(0,0,0,0) 100%)',
                  }}
                >
                  <Box sx={{ my: 'auto', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.75,
                        borderRadius: '50%',
                        bgcolor: 'rgba(138,124,255,0.15)',
                        border: '1px solid rgba(138,124,255,0.3)',
                        mb: 1.75,
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <SportsRoundedIcon sx={{ fontSize: 32, color: '#8A7CFF' }} />
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

                    <Typography variant="h6" fontWeight={800} sx={{ fontFamily: "'Sora', sans-serif", mb: 1, fontSize: '1.05rem' }}>
                      Talk 1-on-1 with a Real Coach
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.5, fontSize: '0.85rem' }}>
                      Get real-time feedback on your form, personalized progressive overload cues, and custom nutrition tweaks.
                    </Typography>

                    <Stack spacing={1.25} sx={{ width: '100%' }}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<LockRoundedIcon />}
                        onClick={handleSignInRedirect}
                        sx={{
                          bgcolor: '#8A7CFF',
                          color: '#fff',
                          fontWeight: 800,
                          py: 1.1,
                          borderRadius: 2.5,
                          boxShadow: '0 4px 16px rgba(138,124,255,0.35)',
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
                          py: 0.9,
                          borderRadius: 2.5,
                          color: 'text.primary',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.06)',
                          },
                        }}
                      >
                        Create Free Account
                      </Button>
                    </Stack>
                  </Box>
                </Box>
              ) : !isMember ? (
                /* Non-Member Lock View */
                <Box
                  sx={{
                    flex: 1,
                    overflowY: 'auto',
                    p: { xs: 2.5, sm: 3 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    background: 'linear-gradient(180deg, rgba(255,152,0,0.1) 0%, rgba(0,0,0,0) 100%)',
                  }}
                >
                  <Box sx={{ my: 'auto', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.75,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,152,0,0.15)',
                        border: '1px solid rgba(255,152,0,0.3)',
                        mb: 1.5,
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <LockRoundedIcon sx={{ fontSize: 32, color: '#FF9800' }} />
                    </Paper>

                    <Chip
                      label="Active Membership Required"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255,152,0,0.15)',
                        color: '#FF9800',
                        fontWeight: 800,
                        fontSize: '0.7rem',
                        mb: 1.25,
                        border: '1px solid rgba(255,152,0,0.3)',
                      }}
                    />

                    <Typography variant="h6" fontWeight={800} sx={{ fontFamily: "'Sora', sans-serif", mb: 0.75, fontSize: '1.05rem' }}>
                      Live Coach Chat is Gated
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.45, fontSize: '0.82rem' }}>
                      1-on-1 live chat with certified coaches is available for <strong>Basic</strong> & <strong>Premium</strong> members. Non-members can use our AI Bot or Community Chat for free!
                    </Typography>

                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        width: '100%',
                        bgcolor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 2.5,
                        mb: 2,
                        textAlign: 'left',
                      }}
                    >
                      <Typography variant="caption" color="#FF9800" fontWeight={800} display="block" sx={{ mb: 1, fontSize: '0.68rem', letterSpacing: 0.5 }}>
                        YOUR SUPPORT ACCESS:
                      </Typography>
                      <Stack spacing={0.75}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CheckCircleRoundedIcon sx={{ fontSize: 16, color: '#C6FF3E' }} />
                          <Typography variant="body2" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: '0.8rem' }}>
                            <SmartToyRoundedIcon sx={{ fontSize: 15, color: '#C6FF3E' }} />
                            GymPilot AI Assistant (Free)
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CheckCircleRoundedIcon sx={{ fontSize: 16, color: '#00E5FF' }} />
                          <Typography variant="body2" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: '0.8rem' }}>
                            <GroupsRoundedIcon sx={{ fontSize: 15, color: '#00E5FF' }} />
                            Athletes Community Chat (Free)
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LockRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: '0.8rem' }}>
                            <SportsRoundedIcon sx={{ fontSize: 15, color: '#8A7CFF' }} />
                            1-on-1 Certified Coach Access (Member Only)
                          </Typography>
                        </Stack>
                      </Stack>
                    </Paper>

                    <Stack spacing={1} sx={{ width: '100%' }}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<CardMembershipRoundedIcon />}
                        onClick={() => {
                          setIsOpen(false);
                          navigate('/membership');
                        }}
                        sx={{
                          bgcolor: '#FF9800',
                          color: '#000',
                          fontWeight: 800,
                          py: 1.1,
                          borderRadius: 2.5,
                          boxShadow: '0 4px 16px rgba(255,152,0,0.3)',
                          '&:hover': { bgcolor: '#f57c00' },
                        }}
                      >
                        Explore Membership Plans
                      </Button>

                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<GroupsRoundedIcon />}
                        onClick={() => setActiveTab(2)}
                        sx={{
                          borderColor: 'rgba(0,229,255,0.4)',
                          color: '#00E5FF',
                          fontWeight: 700,
                          py: 0.9,
                          borderRadius: 2.5,
                          '&:hover': {
                            borderColor: '#00E5FF',
                            bgcolor: 'rgba(0,229,255,0.08)',
                          },
                        }}
                      >
                        Open Free Community Chat
                      </Button>
                    </Stack>
                  </Box>
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
                              src={isUser ? user?.avatar : undefined}
                              sx={{
                                width: 28,
                                height: 28,
                                bgcolor: isUser ? 'rgba(255,255,255,0.1)' : '#8A7CFF',
                                color: isUser ? 'text.primary' : '#fff',
                                fontWeight: 800,
                                fontSize: '0.75rem',
                              }}
                            >
                              {isUser ? (user?.firstName?.charAt(0) || <PersonRoundedIcon sx={{ fontSize: 16 }} />) : 'C'}
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

          {/* ════════════════════════════════════════════════════════════════
              TAB 2: Community Chat (100% Free for all Users)
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 2 && (
            <>
              {/* Community Messages Area */}
              <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {loadingCommunityMessages ? (
                  <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
                    <CircularProgress size={24} sx={{ color: '#00E5FF' }} />
                  </Stack>
                ) : communityMessages.length === 0 ? (
                  <Box sx={{ my: 'auto', textAlign: 'center', p: 3 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: '50%',
                        bgcolor: 'rgba(0,229,255,0.12)',
                        border: '1px solid rgba(0,229,255,0.25)',
                        mb: 1.5,
                        display: 'inline-grid',
                        placeItems: 'center',
                      }}
                    >
                      <GroupsRoundedIcon sx={{ fontSize: 32, color: '#00E5FF' }} />
                    </Paper>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ fontFamily: "'Sora', sans-serif", mb: 0.5 }}>
                      Welcome to the Community Lounge!
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Be the first athlete to share a tip, question, or workout milestone.
                    </Typography>
                  </Box>
                ) : (
                  communityMessages.map((msg, idx) => {
                    const isSelf = user && (msg.userId === user.id || msg.userEmail?.toLowerCase() === user.email?.toLowerCase());
                    const time = msg.createdAt
                      ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '';
                    const isAdminUser = msg.userRole === 'ADMIN';
                    const isCoachUser = msg.userRole === 'COACH';

                    return (
                      <Stack
                        key={msg.id || idx}
                        direction={isSelf ? 'row-reverse' : 'row'}
                        spacing={1.25}
                        alignItems="flex-start"
                      >
                        <Avatar
                          src={msg.userAvatar}
                          sx={{
                            width: 30,
                            height: 30,
                            bgcolor: isSelf
                              ? '#00E5FF'
                              : isAdminUser
                              ? '#FF5252'
                              : isCoachUser
                              ? '#8A7CFF'
                              : 'rgba(255,255,255,0.1)',
                            color: isSelf ? '#000' : '#fff',
                            fontWeight: 800,
                            fontSize: '0.72rem',
                          }}
                        >
                          {msg.userFullName?.charAt(0)?.toUpperCase() || <PersonRoundedIcon sx={{ fontSize: 16 }} />}
                        </Avatar>

                        <Box sx={{ maxWidth: '82%' }}>
                          {!isSelf && (
                            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.25 }}>
                              <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.72rem', color: 'text.primary' }}>
                                {msg.userFullName || 'Athlete'}
                              </Typography>
                              {isAdminUser && (
                                <Chip
                                  label="ADMIN"
                                  size="small"
                                  sx={{
                                    height: 16,
                                    fontSize: '0.55rem',
                                    fontWeight: 900,
                                    bgcolor: 'rgba(255,82,82,0.15)',
                                    color: '#FF5252',
                                    border: '1px solid rgba(255,82,82,0.3)',
                                  }}
                                />
                              )}
                              {isCoachUser && (
                                <Chip
                                  label="COACH"
                                  size="small"
                                  sx={{
                                    height: 16,
                                    fontSize: '0.55rem',
                                    fontWeight: 900,
                                    bgcolor: 'rgba(138,124,255,0.15)',
                                    color: '#8A7CFF',
                                    border: '1px solid rgba(138,124,255,0.3)',
                                  }}
                                />
                              )}
                            </Stack>
                          )}
                          <MessageBubble isUser={false} isCommunitySelf={isSelf}>
                            <Typography variant="body2" sx={{ lineHeight: 1.45, whiteSpace: 'pre-wrap', fontSize: '0.84rem' }}>
                              {msg.message}
                            </Typography>
                          </MessageBubble>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mt: 0.25, fontSize: '0.65rem', textAlign: isSelf ? 'right' : 'left' }}
                          >
                            {time}
                          </Typography>
                        </Box>
                      </Stack>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Quick Community Prompts */}
              {user && (
                <Box sx={{ px: 2, pt: 1, pb: 0.5, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Stack direction="row" spacing={0.75} sx={{ overflowX: 'auto', pb: 0.5 }}>
                    {COMMUNITY_QUICK_CHIPS.map((chip, i) => (
                      <Chip
                        key={i}
                        label={chip}
                        size="small"
                        onClick={() => handleSendCommunity(chip)}
                        sx={{
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          bgcolor: 'rgba(0,229,255,0.08)',
                          color: '#00E5FF',
                          border: '1px solid rgba(0,229,255,0.2)',
                          '&:hover': { bgcolor: 'rgba(0,229,255,0.18)' },
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Community Input Area */}
              {user ? (
                <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={3}
                    placeholder="Share with all athletes (Free)..."
                    value={communityInput}
                    onChange={(e) => setCommunityInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    InputProps={{
                      sx: { borderRadius: 3, pr: 1, py: 1 },
                      endAdornment: (
                        <IconButton
                          color="primary"
                          onClick={() => handleSendCommunity()}
                          disabled={!communityInput.trim() || isCommunitySending}
                          sx={{
                            bgcolor: communityInput.trim() ? '#00E5FF' : 'transparent',
                            color: communityInput.trim() ? '#000 !important' : 'text.secondary',
                            '&:hover': { bgcolor: '#00b4d8' },
                            width: 32,
                            height: 32,
                          }}
                        >
                          {isCommunitySending ? <CircularProgress size={14} sx={{ color: '#000' }} /> : <SendRoundedIcon sx={{ fontSize: 16 }} />}
                        </IconButton>
                      ),
                    }}
                  />
                </Box>
              ) : (
                <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center', bgcolor: 'rgba(0,229,255,0.04)' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Sign in to chat in the free community lounge.
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleSignInRedirect}
                    sx={{
                      bgcolor: '#00E5FF',
                      color: '#000',
                      fontWeight: 800,
                      borderRadius: 2,
                      px: 2.5,
                      '&:hover': { bgcolor: '#00b4d8' },
                    }}
                  >
                    Sign In to Chat
                  </Button>
                </Box>
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
