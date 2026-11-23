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
| | Rule-based NLP   | |
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
| **Mobile Client** | React Native, Expo SDK 52, TypeScript, React Navigation | Cross-platform (iOS/Android) mobile delivery with type safety, 60fps animations, and fast iteration. |
| **Backend API** | Node.js, Express.js | High-throughput asynchronous I/O and REST API orchestration. |
| **Database & ORM** | PostgreSQL, Prisma ORM | Relational integrity with JSONB support for versioned analytical evidence payloads. |
| **AI / NLP Engine** | Python 3.9+, FastAPI | Deterministic, rule-based text signals and evidence extraction; no pretrained model is currently integrated. |
| **News Collection** | RSS / Atom feeds, News APIs | Multi-source automated ingestion with rate limiting and deduplication. |
| **Authentication** | JWT (JSON Web Tokens), bcrypt | Secure, stateless authentication for user profiles and history. |
| **Version Control** | Git, GitHub | Work directly on `main`; create no more than 2–3 meaningful, verified commits per day. |

---

## 4. Repository Structure

```text
newslens-ai/
├── mobile/                     # React Native / Expo mobile application (Completed: 20 Nov)
│   ├── app/                    # Configuration and entry point
│   ├── components/             # Reusable UI system (AppButton, AppInput, Cards, etc.)
│   ├── constants/              # Theme tokens and realistic editorial mock datasets
│   ├── navigation/             # Native Stack and Bottom Tab navigators
│   ├── screens/                # Core screens (Welcome, Login, Home, Analyze, Compare, etc.)
│   ├── services/               # Centralized API service and health diagnostics
│   └── types/                  # Strict TypeScript domain models and route params
├── backend/                    # Express.js REST API and Prisma database layer (Backend foundation completed: 21 Nov)
├── ai-engine/                  # Python FastAPI NLP & framing analysis microservice (Scheduled: 23 Nov)
├── docs/                       # Architecture, requirements, database design, and schedule documentation
│   ├── REQUIREMENTS.md         # Detailed system requirements and framing methodology
│   ├── ARCHITECTURE.md         # Technical architecture and component design
│   ├── DEVELOPMENT_SCHEDULE.md # 8-day development schedule (19 Nov – 26 Nov 2026)
│   ├── DEVELOPMENT_LOG.md      # Activity log of completed daily milestones and tests
│   ├── DATABASE_DESIGN.md      # PostgreSQL relational schema and data dictionary
│   └── API_SPECIFICATION.md    # REST API contracts and endpoints
├── README.md                   # Project overview and baseline documentation
└── .gitignore                  # Repository gitignore rules
```

---

## 5. 8-Day Development Schedule & Milestones

The project strictly follows an 8-day development timeline from **19 November 2026** to **26 November 2026**, culminating in a hard project freeze on **26 November 2026**:

| Date | Phase | Key Objectives | Status |
|---|---|---|---|
| **19 Nov 2026** | **Repository Cleanup & Architecture Baseline** | Safe cleanup, baseline project structure, requirements analysis, technical architecture, and documentation. | **Completed** |
| **20 Nov 2026** | **Mobile Application Foundation** | Expo setup, TypeScript config, React Navigation, design tokens, and core screen scaffolding. | **Completed** |
| **21 Nov 2026** | **Backend Architecture & Database Setup** | Express REST server, PostgreSQL schema, Prisma ORM, and JWT authentication. | Completed |
| **22 Nov 2026** | **News Collection & Ingestion Pipeline** | RSS feed parsers, news API integrations, text extraction, and deduplication. | **Completed** |
| **23 Nov 2026** | **AI/NLP Engine & Framing Analysis** | FastAPI service, text preprocessing, NER, sentiment, framing classification, and evidence citations. | **Completed** |
| **24 Nov 2026** | **Related-Event Detection & Comparisons** | Lexical/date-based article grouping and evidence-grounded cross-source comparisons. | Implemented; sandbox-limited API verification |
| **25 Nov 2026** | **End-to-End Integration & UI Polish** | Mobile-to-backend API wiring, interactive comparison reports, testing, and bug fixes. | Planned |
| **26 Nov 2026** | **Final Testing, APK, Deployment & Freeze** | Regression testing, Android APK generation, final synchronization, academic submission, and project freeze. | Planned |

> **Final Deadline Note:** No code modifications, feature additions, documentation changes, or git commits are permitted after **26 November 2026**.

---

## 6. Mobile Application Quickstart

To run and demonstrate the mobile client locally:

```sh
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Verify TypeScript type integrity
npm run typecheck

# Launch Expo development server
npm start
```

Use the Expo Go app or an iOS Simulator / Android Emulator to open the application.

---

## 7. Detailed Documentation Index

- [Requirements & Framing Philosophy](docs/REQUIREMENTS.md)
- [System Architecture & Component Design](docs/ARCHITECTURE.md)
- [8-Day Development Schedule](docs/DEVELOPMENT_SCHEDULE.md)
- [Daily Development Activity Log](docs/DEVELOPMENT_LOG.md)
- [Database Design & Data Dictionary](docs/DATABASE_DESIGN.md)
- [REST API Specifications](docs/API_SPECIFICATION.md)
- [Mobile Client Documentation](mobile/README.md)
