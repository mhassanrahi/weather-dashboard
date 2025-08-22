# Weather Widgets Dashboard

A simple dashboard application for managing weather widgets for different cities. Users can add multiple weather widgets, view live weather data, and remove widgets as needed.

## Demo
You can try out the fully deployed Weather Widgets Dashboard here: [https://weather-tecomon.vercel.app](https://weather-tecomon.vercel.app).

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB running locally
- npm

### Setup

1. **Clone and navigate to project:**
   ```bash
   git clone <repo-url>
   cd weather-dashboard
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Setup Frontend:**
   ```bash
   cd frontend
   npm install
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🌡️ Features

- **Add Weather Widgets**: Create widgets for different cities
- **Live Weather Data**: Fetches current weather from external APIs
- **Smart Caching**: 5-minute cache to reduce API calls
- **Remove Widgets**: Delete unwanted widgets
- **Auto-refresh**: Weather updates every 60 seconds

## 🛠️ Technology Stack

- **Frontend**: Next.js (App Router), React 19, Tailwind CSS v4
- **Backend**: Node.js, Express.js, MongoDB
- **Weather APIs**: Open-Meteo
- **Caching**: In-memory cache with TTL
- **Testing**: Jest, React Testing Library
- **Linting**: ESLint v9+, Prettier

## 📁 Project Structure

```
weather-dashboard/
├── frontend/              # Next.js application (App Router)
│   ├── src/
│   │   ├── app/          # App Router pages and layouts
│   │   │   ├── layout.tsx    # Root layout
│   │   │   └── page.tsx      # Home page
│   │   ├── components/   # Reusable UI components
│   │   ├── utils/        # Utility functions and API
│   │   ├── styles/       # Global styles
│   │   └── __tests__/    # Test files
│   ├── public/           # Static assets
│   └── package.json
├── backend/              # Express.js API
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── controllers/ # Route handlers
│   │   ├── models/      # Database models
│   │   ├── services/    # Business logic
│   │   ├── config.js    # Configuration
│   │   └── index.js     # Application entry
│   ├── tests/           # Backend tests
│   └── package.json
└── README.md
```

## 🔧 Environment Variables

### Backend (.env)
```
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/widgets

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Weather Cache Configuration
WEATHER_CACHE_TTL_MS=300000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/widgets` | Get all widgets |
| POST | `/widgets` | Create new widget |
| DELETE | `/widgets/:id` | Delete widget |
| GET | `/weather?location=` | Get weather for location |

## 🧪 Development

### Running Tests
```bash
# Backend
cd backend && npm test

# Frontend  
cd frontend && npm test
```

### Linting & Formatting
```bash
# Backend
cd backend && npm run lint && npm run format

# Frontend
cd frontend && npm run lint && npm run format
```

## 📈 Caching Strategy

Weather data is cached for 5 minutes to optimize API usage:
- Cache key: Normalized city name
- Cache value: Weather data + timestamp
- Cache miss: Fetch from external API
- Cache hit: Return cached data (marked with `source: "cache"`)

## 🌐 Weather Data Sources

Open-Meteo (free, no API key required)

Data is normalized to a consistent format regardless of source.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License
