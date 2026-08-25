import pino from 'pino';
import config from './env.js';

const redactPaths = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["set-cookie"]',
  'password',
  'passwordHash',
  'accessToken',
  'refreshToken',
  'refreshTokenHash',
  'token',
  'tokenHash',
  'secret',
  'credentials',
  'mongodbUri',
  'MONGODB_URI'
];

const isDevelopment = config.env === 'development';

const pinoOptions = {
  level: config.logLevel,
  redact: {
    paths: redactPaths,
    censor: '[REDACTED]'
  },
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err
  }
};

const transport = isDevelopment
  ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  }
  : undefined;

const logger = transport ? pino(pinoOptions, pino.transport(transport)) : pino(pinoOptions);

export default logger;
