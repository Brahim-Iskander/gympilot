import { useState, useEffect } from 'react';

/**
 * Currency configuration for GymPilot subscription pricing.
 */
export const CURRENCY_CONFIG = {
  TND: {
    code: 'TND',
    symbol: 'TND',
    flag: '🇹🇳',
    label: 'Tunisia (TND)',
    countryName: 'Tunisia',
    basicPrice: '49 TND',
    basicAmount: 49,
    premiumPrice: '99 TND',
    premiumAmount: 99,
    period: '/ month',
    billingNote: 'Billed in Tunisian Dinar (TND)',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    flag: '🇪🇺',
    label: 'Europe (EUR €)',
    countryName: 'Europe',
    basicPrice: '14.99 €',
    basicAmount: 14.99,
    premiumPrice: '29.99 €',
    premiumAmount: 29.99,
    period: '/ month',
    billingNote: 'Billed in Euros (€)',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    flag: '🇺🇸',
    label: 'USA / Global (USD $)',
    countryName: 'United States & Global',
    basicPrice: '$14.99',
    basicAmount: 14.99,
    premiumPrice: '$29.99',
    premiumAmount: 29.99,
    period: '/ month',
    billingNote: 'Billed in US Dollars ($)',
  },
};

const EUROPEAN_COUNTRY_CODES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
  'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
  'SI', 'ES', 'SE', 'GB', 'CH', 'NO', 'IS', 'MC', 'AD', 'SM', 'LI', 'VA',
  'AL', 'BA', 'ME', 'MK', 'RS', 'XK', 'MD', 'UA', 'BY', 'TR', 'GI', 'LU'
]);

/**
 * Instant zero-latency timezone detection to avoid page flicker.
 */
function detectInitialFromTimezone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Tunis') || tz.includes('Tripoli')) {
      return { currency: 'TND', countryCode: 'TN' };
    }
    if (tz.startsWith('Europe/')) {
      return { currency: 'EUR', countryCode: 'EU' };
    }
    if (tz.startsWith('America/') || tz.startsWith('US/')) {
      return { currency: 'USD', countryCode: 'US' };
    }
  } catch (e) {
    // Ignore timezone detection errors
  }
  return { currency: 'TND', countryCode: 'TN' };
}

/**
 * Determines appropriate currency from ISO 2-letter country code.
 */
export function currencyFromCountryCode(countryCode) {
  if (!countryCode) return 'TND';
  const code = countryCode.toUpperCase();
  if (code === 'TN') {
    return 'TND';
  }
  if (EUROPEAN_COUNTRY_CODES.has(code)) {
    return 'EUR';
  }
  if (code === 'US' || code === 'CA') {
    return 'USD';
  }
  // Default to USD for global / other countries
  return 'USD';
}

/**
 * Custom React hook for location detection & dynamic subscription currency.
 */
export function useGeoCurrency() {
  // 1. Initial synchronous state (from localStorage or fast timezone)
  const [currency, setCurrencyState] = useState(() => {
    const saved = localStorage.getItem('gympilot_currency');
    if (saved && CURRENCY_CONFIG[saved]) {
      return saved;
    }
    const cachedGeo = localStorage.getItem('gympilot_geo_currency');
    if (cachedGeo && CURRENCY_CONFIG[cachedGeo]) {
      return cachedGeo;
    }
    return detectInitialFromTimezone().currency;
  });

  const [detectedCountry, setDetectedCountry] = useState(() => {
    return localStorage.getItem('gympilot_geo_country') || detectInitialFromTimezone().countryCode;
  });

  const [isAutoDetected, setIsAutoDetected] = useState(() => {
    return !localStorage.getItem('gympilot_currency');
  });

  // 2. Asynchronous IP location check in background (cached for 24 hours)
  useEffect(() => {
    const manualCurrency = localStorage.getItem('gympilot_currency');
    const cachedCountry = localStorage.getItem('gympilot_geo_country');
    const cachedTimestamp = localStorage.getItem('gympilot_geo_timestamp');
    const ONE_DAY = 24 * 60 * 60 * 1000;

    if (cachedCountry && cachedTimestamp && Date.now() - Number(cachedTimestamp) < ONE_DAY) {
      if (!manualCurrency) {
        const autoCur = currencyFromCountryCode(cachedCountry);
        setCurrencyState(autoCur);
      }
      return;
    }

    let isMounted = true;
    const fetchLocation = async () => {
      try {
        // Fast primary lookup
        const res = await fetch('https://api.country.is/', { signal: AbortSignal.timeout(3500) });
        if (res.ok) {
          const data = await res.json();
          if (data && data.country && isMounted) {
            const countryCode = data.country.toUpperCase();
            localStorage.setItem('gympilot_geo_country', countryCode);
            localStorage.setItem('gympilot_geo_timestamp', Date.now().toString());
            setDetectedCountry(countryCode);

            if (!localStorage.getItem('gympilot_currency')) {
              const matchedCurrency = currencyFromCountryCode(countryCode);
              localStorage.setItem('gympilot_geo_currency', matchedCurrency);
              setCurrencyState(matchedCurrency);
              setIsAutoDetected(true);
            }
            return;
          }
        }
      } catch (err) {
        // Secondary fallback
        try {
          const res2 = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(3500) });
          if (res2.ok) {
            const data2 = await res2.json();
            if (data2 && data2.country_code && isMounted) {
              const countryCode = data2.country_code.toUpperCase();
              localStorage.setItem('gympilot_geo_country', countryCode);
              localStorage.setItem('gympilot_geo_timestamp', Date.now().toString());
              setDetectedCountry(countryCode);

              if (!localStorage.getItem('gympilot_currency')) {
                const matchedCurrency = currencyFromCountryCode(countryCode);
                localStorage.setItem('gympilot_geo_currency', matchedCurrency);
                setCurrencyState(matchedCurrency);
                setIsAutoDetected(true);
              }
            }
          }
        } catch (ignored) {
          // Timezone fallback is already in place
        }
      }
    };

    fetchLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  const changeCurrency = (newCurrency) => {
    if (CURRENCY_CONFIG[newCurrency]) {
      setCurrencyState(newCurrency);
      setIsAutoDetected(false);
      localStorage.setItem('gympilot_currency', newCurrency);
    }
  };

  const resetToAutoDetect = () => {
    localStorage.removeItem('gympilot_currency');
    setIsAutoDetected(true);
    const country = localStorage.getItem('gympilot_geo_country') || detectInitialFromTimezone().countryCode;
    const matched = currencyFromCountryCode(country);
    setCurrencyState(matched);
  };

  return {
    currency,
    changeCurrency,
    resetToAutoDetect,
    isAutoDetected,
    detectedCountry,
    config: CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.TND,
    allCurrencies: Object.values(CURRENCY_CONFIG),
  };
}
