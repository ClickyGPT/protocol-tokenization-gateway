# Protocol Tokenization Gateway

> Stateless REST microservice — receives structured JSON commands and tokenizes payload data via configurable parsing protocols.

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org)
[![Fastify](https://img.shields.io/badge/Fastify-4.x-black)](https://fastify.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-ready-blue)](https://docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                  Protocol Tokenization Gateway           │
│                                                          │
│  POST /parse ──► Validator ──► Engine ──► Formatter      │
│                      │                      │            │
│               400 Bad Request         200 + tokens       │
│                                              │            │
│                                    Async Telemetry (Pino)│
│                                              │            │
│                                    ELK / Datadog / PG    │
└──────────────────────────────────────────────────────────┘
```

## Quick Start

```bash
# 1. Clone
git clone https://github.com/ClickyGPT/protocol-tokenization-gateway
cd protocol-tokenization-gateway

# 2. Install deps
npm install

# 3. Configure environment
cp .env.example .env

# 4. Run locally
npm run dev

# 5. Docker Compose (full stack)
docker-compose up --build
```

## API

### `POST /parse`

**Request**
```json
{
  "command": "TOKENIZE",
  "parsing_protocol": "DELIMITED_STRING_SPLIT",
  "output_format_spec": { "join_delimiter": ",", "split_delimiter": " " },
  "payload_data": "simulated descope ceasefireWidget optimizing l1X9!qrT"
}
```

**Response 200**
```json
{
  "request_id": "a1b2c3d4",
  "tokens": "simulated,descope,ceasefireWidget,optimizing,l1X9!qrT",
  "token_count": 5,
  "latency_ms": 4
}
```

**Response 400** (schema failure)
```json
{
  "error": "VALIDATION_FAILED",
  "fields": [{ "field": "parsing_protocol", "reason": "required" }]
}
```

## KPIs

| Metric | Target |
|---|---|
| Command Compliance Rate | ≥ 95% |
| P90 Latency (1KB payload) | < 50ms |
| Token Accuracy Score | ≥ 98% |
| Service Uptime | ≥ 99.9% |
| 5xx Error Rate | < 0.5% |

## Test Suite

```bash
npm test                  # all tests
npm run test:valid        # valid_payloads.json
npm run test:malformed    # malformed_payloads.json
npm run test:edge         # edge_cases.json
npm run test:benchmark    # benchmark_suite.json
```

## Project Structure

```
├── src/
│   ├── server.js          # Fastify bootstrap
│   ├── routes/parse.js    # POST /parse handler
│   ├── engine/
│   │   ├── tokenizer.js   # DELIMITED_STRING_SPLIT engine
│   │   └── protocols.js   # Protocol registry
│   ├── validation/
│   │   └── schema.js      # AJV JSON schema
│   └── telemetry/
│       └── logger.js      # Pino async logger
├── tests/
│   ├── valid_payloads.json
│   ├── malformed_payloads.json
│   ├── edge_cases.json
│   └── benchmark_suite.json
├── k8s/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── hpa.yaml
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── openapi.yaml
```

## License

MIT © ClickyGPT
