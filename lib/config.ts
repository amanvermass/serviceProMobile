export const CONFIG = {
  // Pulls from .env (prefixed with EXPO_PUBLIC_)
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.servicetrackpro.com',
  // Default timeout for API requests in milliseconds
  API_TIMEOUT: 15000,
  // Version string
  VERSION: '1.0.0',
};

export default CONFIG;
