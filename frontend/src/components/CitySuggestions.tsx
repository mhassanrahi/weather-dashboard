"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { CitySuggestion, weatherApi, ApiError } from "../utils/api";

interface CitySuggestionsProps {
  query: string;
  onSelect: (city: CitySuggestion) => void;
  isVisible: boolean;
  onClose: () => void;
}

export default function CitySuggestions({
  query,
  onSelect,
  isVisible,
  onClose,
}: CitySuggestionsProps) {
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  const searchCities = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await weatherApi.searchCities(searchQuery);
      setSuggestions(results);
    } catch (err) {
      const error = err as ApiError;
      setError(error.message || "Failed to search cities");
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.trim().length >= 2) {
      timeoutRef.current = setTimeout(() => {
        searchCities(query.trim());
      }, 300); // 300ms debounce
    } else {
      setSuggestions([]);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, searchCities]);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible || suggestions.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1,
          );
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            onSelect(suggestions[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, suggestions, selectedIndex, onSelect, onClose]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
    >
      {isLoading && (
        <div className="p-3 text-center text-gray-500">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <span className="ml-2">Searching cities...</span>
        </div>
      )}

      {error && (
        <div className="p-3 text-center text-red-600 text-sm">{error}</div>
      )}

      {suggestions.length > 0 && (
        <ul className="py-1">
          {suggestions.map((city, index) => (
            <li key={`${city.name}-${city.country}-${index}`}>
              <button
                type="button"
                onClick={() => onSelect(city)}
                className={`w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors ${
                  index === selectedIndex ? "bg-gray-100" : ""
                }`}
              >
                <div className="font-medium text-gray-900">{city.name}</div>
                <div className="text-sm text-gray-500">{city.displayName}</div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {!isLoading &&
        !error &&
        suggestions.length === 0 &&
        query.trim().length >= 2 && (
          <div className="p-3 text-center text-gray-500 text-sm">
            No cities found
          </div>
        )}
    </div>
  );
}
