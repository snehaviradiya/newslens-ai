# NewsLens AI — Backend Service

## Overview

The `backend/` module provides the core RESTful application server for NewsLens AI, developed with **Node.js**, **Express**, and **Prisma ORM** connecting to **PostgreSQL**.

It is responsible for client authentication, ingestion scheduling, data persistence, event clustering orchestration, and coordinating analysis requests with the dedicated AI/NLP Engine.

## Day 3 Implementation Status

The backend foundation is implemented and tested. PostgreSQL-backed routes are available; live database data is required for auth and news records. No mock articles, sources, analyses, or comparisons are returned by the API.

The article analysis endpoint currently returns `501 NOT_IMPLEMENTED` until the Day 5 AI/NLP engine is connected.

## Setup

```sh
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Set `DATABASE_URL` to a valid PostgreSQL instance and `JWT_SECRET` to a secret of at least 32 characters.

## Verification

```sh
npm test
npm run build
npm run prisma:validate
npm run prisma:migrate:deploy
```

## API Routes

- `GET /health`
- `GET /api/v1`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/sources`
- `GET /api/v1/sources/:id`
- `GET /api/v1/articles`
- `GET /api/v1/articles/:id`
- `POST /api/v1/articles/analyze` — returns `501` until the AI engine exists
- `GET /api/v1/events`
- `GET /api/v1/events/:id`
- `GET /api/v1/analyses`
- `GET /api/v1/analyses/:id`
- `GET /api/v1/comparisons`
- `GET /api/v1/comparisons/:id`
- `GET /api/v1/history` — protected by a bearer token

## Mobile Connection

Set `EXPO_PUBLIC_API_BASE_URL` in `mobile/.env`:

- iOS simulator: `http://localhost:3000`
- Android emulator: `http://10.0.2.2:3000`
- Physical device: `http://<development-machine-LAN-IP>:3000`

Use `CORS_ORIGIN` to allow the exact Expo origin in development; do not use unrestricted production CORS.

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
