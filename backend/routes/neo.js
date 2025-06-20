const express = require('express');
const router = express.Router();
const nasaService = require('../services/nasaService');

// Get Near Earth Objects for date range
router.get('/feed', async (req, res) => {
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

    // Validate date range (NASA API allows max 7 days)
    const startDateObj = new Date(start_date);
    const endDateObj = new Date(end_date);
    const daysDiff = (endDateObj - startDateObj) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > 7) {
      return res.status(400).json({
        success: false,
        error: 'Date range cannot exceed 7 days'
      });
    }

    const data = await nasaService.getNearEarthObjects(start_date, end_date);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('NEO Feed API Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get NEO by ID
router.get('/:asteroidId', async (req, res) => {
  try {
    const { asteroidId } = req.params;
    
    if (!asteroidId) {
      return res.status(400).json({
        success: false,
        error: 'Asteroid ID is required'
      });
    }

    const data = await nasaService.getNEOById(asteroidId);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('NEO Lookup API Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Browse NEOs
router.get('/', async (req, res) => {
  try {
    const { page = 0, size = 20 } = req.query;
    
    // Validate pagination parameters
    const pageNum = parseInt(page);
    const sizeNum = parseInt(size);
    
    if (isNaN(pageNum) || pageNum < 0) {
      return res.status(400).json({
        success: false,
        error: 'Page must be a non-negative integer'
      });
    }
    
    if (isNaN(sizeNum) || sizeNum < 1 || sizeNum > 100) {
      return res.status(400).json({
        success: false,
        error: 'Size must be between 1 and 100'
      });
    }

    const data = await nasaService.browseNEOs(pageNum, sizeNum);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('NEO Browse API Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get today's NEOs
router.get('/today/feed', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const data = await nasaService.getNearEarthObjects(today, today);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Today NEO API Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get NEO statistics
router.get('/stats/summary', async (req, res) => {
  try {
    // Get a sample of NEOs to calculate statistics
    const browseData = await nasaService.browseNEOs(0, 100);
    
    if (!browseData.near_earth_objects) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch NEO data for statistics'
      });
    }

    const neos = browseData.near_earth_objects;
    
    // Calculate statistics
    const stats = {
      total_count: browseData.page.total_elements,
      sample_size: neos.length,
      potentially_hazardous_count: neos.filter(neo => neo.is_potentially_hazardous_asteroid).length,
      average_diameter_km: 0,
      largest_diameter_km: 0,
      smallest_diameter_km: Infinity,
      average_miss_distance_km: 0
    };

    let totalDiameter = 0;
    let totalMissDistance = 0;
    let missDistanceCount = 0;

    neos.forEach(neo => {
      // Diameter statistics
      const avgDiameter = (
        neo.estimated_diameter.kilometers.estimated_diameter_min +
        neo.estimated_diameter.kilometers.estimated_diameter_max
      ) / 2;
      
      totalDiameter += avgDiameter;
      stats.largest_diameter_km = Math.max(stats.largest_diameter_km, neo.estimated_diameter.kilometers.estimated_diameter_max);
      stats.smallest_diameter_km = Math.min(stats.smallest_diameter_km, neo.estimated_diameter.kilometers.estimated_diameter_min);
      
      // Miss distance statistics (from close approach data)
      if (neo.close_approach_data && neo.close_approach_data.length > 0) {
        const latestApproach = neo.close_approach_data[0];
        if (latestApproach.miss_distance && latestApproach.miss_distance.kilometers) {
          totalMissDistance += parseFloat(latestApproach.miss_distance.kilometers);
          missDistanceCount++;
        }
      }
    });

    stats.average_diameter_km = totalDiameter / neos.length;
    stats.average_miss_distance_km = missDistanceCount > 0 ? totalMissDistance / missDistanceCount : 0;
    
    // Round numbers for readability
    stats.average_diameter_km = Math.round(stats.average_diameter_km * 1000) / 1000;
    stats.largest_diameter_km = Math.round(stats.largest_diameter_km * 1000) / 1000;
    stats.smallest_diameter_km = Math.round(stats.smallest_diameter_km * 1000) / 1000;
    stats.average_miss_distance_km = Math.round(stats.average_miss_distance_km);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('NEO Stats API Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

