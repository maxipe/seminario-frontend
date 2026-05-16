/**
 * Axios instance for MiniMax API.
 * Injects Bearer token from localStorage on every request and logs response errors.
 */

import axios from 'axios';

export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[apiClient] Request failed:', error?.response?.status, error?.config?.url, error?.message);
    return Promise.reject(error);
  }
);

export default apiClient;
