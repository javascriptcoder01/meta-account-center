import dns from 'node:dns';
import app from './app.js';
import config from './config/env.js';
import logger from './config/logger.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

dns.setDefaultResultOrder('ipv4first');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Fallback silently if setServers fails
}



let server;

const startServer = async () => {
  try {
    await connectDatabase();

    server = app.listen(config.port, () => {
      logger.info(`Server successfully started in "${config.env}" mode listening on port: ${config.port}`);
    });

    process.on('unhandledRejection', (reason) => {
      logger.fatal({ reason }, 'Unhandled Promise Rejection detected');
      gracefulShutdown('UNHANDLED_REJECTION');
    });

    process.on('uncaughtException', (error) => {
      logger.fatal({ err: error }, 'Uncaught Exception detected');
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.fatal({ err: error }, 'Fatal server startup failure');
    process.exit(1);
  }
};

const gracefulShutdown = (signal) => {
  logger.warn(`Received signal "${signal}". Commencing graceful server shutdown sequence...`);

  if (server) {
    logger.info('Stopping HTTP server from accepting new requests...');
    server.close(async () => {
      logger.info('HTTP server closed successfully.');

      await disconnectDatabase();

      logger.info('Graceful shutdown completed successfully. Exiting.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }

  setTimeout(() => {
    logger.fatal('Forceful termination triggered: server took too long to shutdown.');
    process.exit(1);
  }, 10000);
};

startServer();
