# NASA Data Explorer

A comprehensive web application for exploring NASA's vast collection of space data through their Open APIs. Built with React frontend and Node.js/Express backend, featuring interactive data visualization and responsive design.

## 🚀 Features

### 🌌 Astronomy Picture of the Day (APOD)
- Daily featured astronomy images and videos
- Historical APOD browsing with date picker
- Random image discovery
- High-resolution image viewing
- Detailed explanations by professional astronomers

### 🚗 Mars Rover Photos
- Browse photos from multiple Mars rovers (Curiosity, Opportunity, Spirit, Perseverance)
- Filter by Sol (Martian day) or Earth date
- Camera-specific filtering (MAST, NAVCAM, FHAZ, RHAZ, etc.)
- Latest photos from active rovers
- Detailed rover mission information

### ☄️ Near Earth Objects (NEOs)
- Track asteroids and comets approaching Earth
- Interactive data visualization with charts
- Search by date range (up to 7 days)
- Potentially hazardous object identification
- Detailed orbital information and statistics
- Real-time NEO database browsing

### 📸 NASA Image & Video Library
- Search through NASA's vast media collection
- Filter by media type (images, videos, audio)
- Featured collections and curated content
- Random discovery feature
- High-resolution downloads
- Detailed metadata and descriptions

### 🌍 Earth from Space (EPIC)
- Real-time Earth images from DSCOVR satellite
- Natural and enhanced color options
- Historical Earth imagery browsing
- Satellite position data
- Earth coordinate information

## 🛠 Technology Stack

### Frontend
- **React 19** - Modern UI library with hooks
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Data visualization library
- **Lucide React** - Beautiful icon library
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Axios** - HTTP client for NASA APIs
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Express Rate Limit** - API rate limiting
- **Node Cache** - In-memory caching

### Testing
- **Jest** - Testing framework
- **Supertest** - HTTP assertion library
- **React Testing Library** - React component testing

## 📋 Prerequisites

- Node.js 18+ and npm/pnpm
- NASA API key (free from https://api.nasa.gov/)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd nasa-data-explorer
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create environment file
cp .env.example .env
# Edit .env and add your NASA API key:
# NASA_API_KEY=your_api_key_here
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Create environment file
cp .env.example .env
# Edit .env if needed (default backend URL is http://localhost:3001)
```

### 4. Start Development Servers

**Backend (Terminal 1):**
```bash
cd backend
npm start
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```

### 5. Open Application
Visit http://localhost:5173 in your browser

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
NODE_ENV=development
PORT=3001
NASA_API_KEY=your_nasa_api_key_here
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3001
```

### NASA API Key
1. Visit https://api.nasa.gov/
2. Click "Generate API Key"
3. Fill out the form (name and email)
4. Copy the generated API key
5. Add it to your backend .env file

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### APOD (Astronomy Picture of the Day)
- `GET /apod/today` - Get today's APOD
- `GET /apod/date?date=YYYY-MM-DD` - Get APOD for specific date
- `GET /apod/random?count=5` - Get random APOD images

#### Mars Rover Photos
- `GET /mars/rovers` - Get list of all rovers
- `GET /mars/photos?rover=curiosity&sol=1000` - Get photos by rover and sol
- `GET /mars/photos?rover=curiosity&earth_date=2023-01-01` - Get photos by Earth date
- `GET /mars/latest?rover=curiosity` - Get latest photos from rover

#### Near Earth Objects
- `GET /neo/today` - Get today's NEOs
- `GET /neo/feed?start_date=2023-01-01&end_date=2023-01-07` - Get NEO feed
- `GET /neo/stats` - Get NEO statistics
- `GET /neo/browse?page=0&size=20` - Browse NEO database
- `GET /neo/:id` - Get specific NEO details

#### NASA Image Library
- `GET /images/search?q=apollo&media_type=image` - Search images
- `GET /images/featured` - Get featured collections
- `GET /images/random?count=10` - Get random images

#### EPIC (Earth Images)
- `GET /epic/latest?type=natural` - Get latest Earth images
- `GET /epic/dates?type=natural` - Get available dates
- `GET /epic/images?date=2023-01-01&type=natural` - Get images for date

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Test Coverage
- Backend: API endpoints, error handling, rate limiting
- Frontend: Component rendering, user interactions, API integration

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/Render)
1. Set environment variables in your hosting platform
2. Ensure `NODE_ENV=production`
3. Deploy from the `backend` directory

### Frontend Deployment (Vercel/Netlify)
1. Build the frontend: `npm run build`
2. Deploy the `dist` directory
3. Set environment variable: `VITE_API_URL=your_backend_url`

### Docker Deployment
```bash
# Backend
cd backend
docker build -t nasa-explorer-backend .
docker run -p 3001:3001 --env-file .env nasa-explorer-backend

# Frontend
cd frontend
docker build -t nasa-explorer-frontend .
docker run -p 5173:5173 nasa-explorer-frontend
```

## 🎨 Features in Detail

### Data Visualization
- Interactive charts using Recharts library
- Real-time data updates
- Responsive design for all screen sizes
- Color-coded data representation

### User Experience
- Loading states with spinners
- Error handling with retry mechanisms
- Responsive navigation
- Smooth animations and transitions
- Accessibility features

### Performance Optimizations
- API response caching
- Image lazy loading
- Debounced search inputs
- Optimized bundle size

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- NASA for providing free access to their APIs
- The open-source community for the amazing tools and libraries
- All the space enthusiasts who make projects like this worthwhile

##  🚧 Known Issues
When deploying on Netlify, the direct call to NASA's NEO API may result in a CORS error or connection failure (⚠️ API Connection Lost).

This is expected behavior due to NASA API limitations on client-side requests.

### ✅ Production Solution  
Use a Netlify Function to proxy the request:
- Proxy file: `netlify/functions/getNeos.js`
- Call from frontend: `fetch("/.netlify/functions/getNeos")`
- Store `NASA_API_KEY` in Netlify dashboard environment variables



## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ for space exploration enthusiasts**

