# NASA Data Explorer - API Documentation

## Overview

The NASA Data Explorer API provides access to various NASA Open APIs through a unified interface. This backend service handles authentication, caching, rate limiting, and data transformation for optimal frontend consumption.

## Base URL

```
http://localhost:3001/api
```

## Authentication

No authentication required for the API endpoints. However, the backend requires a NASA API key configured in environment variables.

## Rate Limiting

- **Window**: 15 minutes (900,000ms)
- **Max Requests**: 100 per IP address per window
- **Headers**: Rate limit information included in response headers

## Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Optional message",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (development only)",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

## Endpoints

### Health Check

#### GET /health
Check API health status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "uptime": 3600.123,
  "environment": "development"
}
```

---

## APOD (Astronomy Picture of the Day)

### GET /api/apod/today
Get today's Astronomy Picture of the Day.

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "The Horsehead Nebula",
    "explanation": "One of the most identifiable nebulae in the sky...",
    "url": "https://apod.nasa.gov/apod/image/2301/horsehead_hubble_960.jpg",
    "hdurl": "https://apod.nasa.gov/apod/image/2301/horsehead_hubble_4040.jpg",
    "media_type": "image",
    "date": "2023-01-01",
    "copyright": "NASA, ESA, Hubble"
  }
}
```

### GET /api/apod/date
Get APOD for a specific date.

**Parameters:**
- `date` (required): Date in YYYY-MM-DD format

**Example:**
```
GET /api/apod/date?date=2023-01-01
```

### GET /api/apod/random
Get random APOD images.

**Parameters:**
- `count` (optional): Number of random images (1-100, default: 5)

**Example:**
```
GET /api/apod/random?count=10
```

---

## Mars Rover Photos

### GET /api/mars/rovers
Get information about all Mars rovers.

**Response:**
```json
{
  "success": true,
  "data": {
    "rovers": [
      {
        "id": 5,
        "name": "Curiosity",
        "landing_date": "2012-08-06",
        "launch_date": "2011-11-26",
        "status": "active",
        "max_sol": 3000,
        "max_date": "2023-01-01",
        "total_photos": 500000,
        "cameras": [
          {
            "name": "FHAZ",
            "full_name": "Front Hazard Avoidance Camera"
          }
        ]
      }
    ]
  }
}
```

### GET /api/mars/photos
Get Mars rover photos.

**Parameters:**
- `rover` (required): Rover name (curiosity, opportunity, spirit, perseverance)
- `sol` (optional): Martian sol (day)
- `earth_date` (optional): Earth date in YYYY-MM-DD format
- `camera` (optional): Camera name (FHAZ, RHAZ, MAST, CHEMCAM, etc.)
- `page` (optional): Page number for pagination (default: 1)

**Example:**
```
GET /api/mars/photos?rover=curiosity&sol=1000&camera=MAST
```

**Response:**
```json
{
  "success": true,
  "data": {
    "photos": [
      {
        "id": 102693,
        "sol": 1000,
        "camera": {
          "id": 20,
          "name": "MAST",
          "rover_id": 5,
          "full_name": "Mast Camera"
        },
        "img_src": "https://mars.jpl.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/01000/opgs/edr/ccam/CR0_486265257EDR_F0481570CCAM02000M_.JPG",
        "earth_date": "2015-05-30",
        "rover": {
          "id": 5,
          "name": "Curiosity",
          "landing_date": "2012-08-06",
          "launch_date": "2011-11-26",
          "status": "active"
        }
      }
    ]
  }
}
```

### GET /api/mars/latest
Get latest photos from a specific rover.

**Parameters:**
- `rover` (required): Rover name

**Example:**
```
GET /api/mars/latest?rover=curiosity
```

---

## Near Earth Objects (NEO)

### GET /api/neo/today
Get Near Earth Objects for today.

**Response:**
```json
{
  "success": true,
  "data": {
    "element_count": 5,
    "near_earth_objects": {
      "2023-01-01": [
        {
          "id": "2465633",
          "neo_reference_id": "2465633",
          "name": "465633 (2009 JR5)",
          "nasa_jpl_url": "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=2465633",
          "absolute_magnitude_h": 20.4,
          "estimated_diameter": {
            "kilometers": {
              "estimated_diameter_min": 0.2092805142,
              "estimated_diameter_max": 0.4677023853
            }
          },
          "is_potentially_hazardous_asteroid": false,
          "close_approach_data": [
            {
              "close_approach_date": "2023-01-01",
              "close_approach_date_full": "2023-Jan-01 12:00",
              "epoch_date_close_approach": 1672574400000,
              "relative_velocity": {
                "kilometers_per_second": "18.1234567890",
                "kilometers_per_hour": "65244.4444444",
                "miles_per_hour": "40536.9876543"
              },
              "miss_distance": {
                "astronomical": "0.3214567890",
                "lunar": "125.0456789012",
                "kilometers": "48123456.789012345",
                "miles": "29901234.567890123"
              },
              "orbiting_body": "Earth"
            }
          ]
        }
      ]
    }
  }
}
```

### GET /api/neo/feed
Get NEO feed for a date range.

**Parameters:**
- `start_date` (required): Start date in YYYY-MM-DD format
- `end_date` (required): End date in YYYY-MM-DD format (max 7 days from start_date)

**Example:**
```
GET /api/neo/feed?start_date=2023-01-01&end_date=2023-01-07
```

