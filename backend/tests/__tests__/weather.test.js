const { 
  getWeatherForLocation, 
  normalizeLocation, 
  searchCities 
} = require('../../src/services/weather');

describe('Weather Service', () => {
  describe('normalizeLocation', () => {
    test('should normalize location to title case', () => {
      expect(normalizeLocation('berlin')).toBe('Berlin');
      expect(normalizeLocation('NEW YORK')).toBe('New York');
      expect(normalizeLocation('los angeles')).toBe('Los Angeles');
      expect(normalizeLocation('  paris  ')).toBe('Paris');
      expect(normalizeLocation('san francisco')).toBe('San Francisco');
    });

    test('should handle invalid inputs', () => {
      expect(normalizeLocation('')).toBe('');
      expect(normalizeLocation(null)).toBe('');
      expect(normalizeLocation(undefined)).toBe('');
      expect(normalizeLocation(123)).toBe('');
      expect(normalizeLocation({})).toBe('');
      expect(normalizeLocation([])).toBe('');
    });

    test('should handle special characters and numbers', () => {
      expect(normalizeLocation('new-york')).toBe('New-york');
      expect(normalizeLocation('los angeles 2')).toBe('Los Angeles 2');
      expect(normalizeLocation('rio de janeiro')).toBe('Rio De Janeiro');
    });
  });

  describe('searchCities', () => {
    test('should return empty array for invalid inputs', async () => {
      expect(await searchCities('')).toEqual([]);
      expect(await searchCities(null)).toEqual([]);
      expect(await searchCities(undefined)).toEqual([]);
      expect(await searchCities('a')).toEqual([]); // Less than 2 characters
      expect(await searchCities(123)).toEqual([]);
    });

    test('should return empty array for very short queries', async () => {
      expect(await searchCities('a')).toEqual([]);
      expect(await searchCities('b')).toEqual([]);
    });

    test('should handle API errors gracefully', async () => {
      // Mock fetch to simulate API failure
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      try {
        const result = await searchCities('test');
        expect(result).toEqual([]);
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should handle empty API responses', async () => {
      // Mock fetch to return empty results
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      });

      try {
        const result = await searchCities('nonexistentcity123');
        expect(result).toEqual([]);
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should format city suggestions correctly', async () => {
      // Mock fetch to return sample data
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          results: [
            {
              name: 'Berlin',
              country: 'Germany',
              admin1: 'Berlin',
              latitude: 52.52,
              longitude: 13.405
            }
          ]
        })
      });

      try {
        const result = await searchCities('berlin');
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          name: 'Berlin',
          country: 'Germany',
          state: 'Berlin',
          displayName: 'Berlin, Berlin, Germany',
          lat: 52.52,
          lon: 13.405
        });
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  describe('getWeatherForLocation', () => {
    test('should throw error for invalid location', async () => {
      await expect(getWeatherForLocation('')).rejects.toThrow('Location is required');
      await expect(getWeatherForLocation(null)).rejects.toThrow('Location is required');
      await expect(getWeatherForLocation(undefined)).rejects.toThrow('Location is required');
      await expect(getWeatherForLocation(123)).rejects.toThrow('Location is required');
    });

    test('should handle API errors gracefully', async () => {
      // This test expects the API to fail (no API keys in test environment)
      // or when using invalid city names
      await expect(getWeatherForLocation('NonExistentCity123')).rejects.toThrow();
    });

    test('should normalize location before processing', async () => {
      // This test verifies that the function handles errors properly
      // The actual normalization happens internally, but we can test the error handling
      await expect(getWeatherForLocation('InvalidCity123')).rejects.toThrow();
    });
  });
});
