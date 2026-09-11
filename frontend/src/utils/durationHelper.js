/**
 * Helper utility for calculating, checking and formatting Product Pack durations and expiration.
 */

export const DURATION_UNITS = [
  { value: 'LIFETIME', label: 'Lifetime (Unlimited)', shortLabel: 'Lifetime' },
  { value: 'HOURS', label: 'Hours (Flash Deal)', shortLabel: 'Hours' },
  { value: 'DAYS', label: 'Days', shortLabel: 'Days' },
  { value: 'WEEKS', label: 'Weeks', shortLabel: 'Weeks' },
];

export const PRESET_OPTIONS = {
  HOURS: [1, 6, 12, 24, 48, 72],
  DAYS: [1, 2, 3, 5, 7, 14, 30],
  WEEKS: [1, 2, 3, 4],
};

/**
 * Calculates a prospective expiration Date based on unit and value from now.
 */
export function calculateExpirationDate(unit, value) {
  if (!unit || unit === 'LIFETIME' || !value || value <= 0) {
    return null;
  }
  const now = new Date();
  const val = Number(value);
  if (unit === 'HOURS') {
    return new Date(now.getTime() + val * 60 * 60 * 1000);
  } else if (unit === 'DAYS') {
    return new Date(now.getTime() + val * 24 * 60 * 60 * 1000);
  } else if (unit === 'WEEKS') {
    return new Date(now.getTime() + val * 7 * 24 * 60 * 60 * 1000);
  }
  return null;
}

/**
 * Determines if a pack is expired based on validUntil.
 */
export function isPackExpired(pack) {
  if (!pack || !pack.validUntil) return false;
  return new Date(pack.validUntil).getTime() <= Date.now();
}

/**
 * Returns formatted duration status info for a pack.
 */
export function getPackDurationStatus(pack) {
  if (!pack) {
    return {
      isLifetime: true,
      isExpired: false,
      statusType: 'LIFETIME',
      label: 'Lifetime',
      color: 'default',
      tooltip: 'No expiration',
    };
  }

  if (!pack.validUntil || pack.durationUnit === 'LIFETIME') {
    return {
      isLifetime: true,
      isExpired: false,
      statusType: 'LIFETIME',
      label: 'Lifetime',
      color: 'default',
      tooltip: 'Permanent offer - No expiration date set',
    };
  }

  const expiryTime = new Date(pack.validUntil).getTime();
  const now = Date.now();
  const diffMs = expiryTime - now;

  if (diffMs <= 0) {
    return {
      isLifetime: false,
      isExpired: true,
      statusType: 'EXPIRED',
      label: 'Expired (Hidden)',
      color: 'error',
      tooltip: `Expired on ${new Date(pack.validUntil).toLocaleString()}. Not visible in shop.`,
    };
  }

  const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
  const daysLeft = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (hoursLeft < 1) {
    const minutesLeft = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    return {
      isLifetime: false,
      isExpired: false,
      statusType: 'URGENT',
      label: `${minutesLeft}m left`,
      color: 'error',
      tooltip: `Expires very soon: ${new Date(pack.validUntil).toLocaleString()}`,
    };
  }

  if (hoursLeft < 24) {
    return {
      isLifetime: false,
      isExpired: false,
      statusType: 'URGENT',
      label: `${hoursLeft}h left`,
      color: 'warning',
      tooltip: `Expires today: ${new Date(pack.validUntil).toLocaleString()}`,
    };
  }

  if (daysLeft < 7) {
    return {
      isLifetime: false,
      isExpired: false,
      statusType: 'ACTIVE',
      label: `${daysLeft}d left`,
      color: 'info',
      tooltip: `Expires on ${new Date(pack.validUntil).toLocaleString()}`,
    };
  }

  return {
    isLifetime: false,
    isExpired: false,
    statusType: 'ACTIVE',
    label: `${daysLeft}d left`,
    color: 'success',
    tooltip: `Expires on ${new Date(pack.validUntil).toLocaleString()}`,
  };
}
