import { API_CONFIG } from '../config';

export const privacyService = {
  async getConsent(userId) {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/privacy/consent?user_id=${encodeURIComponent(userId)}`);
      if (!response.ok) throw new Error('Failed to fetch consent');
      return await response.json();
    } catch (err) {
      console.error('getConsent error:', err);
      // Default consent
      return {
        consent: {
          marketing_emails: false,
          product_updates: true,
          usage_analytics: true,
          experimental_features: false,
        },
        updated_at: null,
        user_id: userId,
      };
    }
  },

  async updateConsent(userId, consent, actor = 'user') {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/privacy/consent`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, consent, actor }),
      });
      if (!response.ok) throw new Error('Failed to update consent');
      return await response.json();
    } catch (err) {
      console.error('updateConsent error:', err);
      throw err;
    }
  },

  async exportData(userId, format = 'json') {
    try {
      const response = await fetch(
        `${API_CONFIG.BACKEND_URL}/privacy/export?user_id=${encodeURIComponent(userId)}&format=${encodeURIComponent(format)}`
      );
      if (!response.ok) throw new Error('Failed to export data');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user_data_${userId}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      return { success: true };
    } catch (err) {
      console.error('exportData error:', err);
      throw err;
    }
  },

  async requestDeletion(userId, reason = '') {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/privacy/request_deletion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, reason }),
      });
      if (!response.ok) throw new Error('Failed to request deletion');
      return await response.json();
    } catch (err) {
      console.error('requestDeletion error:', err);
      throw err;
    }
  },

  async getPrivacyRequests(userId) {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/privacy/requests?user_id=${encodeURIComponent(userId)}`);
      if (!response.ok) throw new Error('Failed to fetch privacy requests');
      return await response.json();
    } catch (err) {
      console.error('getPrivacyRequests error:', err);
      return { requests: [] };
    }
  },
};
