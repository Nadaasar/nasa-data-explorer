const express = require('express');
const router = express.Router();
const nasaService = require('../services/nasaService');

// Get EPIC images
router.get('/', async (req, res) => {
  try {
    const { date, type = 'natural' } = req.query;

    // Validate type
    const validTypes = ['natural', 'enhanced'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid type. Valid options: ${validTypes.join(', ')}`
      });
    }

    // Validate date format if provided (YYYY-MM-DD)
    if (date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({
          success: false,
          error: 'Date must be in YYYY-MM-DD format'
        });
      }
    }

    const data = await nasaService.getEPICImages(date, type);
    
    // If we got image data, add the full image URLs
    if (Array.isArray(data) && data.length > 0) {
      const imagesWithUrls = data.map(image => ({
        ...image,
        image_url: nasaService.getEPICImageURL(type, image.date, image.image)
      }));
      
      res.json({
        success: true,
        data: imagesWithUrls
      });
    } else {
      res.json({
        success: true,
        data
      });
    }
  } catch (error) {
    console.error('EPIC API Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get available dates for EPIC images
router.get('/available', async (req, res) => {
  try {
    const { type = 'natural' } = req.query;

    // Validate type
    const validTypes = ['natural', 'enhanced'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid type. Valid options: ${validTypes.join(', ')}`
      });
    }

    const data = await nasaService.getEPICImages(null, type);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('EPIC Available Dates API Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get latest EPIC images
router.get('/latest', async (req, res) => {
  try {
    const { type = 'natural' } = req.query;

    // First get available dates
    const availableDates = await nasaService.getEPICImages(null, type);
    
    if (!Array.isArray(availableDates) || availableDates.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No EPIC images available'
      });
    }

    // Get the latest date
    const latestDate = availableDates[availableDates.length - 1].date;
    
    // Get images for the latest date
    const latestImages = await nasaService.getEPICImages(latestDate, type);
    
    // Add image URLs
    const imagesWithUrls = latestImages.map(image => ({
      ...image,
      image_url: nasaService.getEPICImageURL(type, image.date, image.image)
    }));
    
    res.json({
      success: true,
      data: {
        date: latestDate,
        type,
        images: imagesWithUrls
      }
    });
  } catch (error) {
    console.error('Latest EPIC API Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get EPIC image metadata
router.get('/metadata/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { type = 'natural' } = req.query;

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        error: 'Date must be in YYYY-MM-DD format'
      });
    }

    const data = await nasaService.getEPICImages(date, type);
    
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No EPIC images found for date ${date}`
      });
    }

    // Calculate some metadata
    const metadata = {
      date,
      type,
      image_count: data.length,
      first_image_time: data[0]?.date,
      last_image_time: data[data.length - 1]?.date,
      coordinates: data.map(img => ({
        image: img.image,
        centroid_coordinates: img.centroid_coordinates,
        dscovr_j2000_position: img.dscovr_j2000_position
      }))
    };

    res.json({
      success: true,
      data: metadata
    });
  } catch (error) {
    console.error('EPIC Metadata API Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

