import { useState, useRef, useEffect } from 'react';
import SEO from '../../components/SEO';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  SendRounded,
  EmailRounded,
  PeopleRounded,
  PersonRounded,
  CodeRounded,
  SubjectRounded,
  PreviewRounded,
  WarningAmberRounded,
} from '@mui/icons-material';

import { adminService } from '../../services/adminService';

export default function AdminMail() {
  // Form state
  const [target, setTarget] = useState('all'); // 'all' | 'specific'
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [format, setFormat] = useState('html'); // 'html' | 'text'
  const [body, setBody] = useState('');

  // UI state
  const [sending, setSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // HTML preview iframe ref
  const iframeRef = useRef(null);

  // Update iframe preview when body changes in HTML mode
  useEffect(() => {
    if (format === 'html' && iframeRef.current) {
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(body || '<p style="color:#64748B;font-family:sans-serif;text-align:center;padding:40px;">HTML preview will appear here...</p>');
        doc.close();
      }
    }
  }, [body, format]);

  const isValid = () => {
    if (!subject.trim()) return false;
    if (!body.trim()) return false;
    if (target === 'specific' && !recipientEmail.trim()) return false;
    return true;
  };

  const handleSend = async () => {
    setConfirmOpen(false);
    setSending(true);

    try {
      const result = await adminService.sendMail({
        subject: subject.trim(),
        body: body,
        isHtml: format === 'html',
        recipientEmail: target === 'specific' ? recipientEmail.trim() : null,
      });

      setSnackbar({
        open: true,
        message: result.message || `Email queued for ${result.recipientCount} recipient(s)`,
        severity: 'success',
      });

      // Reset form
      setSubject('');
      setBody('');
      setRecipientEmail('');
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Failed to send email. Please try again.',
        severity: 'error',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Container maxWidth="xl" disableGutters>
      <SEO
        title="Bulk Mail — Admin"
        description="Send emails to all users or specific recipients from the GymPilot admin panel."
        path="/admin/mail"
        noIndex
      />

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <EmailRounded sx={{ color: '#C6FF3E', fontSize: 32 }} />
              <Typography variant="h4" fontWeight={800}>
                Mail Center
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Compose and send emails to all users or specific recipients
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* ─── Compose Panel ─── */}
        <Grid item xs={12} lg={format === 'html' ? 7 : 12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              height: '100%',
            }}
          >
            {/* Target Selector */}
            <Stack spacing={3}>
              <Box>
                <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mb: 1.5, display: 'block', letterSpacing: 1 }}>
                  Recipients
                </Typography>
                <ToggleButtonGroup
                  value={target}
                  exclusive
                  onChange={(_, val) => val && setTarget(val)}
                  fullWidth
                  sx={{
                    '& .MuiToggleButton-root': {
                      textTransform: 'none',
                      fontWeight: 700,
                      py: 1.5,
                      borderRadius: '10px !important',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&.Mui-selected': {
                        bgcolor: 'rgba(198,255,62,0.12)',
                        color: '#C6FF3E',
                        borderColor: 'rgba(198,255,62,0.4)',
                        '&:hover': { bgcolor: 'rgba(198,255,62,0.18)' },
                      },
                    },
                  }}
                >
                  <ToggleButton value="all">
                    <PeopleRounded sx={{ mr: 1, fontSize: 20 }} />
                    All Users (Bulk)
                  </ToggleButton>
                  <ToggleButton value="specific">
                    <PersonRounded sx={{ mr: 1, fontSize: 20 }} />
                    Specific User
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Recipient Email (specific mode) */}
              {target === 'specific' && (
                <TextField
                  fullWidth
                  label="Recipient Email Address"
                  placeholder="user@example.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  type="email"
                  required
                  InputProps={{
                    sx: { borderRadius: 2.5 },
                  }}
                />
              )}

              {/* Subject */}
              <TextField
                fullWidth
                label="Subject"
                placeholder="Enter email subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                InputProps={{
                  startAdornment: <SubjectRounded sx={{ mr: 1, color: 'text.disabled', fontSize: 20 }} />,
                  sx: { borderRadius: 2.5 },
                }}
              />

              {/* Format Toggle */}
              <Box>
                <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mb: 1.5, display: 'block', letterSpacing: 1 }}>
                  Content Format
                </Typography>
                <ToggleButtonGroup
                  value={format}
                  exclusive
                  onChange={(_, val) => val && setFormat(val)}
                  size="small"
                  sx={{
                    '& .MuiToggleButton-root': {
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 2,
                      py: 0.8,
                      '&.Mui-selected': {
                        bgcolor: 'rgba(138,124,255,0.15)',
                        color: '#8A7CFF',
                        borderColor: 'rgba(138,124,255,0.4)',
                      },
                    },
                  }}
                >
                  <ToggleButton value="html">
                    <CodeRounded sx={{ mr: 0.8, fontSize: 18 }} />
                    HTML
                  </ToggleButton>
                  <ToggleButton value="text">
                    <SubjectRounded sx={{ mr: 0.8, fontSize: 18 }} />
                    Plain Text
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Body */}
              <TextField
                fullWidth
                label={format === 'html' ? 'HTML Body' : 'Message Body'}
                placeholder={
                  format === 'html'
                    ? '<h1>Hello!</h1>\n<p>Your HTML email content here...</p>'
                    : 'Type your message here...'
                }
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                multiline
                minRows={12}
                maxRows={24}
                InputProps={{
                  sx: {
                    borderRadius: 2.5,
                    fontFamily: format === 'html' ? '"JetBrains Mono", "Fira Code", "Consolas", monospace' : 'inherit',
                    fontSize: format === 'html' ? '0.85rem' : '0.95rem',
                    lineHeight: 1.7,
                  },
                }}
              />

              {/* Bulk warning */}
              {target === 'all' && (
                <Alert
                  severity="warning"
                  icon={<WarningAmberRounded />}
                  sx={{
                    borderRadius: 2.5,
                    bgcolor: 'rgba(255,184,0,0.08)',
                    border: '1px solid rgba(255,184,0,0.25)',
                    '& .MuiAlert-icon': { color: '#FFB800' },
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    This will send an email to <strong>all active users</strong> on the platform. Please review your content carefully before sending.
                  </Typography>
                </Alert>
              )}

              {/* Send Button */}
              <Button
                variant="contained"
                size="large"
                startIcon={sending ? <CircularProgress size={20} color="inherit" /> : <SendRounded />}
                onClick={() => setConfirmOpen(true)}
                disabled={!isValid() || sending}
                sx={{
                  borderRadius: 2.5,
                  py: 1.5,
                  fontWeight: 800,
                  fontSize: '1rem',
                  textTransform: 'none',
                  bgcolor: '#C6FF3E',
                  color: '#0A0C0F',
                  '&:hover': { bgcolor: '#B8F035' },
                  '&.Mui-disabled': { bgcolor: 'rgba(198,255,62,0.2)', color: 'rgba(10,12,15,0.5)' },
                }}
              >
                {sending ? 'Sending...' : target === 'all' ? 'Send to All Users' : 'Send Email'}
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* ─── HTML Preview Panel ─── */}
        {format === 'html' && (
          <Grid item xs={12} lg={5}>
            <Paper
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Preview Header */}
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  px: 3,
                  py: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <PreviewRounded sx={{ color: '#8A7CFF', fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                  Live Preview
                </Typography>
                <Chip
                  label="HTML"
                  size="small"
                  sx={{
                    ml: 'auto',
                    bgcolor: 'rgba(138,124,255,0.12)',
                    color: '#8A7CFF',
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    height: 20,
                  }}
                />
              </Stack>

              {/* Preview iframe */}
              <Box
                sx={{
                  flex: 1,
                  minHeight: 500,
                  bgcolor: '#fff',
                }}
              >
                <iframe
                  ref={iframeRef}
                  title="Email Preview"
                  sandbox="allow-same-origin"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    minHeight: 500,
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* ─── Confirmation Dialog ─── */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            maxWidth: 440,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Confirm Send
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              {target === 'all'
                ? 'You are about to send this email to ALL active users on the platform. This action cannot be undone.'
                : `You are about to send this email to ${recipientEmail || '(no email specified)'}.`}
            </Typography>

            <Divider />

            <Box>
              <Typography variant="caption" color="text.disabled" fontWeight={700}>
                SUBJECT
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                {subject}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.disabled" fontWeight={700}>
                FORMAT
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {format === 'html' ? 'HTML' : 'Plain Text'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.disabled" fontWeight={700}>
                TARGET
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                {target === 'all' ? (
                  <Chip
                    icon={<PeopleRounded />}
                    label="All Users (Bulk)"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(198,255,62,0.12)',
                      color: '#C6FF3E',
                      fontWeight: 700,
                      border: '1px solid rgba(198,255,62,0.3)',
                    }}
                  />
                ) : (
                  <Chip
                    icon={<PersonRounded />}
                    label={recipientEmail}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(138,124,255,0.12)',
                      color: '#8A7CFF',
                      fontWeight: 700,
                      border: '1px solid rgba(138,124,255,0.3)',
                    }}
                  />
                )}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSend}
            startIcon={<SendRounded />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: '#C6FF3E',
              color: '#0A0C0F',
              '&:hover': { bgcolor: '#B8F035' },
            }}
          >
            {target === 'all' ? 'Send to All' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Snackbar ─── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
