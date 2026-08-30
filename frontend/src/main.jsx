import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';

import App from './App';
import { getTheme } from './theme';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider as CustomThemeProvider, useThemeMode } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './i18n';
import './styles/global.css';

function ThemedApp() {
  const { mode } = useThemeMode();
  const { dir } = useLanguage();
  const theme = getTheme(mode, dir);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <CustomThemeProvider>
          <ThemedApp />
        </CustomThemeProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>,
);