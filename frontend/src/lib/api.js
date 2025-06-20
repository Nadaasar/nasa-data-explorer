import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making request to: ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// APOD API
export const apodAPI = {
  // Get today's APOD
  getToday: () => api.get('/api/apod'),
  
  // Get APOD for specific date
  getByDate: (date) => api.get(`/api/apod?date=${date}`),
  
  // Get random APOD images
  getRandom: (count = 5) => api.get(`/api/apod/random?count=${count}`),
  
  // Get APOD for date range
  getRange: (startDate, endDate) => 
    api.get(`/api/apod/range?start_date=${startDate}&end_date=${endDate}`)
};

// Mars Rover API
export const marsRoverAPI = {
  // Get rover photos
  getPhotos: (rover, sol, earthDate, camera, page = 1) => {
    const params = new URLSearchParams({ page });
    if (sol) params.append('sol', sol);
    if (earthDate) params.append('earth_date', earthDate);
    if (camera) params.append('camera', camera);
    
    return api.get(`/api/mars-rover/${rover}/photos?${params}`);
  },
  
  // Get rover manifest
  getManifest: (rover) => api.get(`/api/mars-rover/${rover}/manifest`),
  
  // Get latest photos from all rovers
  getLatest: () => api.get('/api/mars-rover/latest'),
  
  // Get available cameras for rover
  getCameras: (rover) => api.get(`/api/mars-rover/${rover}/cameras`)
};

// Near Earth Objects API
export const neoAPI = {
  // Get NEOs for date range
  getFeed: (startDate, endDate) => 
    api.get(`/api/neo/feed?start_date=${startDate}&end_date=${endDate}`),
  
  // Get NEO by ID
  getById: (asteroidId) => api.get(`/api/neo/${asteroidId}`),
  
  // Browse NEOs
  browse: (page = 0, size = 20) => 
    api.get(`/api/neo?page=${page}&size=${size}`),
  
  // Get today's NEOs
  getToday: () => api.get('/api/neo/today/feed'),
  
  // Get NEO statistics
  getStats: () => api.get('/api/neo/stats/summary')
};

// NASA Image Library API
export const imageLibraryAPI = {
  // Search images
  search: (query, mediaType = 'image', page = 1) => 
    api.get(`/api/image-library/search?q=${encodeURIComponent(query)}&media_type=${mediaType}&page=${page}`),
  
  // Get popular topics
  getPopular: () => api.get('/api/image-library/popular'),
  
  // Get featured collections
  getFeatured: () => api.get('/api/image-library/featured'),
  
  // Get random images
  getRandom: (count = 10) => api.get(`/api/image-library/random?count=${count}`)
};

// EPIC API
export const epicAPI = {
  // Get EPIC images
  getImages: (date, type = 'natural') => {
    const params = new URLSearchParams({ type });
    if (date) params.append('date', date);
    
    return api.get(`/api/epic?${params}`);
  },
  
  // Get available dates
  getAvailableDates: (type = 'natural') => 
    api.get(`/api/epic/available?type=${type}`),
  
  // Get latest images
  getLatest: (type = 'natural') => 
    api.get(`/api/epic/latest?type=${type}`),
  
  // Get metadata for date
  getMetadata: (date, type = 'natural') => 
    api.get(`/api/epic/metadata/${date}?type=${type}`)
};

// Health check
export const healthAPI = {
  check: () => api.get('/health')
};

export default api;

