import './config/env.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import http from 'http';

import connectDB from './config/db.js';
import apiRouter from './routes/api.js';
import applicationRoutes from './routes/application.routes.js';
import { initSocket } from './utils/socket.js';
import { initCronJobs } from './utils/cronJobs.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/error.middleware.js';


const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server for Socket.io integration
const server = http.createServer(app);

// Connect to MongoDB
connectDB().then(() => {
  // Start node-cron scheduled background jobs
  initCronJobs();
});

// Initialize Socket.io
initSocket(server);

// Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Turn off CSP for easy local testing/loading assets
  crossOriginResourcePolicy: false, // Allow cross-origin images (Unsplash, Cloudinary, etc.) to load
  crossOriginEmbedderPolicy: false,
}));

// CORS Configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true, // Allow cookies to be sent along with API calls
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Cookie Parser (Required for HTTP-only JWT storage)
app.use(cookieParser());

// NoSQL Query Injection Prevention
app.use(mongoSanitize());

// HTTP Parameter Pollution Prevention
app.use(hpp());

// Apply General Rate Limiter to all /api/ routes
app.use('/api', generalLimiter);

// Custom sanitization middleware for request body to strip HTML tags
app.use((req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].replace(/<[^>]*>/g, '');
      }
    }
  }
  next();
});

// API Routes Mount
app.use('/api', apiRouter);
app.use('/api/applications', applicationRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'active', time: new Date() });
});

// Centralized Global Error Handler
app.use(errorHandler);

// Start listening on HTTP + Socket.io Server
server.listen(PORT, () => {
  console.log(`🚀 TurfBook MERN Server running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔌 WebSockets active on same port.`);
});
<<<<<<< HEAD
=======
// Watcher trigger comment
>>>>>>> 2f0a177e57ef9730224c412cf58f241a1c9f170b
