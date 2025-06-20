const express = require('express');
const router = express.Router();
const nasaService = require('../services/nasaService');

// Get Astronomy Picture of the Day
router.get('/', async (req, res) => {
  try {
    const { date, count, start_date, end_date } = req.query;
    
    const data = await nasaService.getAPOD(date, count, start_date, end_date);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('APOD API Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get random APOD images
router.get('/random', async (req, res) => {
  try {
    const { count = 5 } = req.query;
    
    const data = await nasaService.getAPOD(null, Math.min(count, 10)); // Limit to 10 for performance
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Random APOD API Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get APOD for date range
router.get('/range', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'start_date and end_date are required'
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(start_date) || !dateRegex.test(end_date)) {
      return res.status(400).json({
        success: false,
        error: 'Dates must be in YYYY-MM-DD format'
      });
    }

    const data = await nasaService.getAPOD(null, null, start_date, end_date);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('APOD Range API Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

