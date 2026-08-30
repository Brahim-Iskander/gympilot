import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import en from './translations/en';
import fr from './translations/fr';
import ar from './translations/ar';

const translations = { en, fr, ar };

export const LANGUAGES = [
  { code: 'en', label: 'English', shortLabel: 'EN', flag: '🇬🇧', dir: 'ltr' },
  { code: 'fr', label: 'Français', shortLabel: 'FR', flag: '🇫🇷', dir: 'ltr' },
  { code: 'ar', label: 'العربية', shortLabel: 'عربي', flag: '🇹🇳', dir: 'rtl' },
];

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('gymtrack_lang');
    if (saved && ['en', 'fr', 'ar'].includes(saved)) {
      return saved;
    }
    const browserLang = navigator.language?.slice(0, 2);
    if (['en', 'fr', 'ar'].includes(browserLang)) {
      return browserLang;
    }
    return 'en';
  });

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem('gymtrack_lang', language);
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language, dir]);

  const setLanguage = (newLang) => {
    if (['en', 'fr', 'ar'].includes(newLang)) {
      setLanguageState(newLang);
    }
  };

  /**
   * Translate a key with optional variable interpolation
   * e.g. t('nav.welcomeUser', { name: 'John' })
   */
  const t = useMemo(() => {
    return (key, params = {}) => {
      if (!key) return '';

      const keys = key.split('.');
      let val = translations[language];

      for (const k of keys) {
        if (val && typeof val === 'object' && k in val) {
          val = val[k];
        } else {
          val = undefined;
          break;
        }
      }

      // Fallback to English if not found in current language
      if (val === undefined) {
        let fallbackVal = translations.en;
        for (const k of keys) {
          if (fallbackVal && typeof fallbackVal === 'object' && k in fallbackVal) {
            fallbackVal = fallbackVal[k];
          } else {
            fallbackVal = undefined;
            break;
          }
        }
        val = fallbackVal !== undefined ? fallbackVal : key;
      }

      if (typeof val !== 'string') {
        return key;
      }

      // Variable interpolation {{variable}}
      if (params && typeof params === 'object') {
        return val.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, match) => {
          return params[match] !== undefined ? params[match] : `{{${match}}}`;
        });
      }

      return val;
    };
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      dir,
      isRtl: dir === 'rtl',
      languages: LANGUAGES,
    }),
    [language, dir, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
