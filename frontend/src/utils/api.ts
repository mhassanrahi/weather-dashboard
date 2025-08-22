// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// API Error type
export interface ApiError extends Error {
  status?: number;
  data?: any;
}

// Widget types
export interface Widget {
  _id: string;
  location: string;
  createdAt: string;
}

export interface CreateWidgetRequest {
  location: string;
}

// Weather types
export interface WeatherData {
  location: string;
  temperature: number;
  unit: string;
  conditions: string;
  windKph: number;
  humidity?: number;
  fetchedAt: string;
  source: 'open-meteo' | 'openweather' | 'cache';
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: 'An unexpected error occurred' };
      }
      
      const error = new Error(errorData.error || `HTTP ${response.status}`) as ApiError;
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return null as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const fetchError = new Error('Unable to connect to the server. Please check your connection.') as ApiError;
      throw fetchError;
    }
    throw error;
  }
}

// Widget API functions
export const widgetsApi = {
  // Get all widgets
  getAll: (): Promise<Widget[]> => 
    apiRequest<Widget[]>('/widgets'),

  // Create a new widget
  create: (data: CreateWidgetRequest): Promise<Widget> => 
    apiRequest<Widget>('/widgets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Delete a widget
  delete: (id: string): Promise<null> => 
    apiRequest<null>(`/widgets/${id}`, {
      method: 'DELETE',
    }),

  // Get a single widget
  getById: (id: string): Promise<Widget> => 
    apiRequest<Widget>(`/widgets/${id}`),
};

// Weather API functions
export const weatherApi = {
  // Get weather for a location
  getWeather: (location: string): Promise<WeatherData> => 
    apiRequest<WeatherData>(`/weather?location=${encodeURIComponent(location)}`),
};

// Health check
export const healthApi = {
  check: (): Promise<{ ok: boolean; timestamp: string; environment: string; version: string }> =>
    apiRequest('/health'),
};
