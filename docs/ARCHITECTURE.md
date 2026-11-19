# NewsLens AI — Technical Architecture & System Design

## 1. Architectural Overview

NewsLens AI is architected as a decoupled, multi-tier system composed of a client-side mobile application, an orchestrating REST API backend with relational persistence, and a dedicated AI/NLP microservice.

```
+-------------------------------------------------------------+
|                     Mobile Application                      |
|           (React Native + Expo + TypeScript)                |
+-------------------------------------------------------------+
                              |
                     HTTPS / JSON REST
                              |
                              v
+-------------------------------------------------------------+
|                      Backend Service                        |
|                  (Node.js + Express.js)                     |
|                                                             |
|  +-------------------+  +------------------+  +----------+  |
|  | Auth & Middleware |  | Ingestion Worker |  | DB Layer |  |
|  |    (JWT, CORS)    |  |  (RSS / NewsAPI) |  | (Prisma) |  |
|  +-------------------+  +------------------+  +----------+  |
+-------------------------------------------------------------+
           |                                       |
    Internal HTTP REST                             |
           |                                       v
           v                           +----------------------+
+----------------------+               | PostgreSQL Database  |
|     AI/NLP Engine    |               |  (Users, Articles,   |
|   (Python + FastAPI) |               |  Events, Analyses,   |
|                      |               |     Comparisons)     |
| +------------------+ |               +----------------------+
| | Preprocessing    | |
| +------------------+ |
| | Hugging Face     | |
| | Transformers     | |
| +------------------+ |
| | Framing Analyzer | |
| +------------------+ |
| | Event Matcher    | |
| +------------------+ |
+----------------------+
```

---

## 2. Component Breakdown

### 2.1 Mobile Application (`mobile/`)
- **Framework:** React Native managed with Expo SDK and TypeScript.
- **Role:** Delivers the user-facing experience across iOS and Android devices.
- **Key Modules:**
  - `navigation/`: Stack and bottom-tab navigation handling transitions between screens.
  - `screens/`:
    - `HomeScreen`: Event feed with multi-source perspective cards.
    - `EventDetailScreen`: Clustered articles from different news organizations.
    - `ComparisonScreen`: Side-by-side headline, framing, and quote comparisons.
    - `ArticleDetailScreen`: Deep dive into an individual article's evidence-based analysis.
    - `AuthScreens`: User registration, login, and profile management.
  - `components/`: Modular design system components (Badges, PerspectiveBars, EvidenceQuotes, MetricCards).
  - `services/`: Axios HTTP client configured with environment-based backend URLs.

### 2.2 Backend Service (`backend/`)
- **Runtime:** Node.js LTS with Express.js.
- **ORM & Data Access:** Prisma ORM connecting to PostgreSQL.
- **Role:** Coordinates client requests, authentication, news ingestion, data persistence, and communication with the AI Engine.
- **Key Modules:**
  - `routes/`: Structured API endpoints under `/api/v1` for auth, news, events, articles, and comparisons.
  - `controllers/`: Request handling, validation, and response formatting.
  - `services/`:
    - `IngestionService`: Polling and parsing RSS feeds and external news APIs.
    - `EventService`: Managing event clusters and article associations.
    - `AiClientService`: Dispatches NLP jobs to the FastAPI service and persists results.
  - `middleware/`: JWT verification, rate limiting, request validation, and centralized error handling.

### 2.3 AI & NLP Engine (`ai-engine/`)
- **Runtime:** Python 3.10+ with FastAPI and Uvicorn.
- **Role:** High-performance computational NLP engine performing multi-dimensional framing, entity extraction, sentiment, and event clustering.
- **Key Modules:**
  - `app/main.py`: FastAPI application router exposing `/health` and analysis endpoints.
  - `app/services/preprocessing.py`: Text cleaning, sentence tokenization, boilerplate removal.
  - `app/services/entities.py`: Named Entity Recognition (NER) and entity-level sentiment.
  - `app/services/sentiment.py`: Sentence and document-level tone and subjectivity scoring.
  - `app/services/framing.py`: Multi-label framing classification (Conflict, Economic, Human Interest, Morality, Attribution).
  - `app/services/event_clustering.py`: Sentence-Transformers vector similarity for cross-source article grouping.

### 2.4 Database Layer (PostgreSQL)
- **Role:** Relational persistence of application state, user accounts, news sources, raw articles, event clusters, granular NLP analysis results, and cross-source comparisons.
- **Key Characteristics:**
  - Strong relational integrity with foreign key cascades.
  - JSONB storage for flexible, versioned NLP outputs, entity maps, and evidence quote spans.
  - B-tree indexing on frequent query paths (timestamps, event IDs, source URLs).

---

## 3. Core Request & Processing Workflows

### 3.1 News Ingestion & Event Clustering Pipeline
```
[External Sources]
   | (RSS / API)
   v
[Backend Ingestion Worker] ---> Extracts text, metadata, canonical URL
   |
   +---> Persists raw article in PostgreSQL
   |
   +---> Dispatches text to [AI Engine: /api/v1/cluster]
            |
            v
         Computes embeddings -> Matches existing event or creates new cluster
            |
            v
         Returns cluster ID -> Backend links article to NewsEvent
```

### 3.2 On-Demand & Background Article Analysis
```
[Backend Worker or User Request]
   |
   v
[AI Engine: /api/v1/analyze]
   |
   +---> Preprocess & tokenize
   +---> Extract Entities (NER) & Quotes
   +---> Classify Framing Dimensions (Conflict, Economic, Morality, etc.)
   +---> Compute Tone, Subjectivity, and Emotional Polarity
   +---> Extract Evidence Excerpts
   |
   v
[Structured Analysis Result (JSON)]
   |
   v
[Persisted in PostgreSQL via Prisma]
   |
   v
[Delivered to Mobile App as Interactive Report]
```

### 3.3 Side-by-Side Cross-Source Comparison
```
[Mobile Client: Request Comparison of Article A & Article B]
   |
   v
[Backend: /api/v1/comparisons?articleA=...&articleB=...]
   |
   +---> Fetches analyses of Article A and Article B
   +---> Calculates Headline Divergence
   +---> Calculates Framing Differences & Tone Contrast
   +---> Compares Quoted Stakeholders (Overlap vs Unique)
   +---> Assembles Evidence-Backed Comparison Matrix
   |
   v
[Mobile UI Renders Interactive Side-by-Side Visualization]
```

---

## 4. Key Architectural Decisions & Rationale

| Decision | Rationale | Alternatives Considered |
|---|---|---|
| **Separation of Backend (Node.js) and AI (Python)** | Leverages Node.js for high-concurrency I/O and mobile API serving while dedicating Python to CPU/GPU-intensive PyTorch/HuggingFace ML pipelines. | Monolithic Python (Django/FastAPI for everything) or Monolithic Node (limited NLP ecosystem). |
| **Prisma ORM with PostgreSQL** | Type-safe database queries, declarative migrations, native support for JSONB evidence payloads, and rapid developer velocity. | TypeORM, Sequelize, or raw SQL. |
| **Article-Level Evidence Grounding** | Avoids unethical and scientifically unsound blanket media bias scoring; builds user trust through transparent textual citations. | Single outlet bias databases (e.g. static bias charts). |
| **React Native with Expo** | Fast cross-platform compilation (iOS & Android) with unified TypeScript codebase and strong developer tooling. | Native Swift/Kotlin or Flutter. |
