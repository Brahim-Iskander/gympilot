import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack } from '@mui/material';

export default function ConfirmDialog({
  open,
  onClose,
  title = 'Confirm',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'contained',
  color = 'primary',
  loading = false,
  onConfirm,
  children,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 700 }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
        {children}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Stack direction="row" spacing={2} useFlexGap>
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={variant}
            color={color}
            onClick={onConfirm}
            disabled={loading}
            autoFocus
          >
            {loading ? 'Confirming...' : confirmText}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}