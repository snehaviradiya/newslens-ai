# NewsLens AI — Backend Service

## Overview

The `backend/` module provides the core RESTful application server for NewsLens AI, developed with **Node.js**, **Express**, and **Prisma ORM** connecting to **PostgreSQL**.

It is responsible for client authentication, ingestion scheduling, data persistence, event clustering orchestration, and coordinating analysis requests with the dedicated AI/NLP Engine.

## Planned Technology Stack

- **Runtime & Framework:** Node.js, Express.js
- **Language:** JavaScript / TypeScript (Node.js LTS)
- **Database ORM:** Prisma ORM
- **Database Engine:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens) with bcrypt password hashing
- **News Collection:** RSS feed parsers (`rss-parser`), news API integrations, and sanitization pipelines
- **HTTP Client:** Axios for asynchronous communication with the AI Engine
- **Validation & Security:** Zod / Joi schema validation, Helmet, CORS, and rate limiting

## Key Responsibilities

1. **User Authentication & Profiles:** Registration, login, JWT token issuance, and protected routes.
2. **News Ingestion Pipeline:** Automated polling of diverse news source RSS feeds and API endpoints (scheduled for 22 November).
3. **Event & Article Management:** Storing canonical article metadata, raw text, and relating articles to real-world event clusters.
4. **AI Engine Coordination:** Dispatching articles to the FastAPI AI service for NLP processing and caching structured analysis results.
5. **Comparison & Report Endpoints:** Aggregating cross-source article analyses into interactive comparison payloads for the mobile client.

## Development Schedule

- **Scheduled Backend Architecture & Auth Date:** 21 November 2026
- **Scheduled News Ingestion Date:** 22 November 2026
- **Deliverables:**
  - Express server architecture with modular routing, middleware, and error handling
  - PostgreSQL schema and Prisma models
  - Authentication endpoints (register, login, me)
  - Article, event, and analysis retrieval APIs
