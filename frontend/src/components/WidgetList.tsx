import { useState, useEffect } from 'react';
import { Widget, widgetsApi, ApiError } from '../utils/api';
import WidgetCard from './WidgetCard';

export default function WidgetList() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch widgets from API
  const fetchWidgets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await widgetsApi.getAll();
      setWidgets(data);
    } catch (err) {
      const error = err as ApiError;
      setError(error.message || 'Failed to load widgets');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchWidgets();
  }, []);

  // Handle widget deletion
  const handleWidgetDeleted = () => {
    fetchWidgets();
  };

  // Handle new widget added
  const handleWidgetAdded = () => {
    fetchWidgets();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600">Loading widgets...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-lg font-medium text-red-800">Failed to load widgets</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
        <button
          onClick={fetchWidgets}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (widgets.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No widgets yet</h3>
        <p className="text-gray-600 mb-4">
          Add your first weather widget to get started!
        </p>
        <button
          onClick={fetchWidgets}
          className="text-blue-600 hover:text-blue-800 text-sm underline"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Your Weather Widgets ({widgets.length})
        </h2>
        <button
          onClick={fetchWidgets}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {widgets.map((widget) => (
          <WidgetCard
            key={widget._id}
            widget={widget}
            onDelete={handleWidgetDeleted}
          />
        ))}
      </div>
    </div>
  );
}

// Export the refresh handler for use in parent components
export { WidgetList };
