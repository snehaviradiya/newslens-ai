# NewsLens AI — AI-Based News Bias & Framing Analysis System

**NewsLens AI** is an academic AI research and mobile development project exploring how different news sources frame the same real-world events.

The platform provides evidence-based analysis of news framing, language, topics, entities, quotes, and observable political signals at the **individual article level**, moving beyond simplistic, static bias ratings toward transparent, verifiable media analysis.

---

## 1. Academic Problem Statement & Core Philosophy

Conventional media bias rating systems assign static political labels (e.g., "Left", "Right", "Center") to entire news organizations. Such approaches obscure nuanced editorial variance, ignore reporting context, and fail to provide readers with empirical evidence.

**NewsLens AI** adopts an **evidence-first analytical philosophy**:
- **No Blanket Bias Scores:** The system never assigns simplistic fixed political bias scores to entire news organizations.
- **Article-Level Granularity:** Every analysis evaluates a specific published article on its own linguistic and factual merits.
- **Traceable Textual Evidence:** Every detected framing angle, tone indicator, or entity sentiment is directly grounded in cited article excerpts.
- **Multi-Perspective Comparison:** Readers inspect side-by-side comparisons of how diverse outlets frame the same underlying event.

---

## 2. System Architecture

```text
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
   Internal HTTP REST                              |
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

## 3. Technology Stack

| Layer | Technologies | Rationale |
|---|---|---|
| **Mobile Client** | React Native, Expo, TypeScript, React Navigation | Cross-platform (iOS/Android) mobile delivery with type safety and fast iteration. |
| **Backend API** | Node.js, Express.js | High-throughput asynchronous I/O and REST API orchestration. |
| **Database & ORM** | PostgreSQL, Prisma ORM | Relational integrity with JSONB support for versioned analytical evidence payloads. |
| **AI / NLP Engine** | Python 3.10+, FastAPI, Hugging Face Transformers | High-performance machine learning pipelines for NER, sentiment, and framing classification. |
| **News Collection** | RSS / Atom feeds, News APIs | Multi-source automated ingestion with rate limiting and deduplication. |
| **Authentication** | JWT (JSON Web Tokens), bcrypt | Secure, stateless authentication for user profiles and history. |
| **Version Control** | Git, GitHub | Strict branch hygiene directly on `main` with reproducible commit history. |

---

## 4. Repository Structure

```text
newslens-ai/
├── mobile/             # React Native / Expo mobile application (Scheduled: 20 Nov)
├── backend/            # Express.js REST API and Prisma database layer (Scheduled: 21 Nov)
├── ai-engine/          # Python FastAPI NLP & framing analysis microservice (Scheduled: 23 Nov)
├── docs/               # Architecture, requirements, database design, and schedule documentation
│   ├── REQUIREMENTS.md         # Detailed system requirements and framing methodology
│   ├── ARCHITECTURE.md         # Technical architecture and component design
│   ├── DEVELOPMENT_SCHEDULE.md # 8-day development schedule (19 Nov – 26 Nov 2026)
│   ├── DATABASE_DESIGN.md      # PostgreSQL relational schema and data dictionary
│   └── API_SPECIFICATION.md    # REST API contracts and endpoints
├── README.md           # Project overview and baseline documentation
└── .gitignore          # Repository gitignore rules
```

---

## 5. 8-Day Development Schedule & Milestones

The project strictly follows an 8-day development timeline from **19 November 2026** to **26 November 2026**, culminating in a hard project freeze on **26 November 2026**:

| Date | Phase | Key Objectives | Status |
|---|---|---|---|
| **19 Nov 2026** | **Repository Cleanup & Architecture Baseline** | Safe cleanup, baseline project structure, requirements analysis, technical architecture, and documentation. | **Completed** |
| **20 Nov 2026** | **Mobile Application Foundation** | Expo setup, TypeScript config, React Navigation, design tokens, and core screen scaffolding. | Planned |
| **21 Nov 2026** | **Backend Architecture & Database Setup** | Express REST server, PostgreSQL schema, Prisma ORM, and JWT authentication. | Planned |
| **22 Nov 2026** | **News Collection & Ingestion Pipeline** | RSS feed parsers, news API integrations, text extraction, and deduplication. | Planned |
| **23 Nov 2026** | **AI/NLP Engine & Framing Analysis** | FastAPI service, text preprocessing, NER, sentiment, framing classification, and evidence citations. | Planned |
| **24 Nov 2026** | **Related-Event Detection & Comparisons** | Semantic article clustering, event grouping, and cross-source comparative analysis. | Planned |
| **25 Nov 2026** | **End-to-End Integration & UI Polish** | Mobile-to-backend API wiring, interactive comparison reports, testing, and bug fixes. | Planned |
| **26 Nov 2026** | **Final Testing, APK, Deployment & Freeze** | Regression testing, Android APK generation, final synchronization, academic submission, and project freeze. | Planned |

> **Final Deadline Note:** No code modifications, feature additions, documentation changes, or git commits are permitted after **26 November 2026**.

---

## 6. Detailed Documentation Index

- [Requirements & Framing Philosophy](docs/REQUIREMENTS.md)
- [System Architecture & Component Design](docs/ARCHITECTURE.md)
- [8-Day Development Schedule](docs/DEVELOPMENT_SCHEDULE.md)
- [Database Design & Data Dictionary](docs/DATABASE_DESIGN.md)
- [REST API Specifications](docs/API_SPECIFICATION.md)
