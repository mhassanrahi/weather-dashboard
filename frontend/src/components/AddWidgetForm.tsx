import { useState } from "react";
import { widgetsApi, ApiError, CitySuggestion } from "../utils/api";
import CitySuggestions from "./CitySuggestions";

interface AddWidgetFormProps {
  onWidgetAdded?: () => void;
}

export default function AddWidgetForm({ onWidgetAdded }: AddWidgetFormProps) {
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location.trim()) {
      setError("Please enter a location");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await widgetsApi.create({ location: location.trim() });
      setSuccess(`Widget for ${location.trim()} added successfully!`);
      setLocation("");
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

      // Notify parent component to refresh the list
      if (onWidgetAdded) {
        onWidgetAdded();
      }
    } catch (err) {
      const error = err as ApiError;
      setError(error.message || "Failed to add widget");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear messages when user starts typing
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
    setError(null);
    setSuccess(null);
    setShowSuggestions(true);
  };

  // Handle city selection from suggestions
  const handleCitySelect = (city: CitySuggestion) => {
    setLocation(city.name);
    setShowSuggestions(false);
  };

  // Handle closing suggestions
  const handleCloseSuggestions = () => {
    setShowSuggestions(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
        Add Weather Widget
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            City Name
          </label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                id="location"
                value={location}
                onChange={handleLocationChange}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Start typing a city name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
                autoComplete="off"
              />
              <CitySuggestions
                query={location}
                onSelect={handleCitySelect}
                isVisible={showSuggestions}
                onClose={handleCloseSuggestions}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !location.trim()}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Adding..." : "Add Widget"}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Success Message for some time */}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}
      </form>
    </div>
  );
}
