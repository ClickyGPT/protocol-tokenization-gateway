'use strict';

require('dotenv').config();
const fastify = require('fastify')({
  logger: false // Pino managed separately via telemetry module
});

const parseRoute = require('./routes/parse');
const logger = require('./telemetry/logger');

// Register routes
fastify.register(parseRoute);

// Health check
fastify.get('/health', async () => ({ status: 'ok', ts: new Date().toISOString() }));

// Global error handler
fastify.setErrorHandler((error, request, reply) => {
  logger.error({ err: error, url: request.url }, 'Unhandled error');
  reply.code(500).send({ error: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred.' });
});

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000', 10);
    const host = process.env.HOST || '0.0.0.0';
    await fastify.listen({ port, host });
    logger.info({ port, host }, 'Protocol Tokenization Gateway started');
  } catch (err) {
    logger.error(err, 'Failed to start server');
    process.exit(1);
  }
};

start();
module.exports = fastify; // export for testing
