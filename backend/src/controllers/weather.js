const { getWeatherForLocation, searchCities } = require('../services/weather');

module.exports = {
  getWeatherForLocation: async (req, res) => {
    try {
      const { location } = req.query;

      if (!location || typeof location !== 'string' || !location.trim()) {
        return res.status(400).json({
          error:
            'Location query parameter is required and must be a non-empty string',
        });
      }

      const weatherData = await getWeatherForLocation(location.trim());

      res.status(200).json(weatherData);
    } catch (error) {
      console.error('Weather route error:', error);
      res.status(500).json({
        error: error.message || 'Failed to fetch weather data',
      });
    }
  },

  searchCities: async (req, res) => {
    try {
      const { q } = req.query;
      const cities = await searchCities(q);
      res.status(200).json(cities);
    } catch (error) {
      console.error('City search error:', error);
      res.status(500).json({
        error: error.message || 'Failed to search cities',
      });
    }
  },
};
