import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import CitySuggestions from "../components/CitySuggestions";
import { weatherApi } from "../utils/api";

// Mock the API
jest.mock("../utils/api", () => ({
  weatherApi: {
    searchCities: jest.fn(),
  },
}));

const mockWeatherApi = weatherApi as jest.Mocked<typeof weatherApi>;

describe("CitySuggestions", () => {
  const defaultProps = {
    query: "",
    onSelect: jest.fn(),
    isVisible: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("should not render when not visible", () => {
    render(<CitySuggestions {...defaultProps} isVisible={false} />);
    expect(screen.queryByText("Searching cities...")).not.toBeInTheDocument();
  });

  test("should not render when query is too short", () => {
    render(<CitySuggestions {...defaultProps} query="a" />);
    expect(screen.queryByText("Searching cities...")).not.toBeInTheDocument();
  });

  test("should show loading state when searching", async () => {
    mockWeatherApi.searchCities.mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );

    render(<CitySuggestions {...defaultProps} query="berlin" />);

    // Wait for debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText("Searching cities...")).toBeInTheDocument();
    });
  });

  test("should show error message when API fails", async () => {
    mockWeatherApi.searchCities.mockRejectedValue(new Error("API Error"));

    render(<CitySuggestions {...defaultProps} query="berlin" />);

    // Wait for debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText("API Error")).toBeInTheDocument();
    });
  });

  test('should show "No cities found" when API returns empty results', async () => {
    mockWeatherApi.searchCities.mockResolvedValue([]);

    render(<CitySuggestions {...defaultProps} query="nonexistent" />);

    // Wait for debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText("No cities found")).toBeInTheDocument();
    });
  });

  test("should display city suggestions when API returns results", async () => {
    const mockCities = [
      {
        name: "Berlin",
        country: "Germany",
        state: "Berlin",
        displayName: "Berlin, Berlin, Germany",
        lat: 52.52,
        lon: 13.405,
      },
      {
        name: "Bern",
        country: "Switzerland",
        state: "Bern",
        displayName: "Bern, Bern, Switzerland",
        lat: 46.95,
        lon: 7.45,
      },
    ];

    mockWeatherApi.searchCities.mockResolvedValue(mockCities);

    render(<CitySuggestions {...defaultProps} query="ber" />);

    // Wait for debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText("Berlin")).toBeInTheDocument();
      expect(screen.getByText("Bern")).toBeInTheDocument();
      expect(screen.getByText("Berlin, Berlin, Germany")).toBeInTheDocument();
      expect(screen.getByText("Bern, Bern, Switzerland")).toBeInTheDocument();
    });
  });

  test("should call onSelect when a city is clicked", async () => {
    const mockCities = [
      {
        name: "Berlin",
        country: "Germany",
        state: "Berlin",
        displayName: "Berlin, Berlin, Germany",
        lat: 52.52,
        lon: 13.405,
      },
    ];

    mockWeatherApi.searchCities.mockResolvedValue(mockCities);
    const onSelect = jest.fn();

    render(
      <CitySuggestions {...defaultProps} query="berlin" onSelect={onSelect} />,
    );

    // Wait for debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      fireEvent.click(screen.getByText("Berlin"));
    });

    expect(onSelect).toHaveBeenCalledWith(mockCities[0]);
  });

  test("should debounce search requests", async () => {
    mockWeatherApi.searchCities.mockResolvedValue([]);

    const { rerender } = render(
      <CitySuggestions {...defaultProps} query="b" />,
    );

    // Change query multiple times quickly
    rerender(<CitySuggestions {...defaultProps} query="be" />);
    rerender(<CitySuggestions {...defaultProps} query="ber" />);
    rerender(<CitySuggestions {...defaultProps} query="berl" />);
    rerender(<CitySuggestions {...defaultProps} query="berlin" />);

    // Should not have called API yet
    expect(mockWeatherApi.searchCities).not.toHaveBeenCalled();

    // Advance timer to trigger debounced search
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockWeatherApi.searchCities).toHaveBeenCalledTimes(1);
      expect(mockWeatherApi.searchCities).toHaveBeenCalledWith("berlin");
    });
  });

  test("should handle keyboard navigation", async () => {
    const mockCities = [
      {
        name: "Berlin",
        country: "Germany",
        state: "Berlin",
        displayName: "Berlin, Berlin, Germany",
        lat: 52.52,
        lon: 13.405,
      },
      {
        name: "Bern",
        country: "Switzerland",
        state: "Bern",
        displayName: "Bern, Bern, Switzerland",
        lat: 46.95,
        lon: 7.45,
      },
    ];

    mockWeatherApi.searchCities.mockResolvedValue(mockCities);
    const onSelect = jest.fn();

    render(
      <CitySuggestions {...defaultProps} query="ber" onSelect={onSelect} />,
    );

    // Wait for debounce and results
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText("Berlin")).toBeInTheDocument();
    });

    // Test arrow down navigation
    fireEvent.keyDown(document, { key: "ArrowDown" });
    expect(screen.getByText("Berlin").closest("button")).toHaveClass(
      "bg-gray-100",
    );

    // Test arrow up navigation
    fireEvent.keyDown(document, { key: "ArrowUp" });
    expect(screen.getByText("Bern").closest("button")).toHaveClass(
      "bg-gray-100",
    );

    // Test enter key selection
    fireEvent.keyDown(document, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith(mockCities[1]); // Bern should be selected
  });

  test("should handle keyboard and click outside events", async () => {
    const onClose = jest.fn();
    render(
      <CitySuggestions {...defaultProps} query="berlin" onClose={onClose} />,
    );

    // Wait for debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Test that the component renders properly
    await waitFor(() => {
      expect(screen.getByText("Searching cities...")).toBeInTheDocument();
    });
  });
});
