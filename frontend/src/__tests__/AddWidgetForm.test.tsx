import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddWidgetForm from "../components/AddWidgetForm";

// Mock the API
jest.mock("../utils/api", () => ({
  widgetsApi: {
    create: jest.fn(),
  },
}));

import { widgetsApi } from "../utils/api";

const mockCreate = widgetsApi.create as jest.MockedFunction<
  typeof widgetsApi.create
>;

describe("AddWidgetForm", () => {
  beforeEach(() => {
    mockCreate.mockClear();
  });

  test("renders form elements correctly", () => {
    render(<AddWidgetForm />);

    expect(screen.getByLabelText(/city name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter city name/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add widget/i }),
    ).toBeInTheDocument();
  });

  test("disables submit button for empty location", () => {
    render(<AddWidgetForm />);

    const submitButton = screen.getByRole("button", { name: /add widget/i });

    expect(submitButton).toBeDisabled();
  });

  test("submits form with valid location", async () => {
    const user = userEvent.setup();
    const mockOnWidgetAdded = jest.fn();

    mockCreate.mockResolvedValueOnce({
      _id: "123",
      location: "Berlin",
      createdAt: new Date().toISOString(),
    });

    render(<AddWidgetForm onWidgetAdded={mockOnWidgetAdded} />);

    const input = screen.getByLabelText(/city name/i);
    const submitButton = screen.getByRole("button", { name: /add widget/i });

    await user.type(input, "Berlin");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({ location: "Berlin" });
    });

    expect(mockOnWidgetAdded).toHaveBeenCalled();
    expect(
      screen.getByText(/widget for berlin added successfully/i),
    ).toBeInTheDocument();
  });

  test("shows error when API call fails", async () => {
    const user = userEvent.setup();

    mockCreate.mockRejectedValueOnce(new Error("API Error"));

    render(<AddWidgetForm />);

    const input = screen.getByLabelText(/city name/i);
    const submitButton = screen.getByRole("button", { name: /add widget/i });

    await user.type(input, "Berlin");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/api error/i)).toBeInTheDocument();
    });
  });

  test("handles duplicate widget error", async () => {
    const user = userEvent.setup();

    const error = new Error("Widget already exists");
    error.status = 409;
    mockCreate.mockRejectedValueOnce(error);

    render(<AddWidgetForm />);

    const input = screen.getByLabelText(/city name/i);
    const submitButton = screen.getByRole("button", { name: /add widget/i });

    await user.type(input, "Berlin");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/widget already exists/i)).toBeInTheDocument();
    });
  });

  test("enables submit button when input has value", async () => {
    const user = userEvent.setup();
    render(<AddWidgetForm />);

    const input = screen.getByLabelText(/city name/i);
    const submitButton = screen.getByRole("button", { name: /add widget/i });

    // Initially disabled
    expect(submitButton).toBeDisabled();

    // Enable after typing
    await user.type(input, "Berlin");
    expect(submitButton).not.toBeDisabled();

    // Disable again when clearing
    await user.clear(input);
    expect(submitButton).toBeDisabled();
  });

  test("disables submit button when loading", async () => {
    const user = userEvent.setup();

    // Mock a slow API call
    mockCreate.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    render(<AddWidgetForm />);

    const input = screen.getByLabelText(/city name/i);
    const submitButton = screen.getByRole("button", { name: /add widget/i });

    await user.type(input, "Berlin");
    await user.click(submitButton);

    expect(screen.getByRole("button", { name: /adding/i })).toBeDisabled();
  });
});
