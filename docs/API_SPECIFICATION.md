# NewsLens AI — API Specification

## 1. Overview

NewsLens AI exposes two primary REST API layers:
1. **Application Backend API (`backend/`):** Exposed to the Mobile Client on port `3000` (or `PORT` environment variable), prefixed with `/api/v1`.
2. **AI & NLP Engine API (`ai-engine/`):** Internal microservice exposed on port `8000`, prefixed with `/api/v1`.

All requests and responses use `application/json` content type unless specified otherwise.

---

## 2. Backend REST API (Client-Facing)

### 2.1 System & Health Endpoints
- **`GET /health`**
  - **Description:** Returns service liveness status.
  - **Response 200 OK:**
    ```json
    {
      "status": "ok",
      "service": "NewsLens AI Backend",
      "timestamp": "2026-11-19T10:00:00Z"
    }
    ```

### 2.2 Authentication Endpoints
- **`POST /api/v1/auth/register`**
  - **Body:** `{ "email": "user@example.com", "password": "securePassword123", "displayName": "Sneha" }`
  - **Response 201 Created:** `{ "user": { "id": "...", "email": "user@example.com", "displayName": "Sneha" }, "token": "jwt..." }`
- **`POST /api/v1/auth/login`**
  - **Body:** `{ "email": "user@example.com", "password": "securePassword123" }`
  - **Response 200 OK:** `{ "user": { "id": "...", "email": "user@example.com" }, "token": "jwt..." }`
- **`GET /api/v1/auth/me`**
  - **Headers:** `Authorization: Bearer <jwt_token>`
  - **Response 200 OK:** Current user profile.

### 2.3 News Events Endpoints
- **`GET /api/v1/events`**
  - **Query Params:** `page` (default 1), `limit` (default 20), `category` (optional)
  - **Response 200 OK:** Paginated list of event clusters with multi-source perspective badges.
- **`GET /api/v1/events/:id`**
  - **Description:** Retrieve an event cluster, member articles, and source distribution.
- **`GET /api/v1/events/:id/articles?page=1&limit=20`** — Paginated articles assigned to an event.
- **`POST /api/v1/events/detect`** (Researcher/Admin) — Optional body `{ "articleId": "..." }` to match one article, or `{ "limit": 100 }` to process ungrouped articles.
- **`POST /api/v1/events/:id/compare`** — Optional body `{ "articleIds": ["...", "..."] }`; generates and persists rule-based comparisons between articles from distinct sources.

### 2.5 News Sources Management Endpoints
- **`GET /api/v1/sources`**
  - **Query Params:** `category`, `country`, `isActive`, `page`, `limit`
  - **Description:** Retrieve paginated configured news sources with monitored article counts.
- **`GET /api/v1/sources/:id`**
  - **Description:** Retrieve details for a specific news source.
- **`POST /api/v1/sources`** (Protected: Researcher/Admin)
  - **Body:** `{ "name": "...", "websiteUrl": "https://...", "rssFeedUrl": "https://...", "description": "...", "country": "...", "category": "..." }`
  - **Description:** Add a new verified news source and feed configuration.
- **`PATCH /api/v1/sources/:id`** (Protected: Researcher/Admin)
  - **Description:** Update source metadata, feed URL, or active status.
- **`POST /api/v1/sources/validate-feed`**
  - **Body:** `{ "feedUrl": "https://feeds.bbci.co.uk/news/rss.xml" }`
  - **Description:** Tests if a given URL is a valid, parseable RSS/Atom feed and returns feed title and item count.

### 2.6 News Articles Endpoints
- **`GET /api/v1/articles`**
  - **Query Params:** `sourceId`, `eventId`, `search`, `startDate`, `endDate`, `sortBy`, `sortOrder`, `page`, `limit`
  - **Description:** Retrieve paginated articles with optional keyword search across headlines/summaries and publication date range filtering.
