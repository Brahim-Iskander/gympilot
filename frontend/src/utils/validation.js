export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'tempmail.com', 'temp-mail.org', 'temp-mail.io', 'tempmail.net',
  '10minutemail.com', '10minutemail.net', '10minutemail.org', '10minuteinbox.com',
  'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org', 'guerrillamail.biz',
  'guerrillamailblock.com', 'sharklasers.com', 'grr.la', 'pokemail.net', 'spam4.me',
  'mailinator.com', 'mailinator.net', 'mailinator2.com', 'suremail.info', 'notmailinator.com',
  'yopmail.com', 'yopmail.fr', 'yopmail.net', 'cool.fr.nf', 'jetable.fr.nf', 'courriel.fr.nf',
  'trashmail.com', 'trashmail.net', 'trashmail.me', 'trashmail.org',
  'dispostable.com', 'throwawaymail.com', 'fakeinbox.com', 'getairmail.com',
  'mohmal.com', 'mohmal.in', 'crazymailing.com', 'mytemp.email',
  'inboxkitten.com', 'tempinbox.com', 'tempail.com', 'generator.email',
  'emailondeck.com', 'dropmail.me', 'fakemailgenerator.com',
  'nada.ltd', 'getnada.com', 'burnermail.io', 'maildrop.cc',
  'mailsac.com', 'minuteinbox.com', 'tempr.email', 'discard.email',
  'trash-mail.com', 'mailnesia.com', 'harakirimail.com', 'bccto.me',
  'bupmail.com', '0-mail.com', 'zoemail.org', 'boximail.com',
  'fakemail.net', 'tmail.ws', 'tempmailo.com', 'tempm.com',
  'yapped.net', 'mohmal.im', 'nada.email', 'armyspy.com',
  'cuvox.de', 'dayrep.com', 'einrot.com', 'fleckens.hu',
  'gustr.com', 'jourrapide.com', 'rhyta.com', 'superrito.com',
  'teleworm.us', 'disposablemail.com', 'tempemail.co', 'mytempmail.com',
  'trashymail.com', 'mailforspam.com', 'spambox.us', 'safetymail.info'
]);

export function isDisposableEmail(email) {
  if (!email || typeof email !== 'string' || !email.includes('@')) return false;
  const domain = email.split('@').pop().toLowerCase().trim();
  if (!domain) return false;
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) return true;
  for (const disposable of DISPOSABLE_EMAIL_DOMAINS) {
    if (domain.endsWith('.' + disposable)) return true;
  }
  return false;
}

/** Mirrors the backend validation rules for /api/auth/login. */
export function validateLoginForm({ email, password }) {
  const errors = {};

  if (!email.trim()) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  }

  return errors;
}

/** Mirrors the backend validation rules for /api/auth/register. */
export function validateRegisterForm({ firstName, lastName, email, password, confirmPassword }) {
  const errors = {};

  if (!firstName.trim()) {
    errors.firstName = 'First name is required.';
  }

  if (!lastName.trim()) {
    errors.lastName = 'Last name is required.';
  }

  if (!email.trim()) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = 'Please enter a valid email address.';
  } else if (isDisposableEmail(email.trim())) {
    errors.email = 'Temporary or disposable email addresses are not allowed. Please use a permanent email (e.g. Gmail, Outlook, Yahoo).';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}
