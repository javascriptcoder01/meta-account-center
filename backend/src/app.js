import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import config from './config/env.js';
import logger from './config/logger.js';
import apiRouter from './routes/index.js';
import notFoundMiddleware from './middlewares/notFound.middleware.js';
import errorMiddleware from './middlewares/error.middleware.js';

const app = express();

app.use(helmet());

const corsOptions = {
  origin: (origin, callback) => {

    if (!origin) return callback(null, true);

    const allowedOrigin = config.corsOrigin;
    const isProduction = config.env === 'production';

    if (isProduction) {
      if (origin === allowedOrigin) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      if (
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:') ||
        origin === allowedOrigin
      ) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked non-localhost origin in non-production: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use(cookieParser());

const globalRateLimiter = rateLimit({
  windowMs: 30 * 1000, // 15 minutes
  max: config.env === 'test' ? 10000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    error: {
      code: 'TOO_MANY_REQUESTS',
      details: []
    }
  }
});
app.use('/api', globalRateLimiter);

app.use((req, res, next) => {
  logger.info({ method: req.method, url: req.originalUrl, ip: req.ip }, 'Incoming request');
  next();
});

app.use('/api', apiRouter);

app.use(notFoundMiddleware);

app.use(errorMiddleware);

export default app;
