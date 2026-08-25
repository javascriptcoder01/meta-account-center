import mongoose from 'mongoose';
import config from './env.js';
import logger from './logger.js';

const redactCredentials = (text) => {
  if (typeof text !== 'string') return text;
  return text.replace(/mongodb(?:\+srv)?:\/\/[^:]+:[^@]+@[^\s/]+/gi, 'mongodb+srv://[CREDENTIALS_REDACTED]@...');
};

const sanitizeError = (err) => {
  if (!err) return err;
  const clone = Object.create(Object.getPrototypeOf(err));
  for (const key of Object.getOwnPropertyNames(err)) {
    let val = err[key];
    if (typeof val === 'string') {
      val = redactCredentials(val);
    } else if (val instanceof Error) {
      val = sanitizeError(val);
    }
    clone[key] = val;
  }
  return clone;
};

export const getDatabaseStatus = () => {
  return mongoose.connection.readyState === 1 ? 'UP' : 'DOWN';
};

export const connectDatabase = async () => {
  try {
    const redactedUri = redactCredentials(config.mongodbUri);
    logger.info(`Connecting to MongoDB database: "${config.dbName}" at "${redactedUri}"`);

    mongoose.connection.on('connected', () => {
      logger.info('Successfully connected to MongoDB database');
    });

    mongoose.connection.on('error', (err) => {
      const sanitizedErr = sanitizeError(err);
      logger.error({ err: sanitizedErr }, 'MongoDB connection error occurred');
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB connection disconnected');
    });

    await mongoose.connect(config.mongodbUri, {
      dbName: config.dbName
    });

  } catch (error) {
    const sanitizedError = sanitizeError(error);
    logger.fatal({ err: sanitizedError }, 'Failed to establish initial MongoDB connection');
    throw sanitizedError;
  }
};

export const disconnectDatabase = async () => {
  try {
    logger.info('Closing MongoDB connection...');
    await mongoose.disconnect();
    logger.info('MongoDB connection closed successfully');
  } catch (error) {
    const sanitizedError = sanitizeError(error);
    logger.error({ err: sanitizedError }, 'Error while closing MongoDB connection');
  }
};
