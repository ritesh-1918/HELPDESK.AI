/**
 * Smart Ticket Templates v2 — Structured Dynamic Form Templates
 *
 * ARCHITECTURE CHANGE (v2):
 * Templates now include a `fields` array for dynamic form rendering,
 * replacing the old plain-text `description_template` blob approach.
 *
 * Each template contains:
 *   - id:                   unique slug identifier
 *   - label:                short display name
 *   - icon:                 lucide-react icon name string (resolved in the component)
 *   - category:             broad category for Quick Actions bridging
 *   - priority_hint:        soft signal for the AI pipeline
 *   - title:                auto-filled ticket title
 *   - description_summary:  brief description shown in template preview
 *   - fields:               structured form field definitions for dynamic rendering
 *   - tags:                 search/filter keywords
 *
 * Supported field types: text, textarea, select, date, checkbox
 *
 * The old `description_template` is REMOVED in favor of `fields`.
 * At submit time, fields are serialized back to formatted text for backend compatibility.
 */

const TICKET_TEMPLATES = [
  {
    id: 'vpn-connectivity',
    label: 'VPN Connectivity Issue',
    icon: 'ShieldOff',
    category: 'Network',
    priority_hint: 'high',
    title: 'Unable to connect to company VPN',
    description_summary: 'Report VPN connection failures with device, location, and error details.',
    fields: [
      { key: 'error_message', label: 'Error Message', type: 'textarea', placeholder: 'Paste the exact error here', required: true },
      { key: 'device_os', label: 'Device & OS', type: 'text', placeholder: 'e.g., Windows 11 laptop / MacBook M2', required: true },
      { key: 'location', label: 'Location', type: 'select', options: ['Office', 'Home WiFi', 'Mobile Hotspot', 'Other'], required: true },
      { key: 'internet_status', label: 'Internet Status', type: 'select', options: ['Working', 'Not Working', 'Intermittent'], required: true },
      { key: 'vpn_client', label: 'VPN Client', type: 'text', placeholder: 'e.g., Cisco AnyConnect, GlobalProtect, OpenVPN', required: false },
      { key: 'additional_context', label: 'Additional Context', type: 'textarea', placeholder: 'What changed recently? e.g., password reset, OS update', required: false },
    ],
    tags: ['vpn', 'network', 'connectivity', 'remote-access'],
  },
  {
    id: 'password-reset',
    label: 'Password Reset Request',
    icon: 'KeyRound',
    category: 'Access',
    priority_hint: 'medium',
    title: 'Password reset request',
    description_summary: 'Request a password reset for any company system or account.',
    fields: [
      { key: 'account_system', label: 'Account / System', type: 'select', options: ['Email', 'SSO', 'Active Directory', 'VPN', 'Other'], required: true },
      { key: 'username_email', label: 'Username / Email', type: 'text', placeholder: 'Your account identifier', required: true },
      { key: 'reset_reason', label: 'Reason for Reset', type: 'select', options: ['Forgotten', 'Expired', 'Locked out', 'Compromised', 'Other'], required: true },
      { key: 'last_login', label: 'Last Successful Login', type: 'date', placeholder: '', required: false },
      { key: 'additional_context', label: 'Additional Context', type: 'textarea', placeholder: 'Any error messages or relevant details', required: false },
    ],
    tags: ['password', 'reset', 'account', 'locked', 'login'],
  },
  {
    id: 'email-access',
    label: 'Email Access Problem',
    icon: 'MailX',
    category: 'Software',
    priority_hint: 'high',
    title: 'Unable to access email',
    description_summary: 'Report email connectivity, login, or delivery issues.',
    fields: [
      { key: 'email_client', label: 'Email Client', type: 'select', options: ['Outlook Desktop', 'Outlook Web (OWA)', 'Gmail', 'Mobile App', 'Other'], required: true },
      { key: 'error_message', label: 'Error Message', type: 'textarea', placeholder: 'Paste the exact error here', required: false },
      { key: 'device_os', label: 'Device & OS', type: 'text', placeholder: 'e.g., Windows 11 / macOS Sonoma / iPhone 15', required: true },
      { key: 'issue_type', label: 'Issue Type', type: 'select', options: ['Cannot login', 'Emails not loading', 'Cannot send', 'Cannot receive', 'Slow performance'], required: true },
      { key: 'since_when', label: 'Since When', type: 'date', placeholder: '', required: true },
      { key: 'additional_context', label: 'Additional Context', type: 'textarea', placeholder: 'Any recent changes — password reset, device change, etc.', required: false },
    ],
    tags: ['email', 'outlook', 'mail', 'inbox', 'access'],
  },
  {
    id: 'printer-issue',
    label: 'Printer Not Working',
    icon: 'Printer',
    category: 'Hardware',
    priority_hint: 'low',
    title: 'Printer not working',
    description_summary: 'Report printer hardware, driver, or connectivity problems.',
    fields: [
      { key: 'printer_name', label: 'Printer Name / Location', type: 'text', placeholder: 'e.g., 3rd Floor HP LaserJet, Room 201', required: true },
      { key: 'issue_type', label: 'Issue Type', type: 'select', options: ['Not printing', 'Paper jam', 'Offline', 'Poor quality', 'Driver error', 'Other'], required: true },
      { key: 'error_message', label: 'Error Message', type: 'text', placeholder: 'Any error shown on screen or printer display', required: false },
      { key: 'connection_type', label: 'Connected Via', type: 'select', options: ['USB', 'WiFi', 'Network (Ethernet)', 'Bluetooth'], required: true },
      { key: 'steps_tried', label: 'Steps Already Tried', type: 'textarea', placeholder: 'Restart, re-add printer, check cables, etc.', required: false },
      { key: 'affects_multiple', label: 'Affects multiple users?', type: 'checkbox', placeholder: '', required: false },
    ],
    tags: ['printer', 'print', 'hardware', 'paper jam', 'offline'],
  },
  {
    id: 'wifi-network',
    label: 'WiFi / Network Issue',
    icon: 'WifiOff',
    category: 'Network',
    priority_hint: 'high',
    title: 'WiFi or network connectivity issue',
    description_summary: 'Report WiFi drops, slow speeds, or network access problems.',
    fields: [
      { key: 'issue_type', label: 'Issue Type', type: 'select', options: ['No connection', 'Slow speed', 'Intermittent drops', 'Cannot access specific sites'], required: true },
      { key: 'network_name', label: 'Network Name (SSID)', type: 'text', placeholder: 'e.g., CorpWiFi-5G, GuestNetwork', required: true },
      { key: 'device_os', label: 'Device & OS', type: 'text', placeholder: 'e.g., Dell Laptop / Windows 11', required: true },
      { key: 'location', label: 'Location', type: 'text', placeholder: 'Building, floor, room number', required: true },
      { key: 'connection_type', label: 'Wired or Wireless', type: 'select', options: ['WiFi', 'Ethernet cable'], required: true },
      { key: 'since_when', label: 'Since When', type: 'date', placeholder: '', required: true },
      { key: 'additional_context', label: 'Additional Context', type: 'textarea', placeholder: 'Are other users affected? Any recent changes?', required: false },
    ],
    tags: ['wifi', 'network', 'internet', 'connectivity', 'slow'],
  },
  {
    id: 'software-installation',
    label: 'Software Installation Request',
    icon: 'Download',
    category: 'Software',
    priority_hint: 'medium',
    title: 'Software installation request',
    description_summary: 'Request new software installation with license and justification details.',
    fields: [
      { key: 'software_name', label: 'Software Name & Version', type: 'text', placeholder: 'e.g., Adobe Acrobat Pro 2024, Python 3.12', required: true },
      { key: 'justification', label: 'Business Justification', type: 'textarea', placeholder: 'Why is this software needed for your role?', required: true },
      { key: 'device_os', label: 'Device & OS', type: 'text', placeholder: 'e.g., Windows 11 laptop, Asset Tag #12345', required: true },
      { key: 'license_available', label: 'License Available', type: 'select', options: ['Yes', 'No', 'Not sure'], required: true },
      { key: 'needed_by', label: 'Needed By', type: 'date', placeholder: '', required: false },
      { key: 'additional_context', label: 'Additional Context', type: 'textarea', placeholder: 'Any special configuration requirements?', required: false },
    ],
    tags: ['software', 'install', 'application', 'license', 'download'],
  },
];

