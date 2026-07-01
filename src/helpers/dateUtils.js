// src/helpers/dateUtils.js

/**
 * Normalizes a date string to be compatible with older Safari versions by replacing spaces with 'T'.
 * Safari can be strict with the ISO 8601 format and may fail to parse timestamps
 * with a space separator (e.g., "YYYY-MM-DD HH:mm:ss") instead of 'T'.
 * @param {string | Date} dateInput - The date string or Date object to normalize.
 * @returns {string | null} The normalized date string, or null if the input is invalid.
 */
const normalizeDateStringForSafari = (dateInput) => {
  if (!dateInput) {
    return null;
  }

  // If it's already a Date object, return its ISO string representation.
  if (dateInput instanceof Date) {
    return dateInput.toISOString();
  }

  if (typeof dateInput !== 'string') {
    return null;
  }

  // Replace the space between date and time with 'T' for ISO 8601 compatibility.
  return dateInput.replace(' ', 'T');
};

/**
 * Formats a given timestamp into a human-readable string with fallbacks for invalid dates.
 * This function is designed to be robust against various timestamp formats and parsing
 * errors, particularly for older browsers like Safari.
 * @param {string | Date} timestamp - The timestamp to format.
 * @returns {string} The formatted date string (e.g., "Oct 27, 2023, 10:00 AM").
 */
export const formatTimestamp = (timestamp) => {
  const normalizedTimestamp = normalizeDateStringForSafari(timestamp);
  const date = normalizedTimestamp ? new Date(normalizedTimestamp) : null;

  // Graceful Fallback: If the timestamp is null, empty, corrupt, or results in an invalid date,
  // default to the current local timestamp as required by the issue.
  if (!date || isNaN(date.getTime())) {
    const now = new Date();
    return now.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
