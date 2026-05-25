const SEQUENTIAL_PATTERNS = [
  "abcdefghijklmnopqrstuvwxyz",
  "zyxwvutsrqponmlkjihgfedcba",
  "0123456789",
  "9876543210",
  "qwertyuiop",
  "poiuytrewq",
  "asdfghjkl",
  "lkjhgfdsa",
  "zxcvbnm",
  "mnbvcxz",
];

export function hasSequentialCharacters(password, span = 3) {
  const normalized = password.toLowerCase();
  if (normalized.length < span) return false;

  return SEQUENTIAL_PATTERNS.some((pattern) => {
    for (let index = 0; index <= pattern.length - span; index += 1) {
      if (normalized.includes(pattern.slice(index, index + span))) {
        return true;
      }
    }
    return false;
  });
}

export function getPasswordValidation(password, options = {}) {
  const {
    minLength = 8,
    requireUppercase = false,
    requireNumber = false,
    requireSpecial = false,
  } = options;

  return {
    hasValue: password.length > 0,
    minLength: password.length >= minLength,
    uppercase: !requireUppercase || /[A-Z]/.test(password),
    number: !requireNumber || /\d/.test(password),
    special: !requireSpecial || /[^A-Za-z0-9]/.test(password),
    noSequence: !hasSequentialCharacters(password),
  };
}

export function getPasswordValidationMessage(checks, options = {}) {
  const { minLength = 8 } = options;
  if (!checks.hasValue) return "";
  if (!checks.minLength) return `Use at least ${minLength} characters.`;
  if (!checks.uppercase) return "Add at least one uppercase letter.";
  if (!checks.number) return "Add at least one number.";
  if (!checks.special) return "Add at least one special character.";
  if (!checks.noSequence) return "Avoid sequential characters like abc or 123.";
  return "";
}
