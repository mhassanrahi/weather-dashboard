const express = require('express');
const {
  getWeatherForLocation,
  searchCities,
} = require('../controllers/weather');

const router = express.Router();

/**
 * Search for cities
 * GET /weather/search?q=Berlin
 */
router.get('/search', searchCities);

/**
 * Get weather for a location
 * GET /weather?location=Berlin
 */
router.get('/', getWeatherForLocation);

module.exports = router;
