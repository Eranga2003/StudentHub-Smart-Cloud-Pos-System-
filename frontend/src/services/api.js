/**
 * Student Hub POS API Client
 * Centralized service to communicate with hosted backend Express API
 */

const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://api.studenthub.xyz.lk';
const API_BASE_URL = `${BACKEND_URL}/api/v1`;

export const apiClient = {
  /**
   * Send GET request to hosted backend
   */
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
      console.warn(`[Hosted API] GET ${endpoint} failed:`, error.message);
      return null;
    }
  },

  /**
   * Send POST request to hosted backend
   */
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
      console.warn(`[Hosted API] POST ${endpoint} failed:`, error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Check health status of hosted backend API
   */
  async checkHealth() {
    try {
      const res = await fetch(`${BACKEND_URL}/api/health`);
      if (res.ok) return await res.json();
      return null;
    } catch {
      return null;
    }
  },
};

export default apiClient;
