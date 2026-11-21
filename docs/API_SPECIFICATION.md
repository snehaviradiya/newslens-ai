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

### 2.4 Articles & Analysis Endpoints
- **`GET /api/v1/articles/:id`**
  - **Description:** Retrieve single article metadata and extracted content.
- **`GET /api/v1/articles/:id/analysis`**
  - **Description:** Retrieve granular NLP analysis (framing, sentiment, entities, quotes, evidence).
- **`POST /api/v1/articles/:id/analyze`**
  - **Description:** Trigger or re-run analysis job via AI Engine.

### 2.5 Cross-Source Comparison Endpoints
- **`GET /api/v1/comparisons`**
  - **Query Params:** `articleA=<id>&articleB=<id>`
  - **Description:** Retrieve or dynamically generate comparative framing analysis between two articles.

### 2.6 Analysis, Comparison, and History Endpoints
- `GET /api/v1/analyses` — Paginated stored analysis records.
- `GET /api/v1/analyses/:id` — One stored article analysis.
- `GET /api/v1/comparisons` — Paginated stored comparisons.
- `GET /api/v1/comparisons/:id` — One stored comparison.
- `GET /api/v1/history` — Authenticated user's analysis/comparison history.

Collection endpoints use `page` and `limit` query parameters. Data that has not been collected or analyzed is not fabricated.

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
