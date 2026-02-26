'use strict';

const supertest = require('supertest');
const app = require('../src/server');

const validPayloads = require('./valid_payloads.json');
const malformedPayloads = require('./malformed_payloads.json');
const edgeCases = require('./edge_cases.json');
const benchmarkSuite = require('./benchmark_suite.json');

let server;

beforeAll(async () => {
  await app.ready();
  server = app.server;
});

afterAll(async () => {
  await app.close();
});

describe('valid payloads', () => {
  validPayloads.forEach(({ description, request, expected_tokens, expected_status }) => {
    it(description, async () => {
      const res = await supertest(server).post('/parse').send(request);
      expect(res.status).toBe(expected_status || 200);
      expect(res.body.tokens).toBe(expected_tokens);
    });
  });
});

describe('malformed payloads', () => {
  malformedPayloads.forEach(({ description, request, expected_status }) => {
    it(description, async () => {
      const res = await supertest(server).post('/parse').send(request);
      expect(res.status).toBe(expected_status || 400);
      expect(res.body.error).toBe('VALIDATION_FAILED');
    });
  });
});

describe('edge cases', () => {
  edgeCases.forEach(({ description, request, expected_tokens, expected_token_count }) => {
    it(description, async () => {
      const res = await supertest(server).post('/parse').send(request);
      expect(res.status).toBe(200);
      expect(res.body.tokens).toBe(expected_tokens);
      if (expected_token_count !== undefined) {
        expect(res.body.token_count).toBe(expected_token_count);
      }
    });
  });
});

describe('benchmark', () => {
  benchmarkSuite.forEach(({ description, request }) => {
    it(`latency < 50ms: ${description}`, async () => {
      const res = await supertest(server).post('/parse').send(request);
      expect(res.status).toBe(200);
      expect(res.body.latency_ms).toBeLessThan(50);
    });
  });
});
