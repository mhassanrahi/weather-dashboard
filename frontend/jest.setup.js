import '@testing-library/jest-dom'

// Mock environment variables
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:5000'

// Mock fetch
global.fetch = jest.fn()

// Mock window.confirm
global.confirm = jest.fn(() => true)

// Mock window.alert
global.alert = jest.fn()

beforeEach(() => {
  fetch.mockClear()
  confirm.mockClear()
  alert.mockClear()
})
