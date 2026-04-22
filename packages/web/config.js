// Environment-aware configuration for AyurTime frontend
// Detects environment and provides appropriate API endpoints

const config = {
  // Determine current environment
  getEnvironment() {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development';
    } else if (hostname.includes('staging')) {
      return 'staging';
    } else {
      return 'production';
    }
  },

  // API Base URLs for each environment
  apiBaseUrls: {
    development: 'http://localhost:5000',
    staging: 'https://staging-api.ayurtime.com',
    production: 'https://api.ayurtime.com'
  },

  // Get current API base URL
  getApiBaseUrl() {
    const env = this.getEnvironment();
    return this.apiBaseUrls[env];
  },

  // API endpoints
  endpoints: {
    prakritiAnalyze: '/api/prakriti/analyze'
  },

  // Get full API URL for an endpoint
  getApiUrl(endpoint) {
    return this.getApiBaseUrl() + this.endpoints[endpoint];
  },

  // Timeout settings (ms)
  timeout: {
    api: 10000,  // 10 seconds for API calls
    retry: 3000  // 3 seconds between retries
  },

  // Feature flags
  features: {
    enableAnalytics: false,  // Disable analytics for MVP
    enableOfflineMode: false,  // Future feature
    enableDebugLogging: true  // Enable for development
  }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
}

// Make available globally for inline scripts
window.AyurTimeConfig = config;
