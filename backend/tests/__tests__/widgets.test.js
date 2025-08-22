const request = require('supertest');
const mongoose = require('mongoose');
const Widget = require('../../src/models/Widget');

// Create a test app without starting the server
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('../../src/config');
const widgetRoutes = require('../../src/routes/widgets');

const createTestApp = () => {
  const app = express();
  
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  
  app.use('/widgets', widgetRoutes);
  
  // Error handler
  app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({ error: message });
  });
  
  return app;
};

describe('Widgets API', () => {
  let app;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
    // Create test app
    app = createTestApp();
  });

  beforeEach(async () => {
    // Clear test database before each test
    await Widget.deleteMany({});
  });

  afterAll(async () => {
    // Clean up and close connection
    await Widget.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /widgets', () => {
    test('should create a new widget with valid location', async () => {
      const response = await request(app)
        .post('/widgets')
        .send({ location: 'Berlin' })
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.location).toBe('Berlin');
      expect(response.body).toHaveProperty('createdAt');
    });

    test('should normalize location to title case', async () => {
      const response = await request(app)
        .post('/widgets')
        .send({ location: 'berlin' })
        .expect(201);

      expect(response.body.location).toBe('Berlin');
    });

    test('should reject empty location', async () => {
      const response = await request(app)
        .post('/widgets')
        .send({ location: '' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should reject duplicate location', async () => {
      // Create first widget
      await request(app)
        .post('/widgets')
        .send({ location: 'Berlin' })
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/widgets')
        .send({ location: 'Berlin' })
        .expect(409);

      expect(response.body.error).toBe('Widget already exists');
    });

    test('should reject duplicate location (case insensitive)', async () => {
      // Create first widget
      await request(app)
        .post('/widgets')
        .send({ location: 'Berlin' })
        .expect(201);

      // Try to create duplicate with different case
      const response = await request(app)
        .post('/widgets')
        .send({ location: 'BERLIN' })
        .expect(409);

      expect(response.body.error).toBe('Widget already exists');
    });
  });

  describe('GET /widgets', () => {
    test('should return empty array when no widgets exist', async () => {
      const response = await request(app)
        .get('/widgets')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    test('should return all widgets sorted by creation date', async () => {
      // Create multiple widgets
      await request(app).post('/widgets').send({ location: 'Berlin' });
      await request(app).post('/widgets').send({ location: 'Paris' });
      await request(app).post('/widgets').send({ location: 'Tokyo' });

      const response = await request(app)
        .get('/widgets')
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body[0].location).toBe('Tokyo'); // Most recent first
      expect(response.body[1].location).toBe('Paris');
      expect(response.body[2].location).toBe('Berlin');
    });
  });

  describe('DELETE /widgets/:id', () => {
    test('should delete existing widget', async () => {
      // Create widget
      const createResponse = await request(app)
        .post('/widgets')
        .send({ location: 'Berlin' });

      const widgetId = createResponse.body._id;

      // Delete widget
      await request(app)
        .delete(`/widgets/${widgetId}`)
        .expect(204);

      // Verify widget is deleted
      const response = await request(app).get('/widgets');
      expect(response.body).toHaveLength(0);
    });

    test('should return 404 for non-existent widget', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/widgets/${fakeId}`)
        .expect(404);

      expect(response.body.error).toBe('Widget not found');
    });

    test('should return 400 for invalid widget ID format', async () => {
      const response = await request(app)
        .delete('/widgets/invalid-id')
        .expect(400);

      expect(response.body.error).toBe('Invalid widget ID format');
    });
  });
});
