# NewsLens AI — Backend Service

## Overview

The `backend/` module provides the core RESTful application server for NewsLens AI, developed with **Node.js**, **Express**, and **Prisma ORM** connecting to **PostgreSQL**.

It is responsible for client authentication, ingestion scheduling, data persistence, event clustering orchestration, and coordinating analysis requests with the dedicated AI/NLP Engine.

## Current Implementation Status

The backend foundation is implemented and tested. PostgreSQL-backed routes are available; live database data is required for auth and news records. No mock articles, sources, analyses, or comparisons are returned by the API.

Pasted article text is forwarded to the rule-based AI/NLP engine. URL-only analysis still returns `501` because article fetching is not implemented. Event matching and cross-source comparisons use deterministic lexical and date signals; results are not semantic judgments or evidence of editorial intent. Event and comparison routes return database-backed records only.

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
- `POST /api/v1/sources` — protected by bearer token (`RESEARCHER` or `ADMIN`)
- `PATCH /api/v1/sources/:id` — protected by bearer token (`RESEARCHER` or `ADMIN`)
- `POST /api/v1/sources/validate-feed` — test and validate any RSS/Atom feed URL
- `GET /api/v1/articles` — supports `search`, `sourceId`, `startDate`, `endDate`, `sortBy`, `sortOrder`, pagination
- `GET /api/v1/articles/:id`
- `POST /api/v1/articles/analyze` — forwards article text to the AI engine
- `POST /api/v1/articles/:id/analyze` — authenticated; persists analysis and user history
- `POST /api/v1/articles/analyze/batch` — authenticated; analyzes up to 20 stored article IDs sequentially
- `GET /api/v1/collection/status` — current ingestion job state and last run metadata
- `POST /api/v1/collection/run` — trigger manual collection cycle across active sources (`RESEARCHER` or `ADMIN`)
- `GET /api/v1/events`
- `GET /api/v1/events/:id`
- `GET /api/v1/events/:id/articles` — paginated member articles
- `POST /api/v1/events/detect` — researcher/admin event detection (`articleId` or `limit`)
- `POST /api/v1/events/:id/compare` — persist deterministic comparisons for cross-source article pairs
- `GET /api/v1/analyses`
- `GET /api/v1/analyses/:id`
- `GET /api/v1/comparisons`
- `GET /api/v1/comparisons/:id`
- `GET /api/v1/history` — protected by a bearer token

## Event matching and comparisons

Newly ingested articles are checked against articles published within 72 hours. Matching combines headline token Dice similarity (30%), article text similarity (30%), entity overlap (20%), topic overlap (10%), and date proximity (10%). The configurable `EVENT_MATCH_THRESHOLD` defaults to `0.52` (valid range `0.1`–`1`). A match also requires minimum headline and text overlap, or at least two shared entities plus a shared topic. The candidate pool is capped at 200 recent articles. Unmatched articles remain ungrouped. These are lexical heuristics, not semantic understanding; same-person mentions alone do not create a match.

Comparisons reuse saved article analysis or request and persist a new rule-based analysis. They compare headline indicators, extracted entity/topic overlap, verbatim attributed quotes, and framing scores with excerpts copied only when present in the stored article text. They do not infer intent or deliberate omission. Apply the new migration with `npx prisma migrate deploy` before using persistence against an existing database.

Public registration always creates a `USER`. Set `RESEARCHER_EMAILS` to a comma-separated allowlist of addresses that may self-register as `RESEARCHER`; client-supplied role values are ignored. The JWT used by the mobile client is currently held in memory for that app session.

## RSS Ingestion & Collection Pipeline

NewsLens AI includes an automated, idempotent RSS collection pipeline:
- **Verified Sources:** Configured with BBC News, The Guardian, The New York Times, and NPR News.
- **URL & Content Normalization:** Enforces HTTPS, removes tracking parameters (`utm_*`, `fbclid`), and cleans HTML markup.
- **Deduplication:** Uses database unique constraints on `originalUrl` to guarantee idempotent multi-run execution without article duplication.
- **Scheduler:** Configurable background collection via `ENABLE_COLLECTION_SCHEDULER=true` and `COLLECTION_INTERVAL_MINUTES=60`.

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