/**
 * serializeFieldsToText — Converts structured form data back into formatted
 * plain text for backend API compatibility.
 *
 * This ensures the existing `/ai/analyze_stream` and `/tickets/save` endpoints
 * continue to work without any backend modifications.
 *
 * @param {Array} fields  - The template's field definitions
 * @param {Object} values - The user-entered values keyed by field.key
 * @returns {string}      - Formatted text description
 */
export function serializeFieldsToText(fields, values) {
  const lines = [];
  for (const field of fields) {
    const val = values[field.key];
    // Skip empty optional fields
    if (!val && !field.required) continue;
    // Handle checkbox fields
    if (field.type === 'checkbox') {
      lines.push(`${field.label}: ${val ? 'Yes' : 'No'}`);
    } else if (val) {
      lines.push(`${field.label}: ${val}`);
    }
  }
  return lines.join('\n');
}

/**
 * getEmptyFormValues — Creates an empty values object for a template's fields.
 *
 * @param {Array} fields - The template's field definitions
 * @returns {Object}     - Empty form values keyed by field.key
 */
export function getEmptyFormValues(fields) {
  const values = {};
  for (const field of fields) {
    values[field.key] = field.type === 'checkbox' ? false : '';
  }
  return values;
}

export default TICKET_TEMPLATES;
