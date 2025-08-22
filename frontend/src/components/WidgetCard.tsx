import { useState, useEffect, useCallback } from "react";
import {
  Widget,
  WeatherData,
  weatherApi,
  widgetsApi,
  ApiError,
} from "../utils/api";

interface WidgetCardProps {
  widget: Widget;
  onDelete?: () => void;
}

export default function WidgetCard({ widget, onDelete }: WidgetCardProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Fetch weather data
  const fetchWeather = useCallback(async () => {
    try {
      setIsLoadingWeather(true);
      setWeatherError(null);
      const weatherData = await weatherApi.getWeather(widget.location);
      setWeather(weatherData);
    } catch (err) {
      const error = err as ApiError;
      setWeatherError(error.message || "Failed to load weather data");
    } finally {
      setIsLoadingWeather(false);
    }
  }, [widget.location]);

  // Initial weather fetch
  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  // Auto-refresh weather every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchWeather, 60000); // 60 seconds
    return () => clearInterval(interval);
  }, [widget.location, fetchWeather]);

  // Handle widget deletion
  const handleDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete the widget for ${widget.location}?`,
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await widgetsApi.delete(widget._id);
      if (onDelete) {
        onDelete();
      }
    } catch (err) {
      const error = err as ApiError;
      alert(`Failed to delete widget: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Get source badge color
  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case "cache":
        return "bg-gray-100 text-gray-800";
      case "open-meteo":
        return "bg-blue-100 text-blue-800";
      case "openweather":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {widget.location}
          </h3>
          <p className="text-sm text-gray-500">
            Added {formatDate(widget.createdAt)}
          </p>
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
          title="Delete widget"
        >
          {isDeleting ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Weather Content */}
      <div className="space-y-3">
        {isLoadingWeather ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Loading weather...</span>
          </div>
        ) : weatherError ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-400 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-red-600">{weatherError}</p>
            </div>
            <button
              onClick={fetchWeather}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        ) : weather ? (
          <>
            {/* Temperature */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-gray-900">
                  {weather.temperature}
                </span>
                <span className="text-lg text-gray-600 ml-1">
                  {weather.unit}
                </span>
              </div>
              <div className="text-right">
                <p className="text-lg font-medium text-gray-900 capitalize">
                  {weather.conditions}
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10l1 1v13a2 2 0 01-2 2H8a2 2 0 01-2-2V5l1-1z"
                  />
                </svg>
                <span>Wind: {weather.windKph} km/h</span>
              </div>
              {weather.humidity && (
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 004-4V4a3 3 0 00-6 0v8a4 4 0 004 4z"
                    />
                  </svg>
                  <span>Humidity: {weather.humidity}%</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                Updated: {formatDate(weather.fetchedAt)}
              </span>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getSourceBadgeColor(weather.source)}`}
              >
                via {weather.source}
              </span>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
