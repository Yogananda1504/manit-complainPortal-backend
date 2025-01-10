/**
 * @file app.js
 * @module CompliantPortalBackend
 * @description Main application file for the Compliant Portal Backend, setting up middleware, routes, and error handling.
 */
import { protect } from './middleware/protect.js';
import express from 'express';
import complainRoutes from './routes/complainRoutes.js';
import fs from 'fs';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import profileRoutes from './routes/profileRoutes.js';
import AppError from './utils/appError.js'; // Renamed to PascalCase
import loginRoutes from './routes/loginRoutes.js';
import logoutRoutes from './routes/logoutRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import morgan from 'morgan';
import csrf from '@dr.pogodin/csurf';
import csrfProtection from './middleware/csrfMiddleware.js';
import validateRoutes from './routes/validateRoutes.js';

dotenv.config();

/**
 * CORS Configuration
 */
const corsConfig = cors({
    origin: ['http://localhost:5173', 'https://s9x3g1x0-5173.inc1.devtunnels.ms'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization','csrf-token']
});

const app = express();

// Apply security and parsing middlewares early
app.use(helmet());
app.use(morgan('dev'));
app.use(corsConfig);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/**
 * Serve static files from the "uploads" directory
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Health Check Route
 */
app.get('/ping', (req, res) => {
    res.send('pong');
});

// Routes
app.use('/complain', complainRoutes);
app.use('/profile', profileRoutes);
app.use('/login', loginRoutes);
app.use('/logout', logoutRoutes);
app.use('/uploads', (req, res, next) => {
    const filePath = path.join(__dirname, 'uploads', req.path);
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error(err);
            return res.status(404).json({
                status: 'error',
                statusCode: 404,
                message: `Cannot find ${req.originalUrl} on this server`
            });
        }
        express.static(path.join(__dirname, 'uploads'))(req, res, next);
    });
});
app.get('/csrf-token', protect,csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
  });
app.use("/validate",validateRoutes);    
app.use('/feedback', feedbackRoutes);
/**
 * 404 Handler for undefined routes
 */
app.all('*', (req, res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

/**
 * Error Handling Middleware
 */
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        return next(new AppError('Invalid CSRF token', 403));
    }

    // Set default status code and message
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Log the error
    console.error(err);

    // Send error response
    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message
    });
    return; // Ensure the response is sent only once
});

export default app;