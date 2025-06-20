const request = require('supertest');
const app = require('../server').app;

describe('NASA Data Explorer API', () => {
  describe('Health Check', () => {
    test('GET /health should return OK status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('OK');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
    });
  });

  describe('APOD Endpoints', () => {
    test('GET /api/apod/today should return today\'s APOD', async () => {
      const response = await request(app)
        .get('/api/apod/today')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    test('GET /api/apod/random should return random APOD images', async () => {
      const response = await request(app)
        .get('/api/apod/random?count=5')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/apod/date should return APOD for specific date', async () => {
      const response = await request(app)
        .get('/api/apod/date?date=2023-01-01')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('Mars Rover Endpoints', () => {
    test('GET /api/mars/rovers should return list of rovers', async () => {
      const response = await request(app)
        .get('/api/mars/rovers')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.rovers).toBeDefined();
      expect(Array.isArray(response.body.data.rovers)).toBe(true);
    });

    test('GET /api/mars/photos should return rover photos', async () => {
      const response = await request(app)
        .get('/api/mars/photos?rover=curiosity&sol=1000')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    test('GET /api/mars/latest should return latest photos', async () => {
      const response = await request(app)
        .get('/api/mars/latest?rover=curiosity')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('Near Earth Objects Endpoints', () => {
    test('GET /api/neo/today should return today\'s NEOs', async () => {
      const response = await request(app)
        .get('/api/neo/today')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    test('GET /api/neo/stats should return NEO statistics', async () => {
      const response = await request(app)
        .get('/api/neo/stats')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    test('GET /api/neo/feed should return NEO feed for date range', async () => {
      const startDate = '2023-01-01';
      const endDate = '2023-01-07';
      
      const response = await request(app)
        .get(`/api/neo/feed?start_date=${startDate}&end_date=${endDate}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    test('GET /api/neo/browse should return browseable NEOs', async () => {
      const response = await request(app)
        .get('/api/neo/browse?page=0&size=20')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('Image Library Endpoints', () => {
    test('GET /api/images/search should return search results', async () => {
      const response = await request(app)
        .get('/api/images/search?q=apollo&media_type=image')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    test('GET /api/images/featured should return featured collections', async () => {
      const response = await request(app)
        .get('/api/images/featured')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    test('GET /api/images/random should return random images', async () => {
      const response = await request(app)
        .get('/api/images/random?count=10')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('EPIC Endpoints', () => {
    test('GET /api/epic/latest should return latest Earth images', async () => {
      const response = await request(app)
        .get('/api/epic/latest?type=natural')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    test('GET /api/epic/dates should return available dates', async () => {
      const response = await request(app)
        .get('/api/epic/dates?type=natural')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('GET /api/nonexistent should return 404', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);
      
      expect(response.body.message).toBe('Route not found');
    });

    test('GET /api/apod/date with invalid date should return error', async () => {
      const response = await request(app)
        .get('/api/apod/date?date=invalid-date')
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    test('GET /api/mars/photos without required parameters should return error', async () => {
      const response = await request(app)
        .get('/api/mars/photos')
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    test('Should handle multiple requests within rate limit', async () => {
      const requests = Array(5).fill().map(() => 
        request(app).get('/health')
      );
      
      const responses = await Promise.all(requests);
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('CORS', () => {
    test('Should include CORS headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});

