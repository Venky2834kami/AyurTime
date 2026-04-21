/**
 * API Configuration for AyurTime
 * Environment-aware configuration for backend API endpoints
 * Supports development (localhost) and production deployment
 */

// Default configuration
const DEFAULT_CONFIG = {
  development: {
    apiBaseUrl: 'http://localhost:5000',
    timeout: 10000, // 10 seconds
    retryAttempts: 1,
    retryDelay: 2000 // 2 seconds
  },
  production: {
    apiBaseUrl: process.env.API_BASE_URL || 'https://api.ayurtime.com',
    timeout: 15000,
    retryAttempts: 2,
    retryDelay: 3000
  }
};

/**
 * Detect current environment
 * @returns {string} 'development' or 'production'
 */
function detectEnvironment() {
  // Check if running on localhost
  if (window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '') {
    return 'development';
  }
  
  // Check for explicit environment variable
  if (typeof process !== 'undefined' && process.env.NODE_ENV) {
    return process.env.NODE_ENV;
  }
  
  // Default to production
  return 'production';
}

/**
 * Get current configuration based on environment
 * @returns {Object} Configuration object
 */
function getConfig() {
  const env = detectEnvironment();
  return DEFAULT_CONFIG[env] || DEFAULT_CONFIG.development;
}

/**
 * Get API base URL
 * @returns {string} Base URL for API requests
 */
function getApiUrl() {
  return getConfig().apiBaseUrl;
}

/**
 * Get full API endpoint URL
 * @param {string} endpoint - API endpoint path (e.g., '/api/prakriti/analyze')
 * @returns {string} Full URL
 */
function getEndpointUrl(endpoint) {
  const baseUrl = getApiUrl();
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
}

/**
 * Get timeout configuration
 * @returns {number} Timeout in milliseconds
 */
function getTimeout() {
  return getConfig().timeout;
}

/**
 * Get retry configuration
 * @returns {Object} Retry configuration
 */
function getRetryConfig() {
  const config = getConfig();
  return {
    attempts: config.retryAttempts,
    delay: config.retryDelay
  };
}

/**
 * Check if running in development mode
 * @returns {boolean}
 */
function isDevelopment() {
  return detectEnvironment() === 'development';
}

/**
 * Log API configuration (development only)
 */
function logConfig() {
  if (isDevelopment()) {
    console.log('[AyurTime API Config]', {
      environment: detectEnvironment(),
      apiBaseUrl: getApiUrl(),
      timeout: getTimeout(),
      retry: getRetryConfig()
    });
  }
}

// Auto-log configuration on load (dev only)
logConfig();

// Export for use in other modules
window.AyurTimeAPI = window.AyurTimeAPI || {};
window.AyurTimeAPI.config = {
  getApiUrl,
  getEndpointUrl,
  getTimeout,
  getRetryConfig,
  isDevelopment,
  getConfig
};
