const config = require('../config');

// In-memory cache with TTL
const weatherCache = new Map();

/**
 * Normalize location name for consistent caching
 */
const normalizeLocation = (location) => {
  if (!location || typeof location !== 'string') {
    return '';
  }

  return location
    .trim()
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Check if cached data is still fresh
 */
const isCacheValid = (cacheEntry) => {
  if (!cacheEntry) return false;

  const now = Date.now();
  const cacheAge = now - cacheEntry.fetchedAt;
  return cacheAge < config.weatherCacheTtlMs;
};

/**
 * Get weather data from cache if valid
 */
const getCachedWeather = (location) => {
  const normalizedLocation = normalizeLocation(location);
  const cacheKey = normalizedLocation.toLowerCase();
  const cacheEntry = weatherCache.get(cacheKey);

  if (cacheEntry && isCacheValid(cacheEntry)) {
    return {
      ...cacheEntry.data,
      source: 'cache',
    };
  }

  return null;
};

/**
 * Store weather data in cache
 */
const cacheWeatherData = (location, weatherData) => {
  const normalizedLocation = normalizeLocation(location);
  const cacheKey = normalizedLocation.toLowerCase();

  weatherCache.set(cacheKey, {
    data: weatherData,
    fetchedAt: Date.now(),
  });
};

/**
 * Resolve latitude and longitude from city name using Open-Meteo Geocoding
 */
const resolveLatLonOpenMeteo = async (location) => {
  try {
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;

    const response = await fetch(geocodingUrl);
    if (!response.ok) {
      throw new Error(`Open-Meteo geocoding failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error('Location not found in Open-Meteo');
    }

    const result = data.results[0];
    return {
      lat: result.latitude,
      lon: result.longitude,
      name: result.name,
      country: result.country,
    };
  } catch (error) {
    console.warn('Open-Meteo geocoding failed:', error.message);
    throw error;
  }
};

/**
 * Resolve coordinates
 */
const resolveLatLon = async (location) => {
  try {
    return await resolveLatLonOpenMeteo(location);
  } catch (error) {
    console.warn('Open-Meteo geocoding failed:', error.message);
    throw error;
  }
};

/**
 * Fetch weather data from Open-Meteo
 */
const fetchWeatherOpenMeteo = async (lat, lon) => {
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&wind_speed_unit=kmh`;

    const response = await fetch(weatherUrl);
    if (!response.ok) {
      throw new Error(`Open-Meteo weather API failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.current) {
      throw new Error('Invalid Open-Meteo weather response');
    }

    const current = data.current;

    // Map weather codes to descriptions (simplified)
    const getWeatherCondition = (code) => {
      const weatherCodes = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Fog',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        71: 'Slight snow fall',
        73: 'Moderate snow fall',
        75: 'Heavy snow fall',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail',
      };

      return weatherCodes[code] || 'Unknown';
    };

    return {
      temperature: current.temperature_2m,
      unit: '°C',
      conditions: getWeatherCondition(current.weather_code),
      windKph: current.wind_speed_10m,
      humidity: current.relative_humidity_2m,
      source: 'open-meteo',
    };
  } catch (error) {
    console.warn('Open-Meteo weather fetch failed:', error.message);
    throw error;
  }
};

/**
 * Fetch weather
 */
const fetchWeather = async (lat, lon) => {
  try {
    // Try Open-Meteo first
    return await fetchWeatherOpenMeteo(lat, lon);
  } catch (error) {
    console.warn('Open-Meteo weather fetch failed:', error.message);
    throw error;
  }
};

/**
 * Get weather for a location (main service function)
 */
const getWeatherForLocation = async (location) => {
  if (!location || typeof location !== 'string') {
    throw new Error('Location is required and must be a string');
  }

  const normalizedLocation = normalizeLocation(location);

  // Check cache first
  const cachedWeather = getCachedWeather(normalizedLocation);
  if (cachedWeather) {
    console.log(`Returning cached weather for ${normalizedLocation}`);
    return cachedWeather;
  }

  try {
    console.log(`Fetching fresh weather data for ${normalizedLocation}`);

    // Resolve coordinates
    const { lat, lon, name } = await resolveLatLon(normalizedLocation);

    // Fetch weather data
    const weatherData = await fetchWeather(lat, lon);

    // Create response object
    const response = {
      location: name || normalizedLocation,
      temperature: parseFloat(weatherData.temperature.toFixed(1)),
      unit: weatherData.unit,
      conditions: weatherData.conditions,
      windKph: parseFloat(weatherData.windKph.toFixed(1)),
      humidity: weatherData.humidity,
      fetchedAt: new Date().toISOString(),
      source: weatherData.source,
    };

    // Cache the response
    cacheWeatherData(normalizedLocation, response);

    return response;
  } catch (error) {
    console.error(
      `Weather fetch failed for ${normalizedLocation}:`,
      error.message
    );

    // Return a friendly error response
    throw new Error(
      `Unable to fetch weather data for ${normalizedLocation}. Please try again later.`
    );
  }
};

/**
 * Clear expired cache entries (optional cleanup)
 */
const clearExpiredCache = () => {
  const now = Date.now();
  for (const [key, entry] of weatherCache.entries()) {
    if (now - entry.fetchedAt >= config.weatherCacheTtlMs) {
      weatherCache.delete(key);
    }
  }
};

// Optional: Clear expired cache every hour
setInterval(clearExpiredCache, 60 * 60 * 1000);

/**
 * Search for cities using geocoding APIs
 */
const searchCities = async (query) => {
  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    return [];
  }

  const searchQuery = query.trim();

  try {
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=5&language=en&format=json`;

    const response = await fetch(geocodingUrl);
    if (!response.ok) {
      throw new Error(`Open-Meteo geocoding failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return [];
    }

    // Format and return city suggestions
    return data.results.map((result) => ({
      name: result.name,
      country: result.country,
      state: result.admin1,
      displayName: `${result.name}${result.admin1 ? `, ${result.admin1}` : ''}, ${result.country}`,
      lat: result.latitude,
      lon: result.longitude,
    }));
  } catch (error) {
    console.warn('City search failed:', error.message);
    return [];
  }
};

module.exports = {
  getWeatherForLocation,
  normalizeLocation,
  clearExpiredCache,
  searchCities,
};
