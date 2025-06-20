# NASA Data Explorer - Deployment Guide

This guide covers deploying the NASA Data Explorer application to various cloud platforms.

## Prerequisites

- NASA API key from https://api.nasa.gov/
- Git repository with your code
- Node.js 18+ for local development

## Environment Configuration

### Backend Environment Variables

Create a `.env` file in the backend directory:

```env
NODE_ENV=production
PORT=3001
NASA_API_KEY=your_nasa_api_key_here
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=https://your-backend-url.com
```

## Backend Deployment Options

### Option 1: Railway

1. **Create Railway Account**
   - Visit https://railway.app/
   - Sign up with GitHub

2. **Deploy Backend**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Navigate to backend directory
   cd backend
   
   # Initialize Railway project
   railway init
   
   # Set environment variables
   railway variables set NASA_API_KEY=your_api_key_here
   railway variables set NODE_ENV=production
   railway variables set PORT=3001
   
   # Deploy
   railway up
   ```

3. **Configure Domain**
   - Railway will provide a domain like `your-app.railway.app`
   - Note this URL for frontend configuration

### Option 2: Render

1. **Create Render Account**
   - Visit https://render.com/
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the backend directory

3. **Configure Service**
   ```yaml
   # render.yaml (optional)
   services:
     - type: web
       name: nasa-explorer-backend
       env: node
       buildCommand: npm install
       startCommand: npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: NASA_API_KEY
           sync: false  # Set manually in dashboard
   ```

4. **Set Environment Variables**
   - In Render dashboard, go to Environment
   - Add `NASA_API_KEY` with your API key
   - Add other environment variables as needed

### Option 3: Heroku

1. **Install Heroku CLI**
   ```bash
   # Install Heroku CLI
   npm install -g heroku
   
   # Login
   heroku login
   ```

2. **Deploy Backend**
   ```bash
   cd backend
   
   # Create Heroku app
   heroku create nasa-explorer-backend
   
   # Set environment variables
   heroku config:set NASA_API_KEY=your_api_key_here
   heroku config:set NODE_ENV=production
   
   # Deploy
   git init
   git add .
   git commit -m "Initial commit"
   heroku git:remote -a nasa-explorer-backend
   git push heroku main
   ```

## Frontend Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy Frontend**
   ```bash
   cd frontend
   
   # Login to Vercel
   vercel login
   
   # Deploy
   vercel
   
   # Follow prompts:
   # - Set up and deploy? Yes
   # - Which scope? Your account
   # - Link to existing project? No
   # - Project name: nasa-data-explorer
   # - Directory: ./
   # - Override settings? No
   ```

3. **Configure Environment Variables**
   ```bash
   # Set production environment variable
   vercel env add VITE_API_URL production
   # Enter your backend URL: https://your-backend-url.com
   
   # Redeploy with environment variables
   vercel --prod
   ```

### Option 2: Netlify

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Login
   netlify login
   
   # Deploy
   netlify deploy --prod --dir=dist
   ```

3. **Configure Environment Variables**
   - Go to Netlify dashboard
   - Site settings → Environment variables
   - Add `VITE_API_URL` with your backend URL

### Option 3: GitHub Pages (Static Only)

1. **Configure for GitHub Pages**
   ```bash
   cd frontend
   
   # Install gh-pages
   npm install --save-dev gh-pages
   ```

2. **Update package.json**
   ```json
   {
     "homepage": "https://yourusername.github.io/nasa-data-explorer",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

## Docker Deployment

### Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

USER node

CMD ["npm", "start"]
```

### Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Frontend nginx.conf

Create `frontend/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /api {
            proxy_pass http://backend:3001;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - NASA_API_KEY=${NASA_API_KEY}
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

### Deploy with Docker

```bash
# Set environment variable
export NASA_API_KEY=your_api_key_here

# Build and run
docker-compose up -d

