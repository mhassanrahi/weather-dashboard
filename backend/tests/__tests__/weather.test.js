const { getWeatherForLocation, normalizeLocation } = require('../../src/services/weather');

describe('Weather Service', () => {
  describe('normalizeLocation', () => {
    test('should normalize location to title case', () => {
      expect(normalizeLocation('berlin')).toBe('Berlin');
      expect(normalizeLocation('NEW YORK')).toBe('New York');
      expect(normalizeLocation('los angeles')).toBe('Los Angeles');
      expect(normalizeLocation('  paris  ')).toBe('Paris');
    });

    test('should handle invalid inputs', () => {
      expect(normalizeLocation('')).toBe('');
      expect(normalizeLocation(null)).toBe('');
      expect(normalizeLocation(undefined)).toBe('');
      expect(normalizeLocation(123)).toBe('');
    });
  });

  describe('getWeatherForLocation', () => {
    test('should throw error for invalid location', async () => {
      await expect(getWeatherForLocation('')).rejects.toThrow('Location is required');
      await expect(getWeatherForLocation(null)).rejects.toThrow('Location is required');
    });

    // Note: These tests would require valid API keys and internet connection
    // In a real environment, you would mock the fetch calls or use test fixtures
    test('should handle API errors gracefully', async () => {
      // This test expects the API to fail (no API keys in test environment)
      await expect(getWeatherForLocation('NonExistentCity123')).rejects.toThrow();
    });
  });
});
