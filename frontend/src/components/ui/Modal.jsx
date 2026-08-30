import { useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'md',
  fullWidth = true,
  actions,
  disableCloseOnEsc = false,
  disableBackdropClick = false,
  sx,
}) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (open) {
      closeButtonRef.current?.focus();
    }
  }, [open]);

  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && !disableCloseOnEsc) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      onKeyDown={handleKeyDown}
      BackdropProps={{
        timeout: 200,
      }}
      PaperProps={{
        sx: {
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
          ...sx,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: "'Sora','Inter',sans-serif",
          fontWeight: 700,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography>{title}</Typography>
        <IconButton
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close modal"
          size="small"
          sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary', backgroundColor: 'rgba(255,255,255,0.08)' } }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>{children}</DialogContent>
      {actions && (
        <DialogActions sx={{ px: 3, pb: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}