'use strict';

const { v4: uuidv4 } = require('uuid');
const tokenizer = require('../engine/tokenizer');
const logger = require('../telemetry/logger');

const bodySchema = {
  type: 'object',
  required: ['command', 'parsing_protocol', 'output_format_spec', 'payload_data'],
  properties: {
    command: { type: 'string', minLength: 1 },
    parsing_protocol: {
      type: 'string',
      enum: ['DELIMITED_STRING_SPLIT']
    },
    output_format_spec: {
      type: 'object',
      required: ['split_delimiter', 'join_delimiter'],
      properties: {
        split_delimiter: { type: 'string', minLength: 1, maxLength: 10 },
        join_delimiter: { type: 'string', minLength: 0, maxLength: 10 }
      },
      additionalProperties: false
    },
    payload_data: { type: 'string' }
  },
  additionalProperties: false
};

async function parseRoute(fastify) {
  fastify.post(
    '/parse',
    {
      schema: {
        body: bodySchema
      },
      schemaErrorFormatter: (errors) => {
        const fields = errors.map((e) => ({
          field: e.instancePath.replace(/^\//, '') || e.params?.missingProperty || 'unknown',
          reason: e.message
        }));
        const err = new Error('Schema validation failed');
        err.statusCode = 400;
        err.validationFields = fields;
        return err;
      }
    },
    async (request, reply) => {
      const requestId = uuidv4();
      const requestReceivedTs = Date.now();

      const { parsing_protocol, output_format_spec, payload_data } = request.body;

      let parseStatus = 'failure';
      let tokenCount = 0;
      let errorType = null;
      let result = null;

      const parsingStartTs = Date.now();

      try {
        result = tokenizer.tokenize({
          protocol: parsing_protocol,
          splitDelimiter: output_format_spec.split_delimiter,
          joinDelimiter: output_format_spec.join_delimiter,
          payload: payload_data
        });
        parseStatus = 'success';
        tokenCount = result.tokenCount;
      } catch (err) {
        errorType = err.code || 'PARSE_ERROR';
        const parsingEndTs = Date.now();
        const responseEmittedTs = Date.now();
        const latencyMs = responseEmittedTs - requestReceivedTs;

        logger.info({
          request_id: requestId,
          parse_status: 'failure',
          token_count: 0,
          latency_ms: latencyMs,
          compliance_pass: false,
          error_type: errorType,
          request_received_timestamp: requestReceivedTs,
          parsing_start_timestamp: parsingStartTs,
          parsing_end_timestamp: parsingEndTs,
          response_emitted_timestamp: responseEmittedTs
        });

        return reply.code(422).send({
          error: 'UNPROCESSABLE_PAYLOAD',
          message: err.message,
          request_id: requestId
        });
      }

      const parsingEndTs = Date.now();
      const responseEmittedTs = Date.now();
      const latencyMs = responseEmittedTs - requestReceivedTs;

      // Async telemetry — does not block response
      setImmediate(() => {
        logger.info({
          request_id: requestId,
          parse_status: parseStatus,
          token_count: tokenCount,
          latency_ms: latencyMs,
          compliance_pass: true,
          error_type: null,
          request_received_timestamp: requestReceivedTs,
          parsing_start_timestamp: parsingStartTs,
          parsing_end_timestamp: parsingEndTs,
          response_emitted_timestamp: responseEmittedTs
        });
      });

      return reply.code(200).send({
        request_id: requestId,
        tokens: result.tokens,
        token_count: tokenCount,
        latency_ms: latencyMs
      });
    }
  );

  // Override AJV validation errors to return 400 with field details
  fastify.setErrorHandler((error, request, reply) => {
    if (error.validation || error.statusCode === 400) {
      const fields = error.validationFields ||
        (error.validation || []).map((e) => ({
          field: e.instancePath.replace(/^\//, '') || e.params?.missingProperty || 'unknown',
          reason: e.message
        }));
      return reply.code(400).send({
        error: 'VALIDATION_FAILED',
        fields
      });
    }
    throw error;
  });
}

module.exports = parseRoute;
