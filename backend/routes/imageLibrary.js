const express = require('express');
const router = express.Router();
const nasaService = require('../services/nasaService');

// Search NASA Image and Video Library
router.get('/search', async (req, res) => {
  try {
    const { q, media_type = 'image', page = 1 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required'
      });
    }

    // Validate media type
    const validMediaTypes = ['image', 'video', 'audio'];
    if (!validMediaTypes.includes(media_type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid media_type. Valid options: ${validMediaTypes.join(', ')}`
      });
    }

    // Validate page number
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        error: 'Page must be a positive integer'
      });
    }

    const data = await nasaService.searchImageLibrary(q, media_type, pageNum);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Image Library Search API Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get popular space topics
router.get('/popular', async (req, res) => {
  try {
    const popularTopics = [
      'mars',
      'earth',
      'moon',
      'jupiter',
      'saturn',
      'hubble',
      'international space station',
      'apollo',
      'nebula',
      'galaxy'
    ];

    const results = {};
    
    // Get a few images for each popular topic
    for (const topic of popularTopics.slice(0, 5)) { // Limit to 5 topics for performance
      try {
        const data = await nasaService.searchImageLibrary(topic, 'image', 1);
        if (data.collection && data.collection.items && data.collection.items.length > 0) {
          results[topic] = {
            total_hits: data.collection.metadata?.total_hits || 0,
            items: data.collection.items.slice(0, 3) // Get first 3 items
          };
        }
      } catch (topicError) {
        console.warn(`Failed to fetch images for topic "${topic}":`, topicError.message);
        results[topic] = {
          error: `Failed to fetch images for ${topic}`
        };
      }
    }

    res.json({
      success: true,
      data: {
        topics: popularTopics,
        results
      }
    });
  } catch (error) {
    console.error('Popular Topics API Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get featured collections
router.get('/featured', async (req, res) => {
  try {
    const featuredQueries = [
      { name: 'Hubble Space Telescope', query: 'hubble telescope', description: 'Amazing images from the Hubble Space Telescope' },
      { name: 'Mars Exploration', query: 'mars rover exploration', description: 'Mars exploration missions and discoveries' },
      { name: 'Earth from Space', query: 'earth space view', description: 'Beautiful views of Earth from space' },
      { name: 'Apollo Missions', query: 'apollo mission moon', description: 'Historic Apollo moon landing missions' },
      { name: 'Deep Space', query: 'deep space nebula galaxy', description: 'Stunning deep space imagery' }
    ];

    const collections = {};

    for (const collection of featuredQueries) {
      try {
        const data = await nasaService.searchImageLibrary(collection.query, 'image', 1);
        if (data.collection && data.collection.items && data.collection.items.length > 0) {
          collections[collection.name] = {
            description: collection.description,
            query: collection.query,
            total_hits: data.collection.metadata?.total_hits || 0,
            items: data.collection.items.slice(0, 6) // Get first 6 items
          };
        }
      } catch (collectionError) {
        console.warn(`Failed to fetch collection "${collection.name}":`, collectionError.message);
        collections[collection.name] = {
          description: collection.description,
          error: `Failed to fetch ${collection.name} collection`
        };
      }
    }

    res.json({
      success: true,
      data: collections
    });
  } catch (error) {
    console.error('Featured Collections API Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get random images
router.get('/random', async (req, res) => {
  try {
    const { count = 10 } = req.query;
    const countNum = Math.min(parseInt(count) || 10, 20); // Limit to 20 for performance

    const randomTopics = [
      'space', 'mars', 'earth', 'moon', 'jupiter', 'saturn', 'hubble', 
      'nebula', 'galaxy', 'astronaut', 'rocket', 'iss', 'apollo', 'shuttle'
    ];

    const randomImages = [];
    const usedTopics = new Set();

    while (randomImages.length < countNum && usedTopics.size < randomTopics.length) {
      const randomTopic = randomTopics[Math.floor(Math.random() * randomTopics.length)];
      
      if (usedTopics.has(randomTopic)) continue;
      usedTopics.add(randomTopic);

      try {
        const data = await nasaService.searchImageLibrary(randomTopic, 'image', 1);
        if (data.collection && data.collection.items && data.collection.items.length > 0) {
          // Get a random image from the results
          const randomIndex = Math.floor(Math.random() * Math.min(data.collection.items.length, 10));
          const randomImage = data.collection.items[randomIndex];
          if (randomImage) {
            randomImages.push({
              ...randomImage,
              search_topic: randomTopic
            });
          }
        }
      } catch (topicError) {
        console.warn(`Failed to fetch random images for topic "${randomTopic}":`, topicError.message);
      }
    }

    res.json({
      success: true,
      data: {
        count: randomImages.length,
        images: randomImages
      }
    });
  } catch (error) {
    console.error('Random Images API Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

