import { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  Stack,
} from '@mui/material';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { useLanguage, LANGUAGES } from '../i18n';

export default function LanguageSelector({ variant = 'icon', size = 'small' }) {
  const { language, setLanguage, t } = useLanguage();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (code) => {
    setLanguage(code);
    handleClose();
  };

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  if (variant === 'chips') {
    return (
      <Stack direction="row" spacing={1}>
        {LANGUAGES.map((lang) => {
          const active = language === lang.code;
          return (
            <Button
              key={lang.code}
              variant={active ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setLanguage(lang.code)}
              sx={{
                borderRadius: 2,
                px: 1.5,
                py: 0.75,
                fontWeight: active ? 700 : 500,
                textTransform: 'none',
                borderColor: active ? 'primary.main' : 'divider',
              }}
            >
              <Box component="span" sx={{ mr: 0.75 }}>
                {lang.flag}
              </Box>
              {lang.label}
            </Button>
          );
        })}
      </Stack>
    );
  }

  if (variant === 'button') {
    return (
      <>
        <Button
          onClick={handleClick}
          size={size}
          variant="outlined"
          startIcon={<LanguageRoundedIcon />}
          sx={{
            borderColor: 'divider',
            color: 'text.primary',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            px: 1.5,
          }}
          aria-label="Select language"
        >
          <Box component="span" sx={{ mr: 0.75 }}>
            {currentLang.flag}
          </Box>
          {currentLang.shortLabel}
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: {
              bgcolor: 'background.paper',
              borderRadius: 2.5,
              minWidth: 150,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              border: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          {LANGUAGES.map((lang) => (
            <MenuItem
              key={lang.code}
              selected={language === lang.code}
              onClick={() => handleSelect(lang.code)}
              sx={{ py: 1, borderRadius: 1.5, mx: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 28, fontSize: '1.2rem' }}>
                {lang.flag}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight={language === lang.code ? 700 : 500}>
                    {lang.label}
                  </Typography>
                }
              />
              {language === lang.code && (
                <CheckRoundedIcon fontSize="small" sx={{ color: 'primary.main', ml: 1 }} />
              )}
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }

  // Default 'icon' variant
  return (
    <>
      <Tooltip title={t('nav.language') || 'Language'}>
        <IconButton
          onClick={handleClick}
          size={size}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            color: 'text.primary',
            fontWeight: 700,
            fontSize: '0.8rem',
            width: 36,
            height: 36,
          }}
          aria-label="Select language"
        >
          <Box component="span" sx={{ fontSize: '1rem', lineHeight: 1 }}>
            {currentLang.flag}
          </Box>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            borderRadius: 2.5,
            minWidth: 150,
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            border: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {LANGUAGES.map((lang) => (
          <MenuItem
            key={lang.code}
            selected={language === lang.code}
            onClick={() => handleSelect(lang.code)}
            sx={{ py: 1, borderRadius: 1.5, mx: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 28, fontSize: '1.2rem' }}>
              {lang.flag}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2" fontWeight={language === lang.code ? 700 : 500}>
                  {lang.label}
                </Typography>
              }
            />
            {language === lang.code && (
              <CheckRoundedIcon fontSize="small" sx={{ color: 'primary.main', ml: 1 }} />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
