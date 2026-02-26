'use strict';

/**
 * Exported for use in unit tests — mirrors the Fastify route body schema.
 */
const REQUEST_BODY_SCHEMA = {
  type: 'object',
  required: ['command', 'parsing_protocol', 'output_format_spec', 'payload_data'],
  properties: {
    command: { type: 'string', minLength: 1 },
    parsing_protocol: { type: 'string', enum: ['DELIMITED_STRING_SPLIT'] },
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

module.exports = { REQUEST_BODY_SCHEMA };
