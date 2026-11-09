import { defineStore } from 'pinia';
import apiClient from '@/services/api';

// Pinia store for authentication, user session, and tenant company state management
export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('access_token') || null,
    user: JSON.parse(localStorage.getItem('user_info') || 'null'),
    companyCode: localStorage.getItem('company_code') || 'DEMO',
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => (state.user ? state.user.role : null),
    companyId: (state) => (state.user ? state.user.company_id : null),
  },
  actions: {
    // Authenticate user credentials and store session data
    async login(username, password) {
      const response = await apiClient.post('/auth/login', { username, password });
      this.token = response.data.access_token;
      this.user = response.data.user;
      if (this.user.company_short_code) {
        this.setCompanyCode(this.user.company_short_code);
      }
      localStorage.setItem('access_token', this.token);
      localStorage.setItem('user_info', JSON.stringify(this.user));
      return this.user;
    },
    
    // Set current active tenant company short code
    setCompanyCode(code) {
      this.companyCode = code.toUpperCase();
      localStorage.setItem('company_code', this.companyCode);
    },
    
    // Terminate user session and clean up local storage state
    async logout() {
      try {
        await apiClient.post('/auth/logout');
      } catch (error) {
        console.error("Error notifying logout to server:", error);
      } finally {
        this.token = null;
        this.user = null;
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_info');
        localStorage.removeItem('company_code');
        // Clear station pairing keys from local storage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('operator_station_')) {
            localStorage.removeItem(key);
          }
        });
      }
    },
  },
});