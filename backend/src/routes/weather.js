const express = require('express');
const { getWeatherForLocation } = require('../services/weather');

const router = express.Router();

/**
 * Get weather for a location
 * GET /weather?location=Berlin
 */
router.get('/', async (req, res, next) => {
  try {
    const { location } = req.query;
    
    // Validate location parameter
    if (!location || typeof location !== 'string' || !location.trim()) {
      return res.status(400).json({
        error: 'Location query parameter is required and must be a non-empty string'
      });
    }
    
    // Get weather data
    const weatherData = await getWeatherForLocation(location.trim());
    
    res.json(weatherData);
    
  } catch (error) {
    console.error('Weather route error:', error);
    
    // Return user-friendly error
    res.status(500).json({
      error: error.message || 'Failed to fetch weather data'
    });
  }
});

module.exports = router;
