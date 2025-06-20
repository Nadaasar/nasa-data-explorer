const express = require('express');
const router = express.Router();
const nasaService = require('../services/nasaService');

// Get Mars Rover photos
router.get('/:rover/photos', async (req, res) => {
  try {
    const { rover } = req.params;
    const { sol, earth_date, camera, page = 1 } = req.query;

    // Validate rover name
    const validRovers = ['curiosity', 'opportunity', 'spirit', 'perseverance', 'ingenuity'];
    if (!validRovers.includes(rover.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Invalid rover. Valid options: ${validRovers.join(', ')}`
      });
    }

    // Validate that either sol or earth_date is provided
    if (!sol && !earth_date) {
      return res.status(400).json({
        success: false,
        error: 'Either sol or earth_date parameter is required'
      });
    }

    const data = await nasaService.getMarsRoverPhotos(rover, sol, earth_date, camera, page);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Mars Rover Photos API Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get Mars Rover manifest
router.get('/:rover/manifest', async (req, res) => {
  try {
    const { rover } = req.params;

    // Validate rover name
    const validRovers = ['curiosity', 'opportunity', 'spirit', 'perseverance', 'ingenuity'];
    if (!validRovers.includes(rover.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Invalid rover. Valid options: ${validRovers.join(', ')}`
      });
    }

    const data = await nasaService.getMarsRoverManifest(rover);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Mars Rover Manifest API Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get latest photos from all rovers
router.get('/latest', async (req, res) => {
  try {
    const rovers = ['curiosity', 'perseverance', 'opportunity', 'spirit'];
    const latestPhotos = {};

    for (const rover of rovers) {
      try {
        // Get manifest to find latest sol
        const manifest = await nasaService.getMarsRoverManifest(rover);
        const latestSol = manifest.rover.max_sol;
        
        // Get photos from latest sol
        const photos = await nasaService.getMarsRoverPhotos(rover, latestSol, null, null, 1);
        
        if (photos.photos && photos.photos.length > 0) {
          latestPhotos[rover] = {
            rover: manifest.rover,
            photos: photos.photos.slice(0, 5) // Limit to 5 photos per rover
          };
        }
      } catch (roverError) {
        console.warn(`Failed to get latest photos for ${rover}:`, roverError.message);
        latestPhotos[rover] = {
          error: `Failed to fetch latest photos for ${rover}`
        };
      }
    }

    res.json({
      success: true,
      data: latestPhotos
    });
  } catch (error) {
    console.error('Latest Mars Photos API Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get available cameras for a rover
router.get('/:rover/cameras', async (req, res) => {
  try {
    const { rover } = req.params;

    const manifest = await nasaService.getMarsRoverManifest(rover);
    
    res.json({
      success: true,
      data: {
        rover: manifest.rover.name,
        cameras: manifest.rover.cameras
      }
    });
  } catch (error) {
    console.error('Mars Rover Cameras API Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