- **`GET /api/v1/articles/:id`**
  - **Description:** Retrieve single article metadata, extracted text, and associated source.
- **`POST /api/v1/articles/analyze`**
  - **Body:** `{ "url": "https://..." }` or `{ "text": "..." }`
  - **Description:** Pasted text is forwarded to the rule-based AI engine. URL-only input returns 501 because URL fetching is not implemented.

### 2.7 News Ingestion & Collection Endpoints
- **`GET /api/v1/collection/status`**
  - **Description:** Retrieve current status of the collection pipeline (running flag and previous execution summary).
- **`POST /api/v1/collection/run`** (Protected: Researcher/Admin)
  - **Headers:** `Authorization: Bearer <jwt_token>`
  - **Description:** Trigger an idempotent news collection cycle across all active RSS sources. Concurrency-guarded to reject overlapping executions with HTTP 409.

### 2.8 Analysis, Comparison, and History Endpoints
- `GET /api/v1/analyses` — Paginated stored analysis records.
- `GET /api/v1/analyses/:id` — One stored article analysis.
- `GET /api/v1/comparisons` — Paginated stored comparisons.
- `GET /api/v1/comparisons/:id` — One stored comparison.
- `GET /api/v1/history` — Authenticated user's analysis/comparison history.

Collection endpoints use `page` and `limit` query parameters. Data that has not been collected or analyzed is not fabricated.

Event matching uses a 72-hour publication window and a configurable `EVENT_MATCH_THRESHOLD` (default `0.52`). A weighted lexical score combines headline similarity (30%), article-text similarity (30%), entities (20%), topics (10%), and publication-date proximity (10%), plus minimum-overlap gates. Matching is heuristic and does not establish semantic identity. Comparisons retain structured headline, entity, topic, quote, framing, evidence, similarity, limitation, and method metadata in `ArticleComparison`; snippets are included only when they occur in the corresponding stored article text. The system does not infer intent or deliberate omissions.

---

## 3. AI & NLP Engine API (Internal Microservice)

### 3.1 Health Endpoint
- **`GET /health`**
  - **Response 200 OK:** `{ "status": "ok", "service": "NewsLens AI NLP Engine" }`

### 3.2 Text Preprocessing Endpoint
- **`POST /api/v1/preprocess`**
  - **Body:** `{ "text": "Raw article string..." }`
  - **Response 200 OK:**
    ```json
    {
      "cleanedText": "...",
      "sentences": ["...", "..."],
      "tokenCount": 350
    }
    ```

### 3.3 Article Analysis Endpoint
- **`POST /api/v1/analyze`**
  - **Body:**
    ```json
    {
      "articleId": "cuid...",
      "headline": "Article Title Here",
      "content": "Full article body...",
      "sourceName": "BBC News"
    }
    ```
  - **Response 200 OK:**
    ```json
    {
      "articleId": "cuid...",
      "modelVersion": "1.0.0",
      "headlineSentiment": 0.12,
      "headlineSensationalism": 0.08,
      "overallTone": "NEUTRAL",
      "subjectivityScore": 0.22,
      "framingScores": {
        "conflict": 0.35,
        "economic": 0.78,
        "humanInterest": 0.15,
        "morality": 0.05,
        "attributionOfResponsibility": 0.60
      },
      "entities": [
        { "name": "European Central Bank", "type": "ORG", "mentions": 4, "sentiment": 0.05 }
      ],
      "quotes": [
        { "speaker": "Christine Lagarde", "quote": "...", "sentiment": 0.10 }
      ],
      "supportingEvidence": [
        { "frame": "economic", "excerpt": "Inflation pressures continued to soften..." }
      ]
    }
    ```

### 3.4 Event Similarity & Clustering Endpoint
- **`POST /api/v1/cluster`**
  - **Body:** `{ "headline": "...", "content": "...", "existingEvents": [...] }`
  - **Response 200 OK:** Best matching cluster ID or recommendation to create a new cluster.
