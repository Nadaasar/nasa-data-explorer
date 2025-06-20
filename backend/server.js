const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const apodRoutes = require('./routes/apod');
const marsRoverRoutes = require('./routes/marsRover');
const neoRoutes = require('./routes/neo');
const imageLibraryRoutes = require('./routes/imageLibrary');
const epicRoutes = require('./routes/epic');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/apod', apodRoutes);
app.use('/api/mars-rover', marsRoverRoutes);
app.use('/api/neo', neoRoutes);
app.use('/api/image-library', imageLibraryRoutes);
app.use('/api/epic', epicRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'NASA Data Explorer API',
    version: '1.0.0',
    endpoints: {
      apod: '/api/apod',
      marsRover: '/api/mars-rover',
      neo: '/api/neo',
      imageLibrary: '/api/image-library',
      epic: '/api/epic'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`NASA Data Explorer API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`NASA API Key: ${process.env.NASA_API_KEY ? 'Configured' : 'Using DEMO_KEY'}`);
});

module.exports = app;

