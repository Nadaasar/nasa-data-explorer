const axios = require('axios');
const NodeCache = require('node-cache');

class NASAService {
  constructor() {
    this.baseURL = process.env.NASA_API_BASE_URL || 'https://api.nasa.gov';
    this.apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
    this.cache = new NodeCache({ stdTTL: parseInt(process.env.CACHE_TTL) || 3600 }); // 1 hour default
  }

  async makeRequest(endpoint, params = {}) {
    const cacheKey = `${endpoint}_${JSON.stringify(params)}`;
    const cachedData = this.cache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        params: {
          api_key: this.apiKey,
          ...params
        },
        timeout: 10000 // 10 second timeout
      });

      this.cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error(`NASA API Error for ${endpoint}:`, error.message);
      
      if (error.response) {
        throw new Error(`NASA API Error: ${error.response.status} - ${error.response.data?.error?.message || error.response.statusText}`);
      } else if (error.request) {
        throw new Error('NASA API is currently unavailable. Please try again later.');
      } else {
        throw new Error('Failed to fetch data from NASA API');
      }
    }
  }

  // Astronomy Picture of the Day
  async getAPOD(date = null, count = null, startDate = null, endDate = null) {
    const params = {};
    if (date) params.date = date;
    if (count) params.count = count;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    return await this.makeRequest('/planetary/apod', params);
  }

  // Mars Rover Photos
  async getMarsRoverPhotos(rover = 'curiosity', sol = null, earthDate = null, camera = null, page = 1) {
    const params = { page };
    if (sol) params.sol = sol;
    if (earthDate) params.earth_date = earthDate;
    if (camera) params.camera = camera;

    return await this.makeRequest(`/mars-photos/api/v1/rovers/${rover}/photos`, params);
  }

  // Get Mars Rover manifest
  async getMarsRoverManifest(rover = 'curiosity') {
    return await this.makeRequest(`/mars-photos/api/v1/rovers/${rover}`);
  }

  // Near Earth Objects
  async getNearEarthObjects(startDate, endDate) {
    const params = {
      start_date: startDate,
      end_date: endDate
    };
    return await this.makeRequest('/neo/rest/v1/feed', params);
  }

  // NEO Lookup by ID
  async getNEOById(asteroidId) {
    return await this.makeRequest(`/neo/rest/v1/neo/${asteroidId}`);
  }

  // NEO Browse
  async browseNEOs(page = 0, size = 20) {
    const params = { page, size };
    return await this.makeRequest('/neo/rest/v1/neo/browse', params);
  }

  // NASA Image and Video Library
  async searchImageLibrary(query, mediaType = 'image', page = 1) {
    const params = {
      q: query,
      media_type: mediaType,
      page
    };
    return await this.makeRequest('/search', params);
  }

  // EPIC (Earth Polychromatic Imaging Camera)
  async getEPICImages(date = null, type = 'natural') {
    let endpoint = `/EPIC/api/${type}`;
    if (date) {
      endpoint += `/date/${date}`;
    } else {
      endpoint += '/available';
    }
    return await this.makeRequest(endpoint);
  }

  // Get EPIC image URL
  getEPICImageURL(type, date, imageName) {
    const formattedDate = date.replace(/-/g, '/');
    return `${this.baseURL}/EPIC/archive/${type}/${formattedDate}/png/${imageName}.png?api_key=${this.apiKey}`;
  }

  // Clear cache
  clearCache() {
    this.cache.flushAll();
  }

  // Get cache stats
  getCacheStats() {
    return this.cache.getStats();
  }
}

module.exports = new NASAService();

