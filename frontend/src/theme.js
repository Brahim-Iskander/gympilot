import { createContext, useContext, useState, useCallback } from "react";
import { createTheme, responsiveFontSizes } from "@mui/material/styles";
const ACCENT = '#C6FF3E';
const ACCENT_DARK = '#A8D82E';
const HEADING_FONT = "'Sora', 'Inter', sans-serif";
const BODY_FONT = "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif";

const getPalette = (mode) => {
  if (mode === 'dark') {
    return {
      mode: 'dark',
      primary: { main: ACCENT, contrastText: '#0A0C0F', dark: ACCENT_DARK },
      secondary: { main: '#8A7CFF' },
      background: { default: '#0A0C0F', paper: '#12151B', elevated: '#1A1E26' },
      text: { primary: '#F4F6F8', secondary: '#98A1AC', disabled: '#5C636A' },
      divider: 'rgba(255,255,255,0.08)',
      action: {
        hover: 'rgba(255,255,255,0.06)',
        selected: 'rgba(198,255,62,0.12)',
        active: 'rgba(255,255,255,0.14)',
      },
    };
  }
  return {
    mode: 'light',
    primary: { main: '#3A7D1A', contrastText: '#FFFFFF', dark: '#2E6315' },
    secondary: { main: '#6B5CEF' },
    background: { default: '#F8FAFC', paper: '#FFFFFF', elevated: '#F1F5F9' },
    text: { primary: '#0F172A', secondary: '#475569', disabled: '#94A3B8' },
    divider: 'rgba(15,23,42,0.1)',
    action: {
      hover: 'rgba(15,23,42,0.04)',
      selected: 'rgba(58,125,26,0.1)',
      active: 'rgba(15,23,42,0.08)',
    },
  };
};

const ARABIC_FONT = "'Cairo', 'Tajawal', 'Noto Sans Arabic', 'Inter', system-ui, sans-serif";

export const getTheme = (mode, direction = 'ltr') => {
  const isRtl = direction === 'rtl';
  const bodyFont = isRtl ? ARABIC_FONT : BODY_FONT;
  const headingFont = isRtl ? ARABIC_FONT : HEADING_FONT;

  return responsiveFontSizes(
    createTheme({
      direction: direction || 'ltr',
      palette: getPalette(mode),
      shape: { borderRadius: 12 },
      typography: {
        fontFamily: bodyFont,
        h1: { fontFamily: headingFont, fontWeight: 800 },
        h2: { fontFamily: headingFont, fontWeight: 800 },
        h3: { fontFamily: headingFont, fontWeight: 800 },
        h4: { fontFamily: headingFont, fontWeight: 700 },
        h5: { fontFamily: headingFont, fontWeight: 700 },
        h6: { fontFamily: headingFont, fontWeight: 700 },
        button: { textTransform: 'none' },
      },
      components: {
        MuiButton: {
          defaultProps: { disableElevation: true },
          styleOverrides: {
            root: {
              borderRadius: 10,
              fontWeight: 600,
              paddingInline: 20,
              paddingBlock: 9,
            },
            containedPrimary: {
              color: mode === 'dark' ? '#0A0C0F' : '#FFFFFF',
              '&:hover': {
                backgroundColor: mode === 'dark' ? '#D6FF70' : '#2E6315',
                boxShadow: mode === 'dark'
                  ? '0 8px 28px rgba(198,255,62,0.25)'
                  : '0 8px 28px rgba(58,125,26,0.25)',
              },
            },
            outlined: {
              borderColor: mode === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(15,23,42,0.2)',
              '&:hover': {
                borderColor: mode === 'dark' ? ACCENT : '#3A7D1A',
                backgroundColor: mode === 'dark' ? 'rgba(198,255,62,0.06)' : 'rgba(58,125,26,0.06)',
              },
            },
            sizeLarge: {
              paddingInline: 26,
              paddingBlock: 12,
              fontSize: '1rem',
            },
          },
        },
        MuiPaper: {
          styleOverrides: { root: { backgroundImage: 'none' } },
        },
        MuiCard: {
          styleOverrides: { root: { backgroundImage: 'none' } },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.02)',
              '& fieldset': { borderColor: mode === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.14)' },
              '&:hover fieldset': { borderColor: mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(15,23,42,0.3)' },
              '&.Mui-focused fieldset': { borderColor: mode === 'dark' ? ACCENT : '#3A7D1A' },
            },
          },
        },
        MuiInputLabel: {
          styleOverrides: {
            root: {
              '&.Mui-focused': { color: mode === 'dark' ? ACCENT : '#3A7D1A' },
            },
          },
        },
        MuiLink: {
          defaultProps: { underline: 'hover' },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              backgroundImage: 'none',
            },
          },
        },
        MuiTooltip: {
          styleOverrides: {
            tooltip: {
              borderRadius: 8,
              fontSize: '0.75rem',
              padding: '8px 12px',
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: 8,
            },
          },
        },
      },
    })
  );
};

const defaultTheme = getTheme('dark');

export default defaultTheme;