import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import env from './config/environment.js';
import v1Routes from './routes/index.js';
import { healthController } from './controllers/healthController.js';
import { notFoundMiddleware } from './middleware/notFoundMiddleware.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';

// Initialize Express application
const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    const allowedOrigins = [env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'];
    if (allowedOrigins.includes(origin) || env.isDevelopment) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS policy'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Direct health check endpoint: GET /api/health
app.get('/api/health', healthController.checkHealth);

// Versioned API routes: /api/v1/*
app.use('/api/v1', v1Routes);

// 404 handler for unrecognized routes
app.use(notFoundMiddleware);

// Centralized error handling middleware
app.use(errorMiddleware);

export default app;
