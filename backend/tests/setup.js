// Jest setup file
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/widgets_test';
process.env.PORT = 5001;
process.env.WEATHER_CACHE_TTL_MS = 1000; // 1 second for faster testing
