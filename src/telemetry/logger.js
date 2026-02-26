'use strict';

const pino = require('pino');

const transport =
  process.env.NODE_ENV !== 'production'
    ? pino.transport({ target: 'pino-pretty', options: { colorize: true } })
    : undefined;

/**
 * Async/non-blocking Pino logger.
 * All telemetry fields are emitted asynchronously via setImmediate in route handlers
 * to avoid adding overhead to request latency.
 */
const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    base: { service: 'protocol-tokenization-gateway' },
    timestamp: pino.stdTimeFunctions.isoTime
  },
  transport
);

module.exports = logger;
