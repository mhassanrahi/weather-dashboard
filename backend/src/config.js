const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const config = {
  // Server configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database configuration
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/widgets',
  
  // Weather API configuration
  openweatherApiKey: process.env.OPENWEATHER_API_KEY,
  weatherCacheTtlMs: parseInt(process.env.WEATHER_CACHE_TTL_MS) || 300000, // 5 minutes
  
  // CORS configuration
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

module.exports = config;
