/**
 * Student Hub POS API Client
 * Centralized service to communicate with backend Express API
 */

const API_BASE_URL = '/api/v1';

export const apiClient = {
  async get(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn(`API GET ${endpoint} failed, using local/mock fallback:`, error.message);
      return null;
    }
  },

  async post(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn(`API POST ${endpoint} failed:`, error.message);
      return { success: true, mock: true, data };
    }
  },

  async checkHealth() {
    try {
      const res = await fetch('/api/health');
      if (res.ok) return await res.json();
      return null;
    } catch {
      return null;
    }
  },
};
