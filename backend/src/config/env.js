import dotenv from 'dotenv';
import path from 'path';
import dns from 'node:dns';

dns.setDefaultResultOrder('ipv4first');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
}

const nodeEnv = process.env.NODE_ENV || 'development';

if (nodeEnv !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

if (nodeEnv === 'test') {
  process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/meta';
  process.env.DB_NAME = 'meta';
  process.env.CORS_ORIGIN = 'http://localhost:5173';
  process.env.LOG_LEVEL = 'silent';
  process.env.JWT_ACCESS_SECRET =
    'test_access_secret_longer_than_32_characters_long_for_security';
  process.env.BCRYPT_SALT_ROUNDS = '4';
}

const requiredEnvVars = [
  'MONGODB_URI',
  'DB_NAME',
  'CORS_ORIGIN',
  'JWT_ACCESS_SECRET'
];

const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`[FATAL] Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

const port = parseInt(process.env.PORT || '5000', 10);
if (isNaN(port) || port <= 0 || port > 65535) {
  console.error(`[FATAL] Invalid PORT specified: ${process.env.PORT}`);
  process.exit(1);
}

const validEnvs = ['development', 'production', 'test'];
if (!validEnvs.includes(nodeEnv)) {
  console.error(`[FATAL] Invalid NODE_ENV specified: ${nodeEnv}`);
  process.exit(1);
}

const validLogLevels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'];
const logLevel = (process.env.LOG_LEVEL || 'info').toLowerCase();
if (!validLogLevels.includes(logLevel)) {
  console.error(`[FATAL] Invalid LOG_LEVEL specified: ${process.env.LOG_LEVEL}. Must be one of: ${validLogLevels.join(', ')}`);
  process.exit(1);
}

const bcryptSaltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
if (isNaN(bcryptSaltRounds) || bcryptSaltRounds < 4 || bcryptSaltRounds > 31) {
  console.error(`[FATAL] Invalid BCRYPT_SALT_ROUNDS specified: ${process.env.BCRYPT_SALT_ROUNDS}. Must be between 4 and 31.`);
  process.exit(1);
}

if (process.env.JWT_ACCESS_SECRET.length < 32) {
  console.error('[FATAL] JWT_ACCESS_SECRET must be at least 32 characters long for security');
  process.exit(1);
}

const config = Object.freeze({
  env: nodeEnv,
  port,
  mongodbUri: process.env.MONGODB_URI,
  dbName: process.env.DB_NAME,
  corsOrigin: process.env.CORS_ORIGIN,
  logLevel,
  bcryptSaltRounds,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  passwordResetExpiresIn: process.env.PASSWORD_RESET_EXPIRES_IN || '15m'
});

export default config;
