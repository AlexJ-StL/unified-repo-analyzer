import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import core modules
import * as core from './core';

// Import API routes
import apiRoutes from './api/routes';

// Import WebSocket handlers
import { initializeWebSocketHandlers } from './api/websocket';

// Import error middleware
import { notFound, errorHandler } from './api/middleware/error.middleware';

// Import performance monitoring
import { metricsService } from './services/metrics.service';

// Import configuration service
import { configurationService } from './services/config.service';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Performance monitoring middleware
app.use(metricsService.requestMiddleware());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Unified Repository Analyzer API' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Initialize WebSocket handlers
initializeWebSocketHandlers(io);

// Initialize configuration service
configurationService.initialize().catch(console.error);

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, httpServer, io, core };