### GET /api/neo/stats
Get NEO statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_count": 25000,
    "potentially_hazardous_count": 2000,
    "sample_size": 20000,
    "average_diameter_km": 0.5,
    "largest_diameter_km": 10.2,
    "smallest_diameter_km": 0.001
  }
}
```

### GET /api/neo/browse
Browse the NEO database.

**Parameters:**
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 20, max: 100)

**Example:**
```
GET /api/neo/browse?page=0&size=20
```

### GET /api/neo/:id
Get detailed information about a specific NEO.

**Parameters:**
- `id` (required): NEO ID

**Example:**
```
GET /api/neo/2465633
```

---

## NASA Image & Video Library

### GET /api/images/search
Search NASA's image and video library.

**Parameters:**
- `q` (required): Search query
- `media_type` (optional): Media type (image, video, audio)
- `page` (optional): Page number (default: 1)
- `year_start` (optional): Start year for search
- `year_end` (optional): End year for search

**Example:**
```
GET /api/images/search?q=apollo%2011&media_type=image&page=1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "collection": {
      "version": "1.0",
      "href": "https://images-api.nasa.gov/search?q=apollo%2011",
      "items": [
        {
          "href": "https://images-assets.nasa.gov/image/as11-40-5874/collection.json",
          "data": [
            {
              "center": "JSC",
              "title": "Apollo 11 Mission image - View of Moon limb with Earth on the horizon",
              "nasa_id": "as11-40-5874",
              "date_created": "1969-07-20T00:00:00Z",
              "keywords": ["Apollo 11", "Moon", "Earth"],
              "media_type": "image",
              "description": "Apollo 11 Mission image - View of Moon limb with Earth on the horizon, Mare Smythii Region. Coordinates of the center of the terrain are 85 degrees east longitude and 3 degrees north latitude."
            }
          ],
          "links": [
            {
              "href": "https://images-assets.nasa.gov/image/as11-40-5874/as11-40-5874~thumb.jpg",
              "rel": "preview",
              "render": "image"
            }
          ]
        }
      ]
    }
  }
}
```

### GET /api/images/featured
Get featured image collections.

**Response:**
```json
{
  "success": true,
  "data": {
    "apollo_missions": {
      "title": "Apollo Missions",
      "description": "Historic images from the Apollo program",
      "total_hits": 5000,
      "items": []
    },
    "hubble_telescope": {
      "title": "Hubble Space Telescope",
      "description": "Stunning images from Hubble",
      "total_hits": 3000,
      "items": []
    }
  }
}
```

### GET /api/images/random
Get random images from NASA's library.

**Parameters:**
- `count` (optional): Number of random images (default: 10, max: 50)

**Example:**
```
GET /api/images/random?count=15
```

---

## EPIC (Earth Polychromatic Imaging Camera)

### GET /api/epic/latest
Get latest Earth images from EPIC.

**Parameters:**
- `type` (optional): Image type (natural, enhanced, default: natural)

**Example:**
```
GET /api/epic/latest?type=natural
```

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2023-01-01",
    "images": [
      {
        "image": "epic_1b_20230101000000",
        "caption": "This image was taken by NASA's EPIC camera onboard the NOAA DSCOVR spacecraft",
        "centroid_coordinates": {
          "lat": 8.375463,
          "lon": -94.078125
        },
        "dscovr_j2000_position": {
          "x": -1283061.5,
          "y": -669893.9,
          "z": -130240.7
        },
        "lunar_j2000_position": {
          "x": -353736.1,
          "y": -174407.8,
          "z": -69484.5
        },
        "sun_j2000_position": {
          "x": -147180830.2,
          "y": -28615495.8,
          "z": -12404156.8
        },
        "attitude_quaternions": {
          "q0": 0.123456,
          "q1": 0.234567,
          "q2": 0.345678,
          "q3": 0.456789
        },
        "date": "2023-01-01 00:00:00",
        "image_url": "https://epic.gsfc.nasa.gov/archive/natural/2023/01/01/png/epic_1b_20230101000000.png"
      }
    ]
  }
}
```

### GET /api/epic/dates
Get available dates for EPIC images.

**Parameters:**
- `type` (optional): Image type (natural, enhanced, default: natural)

**Example:**
```
GET /api/epic/dates?type=natural
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2023-01-01"
    },
    {
      "date": "2023-01-02"
    }
  ]
}
```

### GET /api/epic/images
Get EPIC images for a specific date.

**Parameters:**
- `date` (required): Date in YYYY-MM-DD format
- `type` (optional): Image type (natural, enhanced, default: natural)

**Example:**
```
GET /api/epic/images?date=2023-01-01&type=natural
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 502 | Bad Gateway - NASA API unavailable |
| 503 | Service Unavailable - Temporary server issue |

## Error Response Examples

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid date format. Please use YYYY-MM-DD.",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### 429 Rate Limit Exceeded
```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error occurred.",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

## Caching

The API implements intelligent caching to improve performance:

- **APOD**: Cached for 1 hour (today's APOD), 24 hours (historical)
- **Mars Rover Photos**: Cached for 6 hours
- **NEO Data**: Cached for 30 minutes
- **Image Search**: Cached for 2 hours
- **EPIC Images**: Cached for 1 hour

Cache headers are included in responses:
- `X-Cache-Status`: HIT or MISS
- `Cache-Control`: Cache control directives

## Development

### Running Tests
```bash
npm test
```

### Environment Variables
```env
NODE_ENV=development
PORT=3001
NASA_API_KEY=your_nasa_api_key_here
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Debugging
Enable debug logging by setting:
```env
DEBUG=nasa-explorer:*
```

---

For more information, visit the [NASA Open Data Portal](https://api.nasa.gov/).

