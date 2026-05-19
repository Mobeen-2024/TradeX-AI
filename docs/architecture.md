# Reference Only
This file defines long-term system architecture.
Do NOT use as direct implementation instructions.
Only consult when task explicitly affects infrastructure or backend design.

# TradeX OS - Migration Strategy & Architecture

## Executive Summary
TradeX OS is transitioning from a frontend-heavy simulation environment into a production-grade, institutional PERN (PostgreSQL, Express, React, Node.js) application. This migration shifts computational load, API security, and agent orchestration from the client to a scalable backend infrastructure. 

## 1. High-Level Migration Strategy
- **Phase 1: Foundation & Security** - Scaffold Express.js, secure API keys, and setup PostgreSQL pool.
- **Phase 2: State Migration** - Replace local state/storage with robust PostgreSQL models (see `database.md`).
- **Phase 3: Agent Orchestration** - Implement Pub/Sub event pipelines and background queues (see `agents.md`).
- **Phase 4: Low-Latency Telemetry** - Migrate to WebSocket streaming for fast market data updates.

## 2. Backend Systems Overview (Express + Node)
The Express backend acts as the unified Data and Event Gateway:
- **Vite Middleware**: Serves the React frontend via SPA fallback mapping natively.
- **Service Controllers**: Decoupled routing handling AI capabilities, Market configurations, and Database insertions.
- **Security**: JWT-based authentication and rate-limiting.

## 3. API Layer Basics
- **REST APIs**: `GET /api/market/regime`, `POST /api/intelligence/analyze`, `GET /api/memory/search`.
- **WebSockets**: `/ws/orderbook` and `/ws/agent-telemetry` for live streaming.

## Reference Documentation
For detailed specifics, refer to:
- **Database Models**: `/docs/database.md`
- **Event Pipelines & AI Agents**: `/docs/agents.md`
- **Deployment Strategy**: `/docs/deployment.md`