# View logs
docker-compose logs -f
```

## Production Optimizations

### Backend Optimizations

1. **Enable Compression**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

2. **Security Headers**
   ```javascript
   const helmet = require('helmet');
   app.use(helmet({
     contentSecurityPolicy: {
       directives: {
         defaultSrc: ["'self'"],
         styleSrc: ["'self'", "'unsafe-inline'"],
         scriptSrc: ["'self'"],
         imgSrc: ["'self'", "data:", "https:"],
       },
     },
   }));
   ```

3. **Process Management**
   ```bash
   # Install PM2
   npm install -g pm2
   
   # Start with PM2
   pm2 start server.js --name nasa-explorer
   
   # Save PM2 configuration
   pm2 save
   pm2 startup
   ```

### Frontend Optimizations

1. **Build Optimization**
   ```javascript
   // vite.config.js
   export default {
     build: {
       rollupOptions: {
         output: {
           manualChunks: {
             vendor: ['react', 'react-dom'],
             charts: ['recharts'],
           },
         },
       },
     },
   };
   ```

2. **CDN Configuration**
   - Use a CDN like Cloudflare for static assets
   - Configure caching headers for optimal performance

## Monitoring and Logging

### Backend Monitoring

1. **Health Check Endpoint**
   ```javascript
   app.get('/health', (req, res) => {
     res.json({
       status: 'OK',
       timestamp: new Date().toISOString(),
       uptime: process.uptime(),
       memory: process.memoryUsage(),
     });
   });
   ```

2. **Error Logging**
   ```javascript
   const winston = require('winston');
   
   const logger = winston.createLogger({
     level: 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' }),
     ],
   });
   ```

### Frontend Monitoring

1. **Error Boundary**
   ```jsx
   class ErrorBoundary extends React.Component {
     constructor(props) {
       super(props);
       this.state = { hasError: false };
     }
   
     static getDerivedStateFromError(error) {
       return { hasError: true };
     }
   
     componentDidCatch(error, errorInfo) {
       console.error('Error caught by boundary:', error, errorInfo);
     }
   
     render() {
       if (this.state.hasError) {
         return <h1>Something went wrong.</h1>;
       }
       return this.props.children;
     }
   }
   ```

## SSL/HTTPS Configuration

### Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Cloudflare SSL

1. Add your domain to Cloudflare
2. Update nameservers
3. Enable "Full (strict)" SSL mode
4. Configure page rules for caching

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is configured for your frontend domain
   - Check environment variables are set correctly

2. **API Rate Limits**
   - Monitor NASA API usage
   - Implement proper caching
   - Consider upgrading NASA API plan if needed

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all environment variables are set
   - Review build logs for specific errors

### Debug Commands

```bash
# Check backend health
curl https://your-backend-url.com/health

# Check frontend build
npm run build -- --debug

# View Docker logs
docker-compose logs backend
docker-compose logs frontend

# Check environment variables
printenv | grep NASA
```

## Backup and Recovery

### Database Backup (if using database)

```bash
# MongoDB backup
mongodump --uri="mongodb://localhost:27017/nasa-explorer"

# PostgreSQL backup
pg_dump nasa_explorer > backup.sql
```

### Code Backup

```bash
# Git backup
git remote add backup https://github.com/yourusername/nasa-explorer-backup.git
git push backup main
```

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancer**
   - Use Nginx or cloud load balancer
   - Distribute traffic across multiple backend instances

2. **CDN**
   - Serve static assets from CDN
   - Cache API responses at edge locations

3. **Database Scaling**
   - Read replicas for database queries
   - Connection pooling

### Vertical Scaling

1. **Resource Monitoring**
   - Monitor CPU, memory, and disk usage
   - Scale resources based on demand

2. **Performance Optimization**
   - Optimize database queries
   - Implement efficient caching strategies
   - Use compression for API responses

---

This deployment guide should help you successfully deploy the NASA Data Explorer application to production. Choose the deployment option that best fits your needs and budget.

