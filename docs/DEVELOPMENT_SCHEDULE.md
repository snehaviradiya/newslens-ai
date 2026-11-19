# NewsLens AI — 8-Day Development Schedule & Roadmap

## Overview

- **Project Start Date:** 19 November 2026
- **Final Development & Commit Deadline:** 26 November 2026
- **Final Project Freeze:** 26 November 2026 (No further commits or changes permitted)

The project follows a disciplined day-by-day development schedule. Each day is dedicated to a distinct layer of the architecture, verified through rigorous testing before progressing to subsequent phases.

---

## Daily Schedule & Milestones

### Day 1: 19 November 2026 — Repository Cleanup & Architecture Baseline
- **Focus:** Clean restart, repository inspection, architecture design, and project planning.
- **Objectives:**
  - Safely inspect repository and undo previous premature implementation attempts.
  - Establish clean project directory structure (`mobile/`, `backend/`, `ai-engine/`, `docs/`, `README.md`, `.gitignore`).
  - Author comprehensive requirements analysis, technical architecture, database design, and API specifications.
  - Commit baseline foundation to `main` branch and push to GitHub.
- **Verification:**
  - Clean working tree with no build artifacts or uncommitted cruft.
  - Git remote and origin/main verified.
  - Complete architectural documentation suite in place.

---

### Day 2: 20 November 2026 — Mobile Application Foundation & UI Scaffolding
- **Focus:** React Native / Expo setup, navigation, design tokens, and core screen scaffolding.
- **Objectives:**
  - Initialize clean Expo managed TypeScript project in `mobile/`.
  - Configure React Navigation with Stack and Bottom-Tab hierarchies.
  - Implement design system tokens (colors, typography, cards, badges).
  - Scaffold core screens:
    - Home / Event Feed Screen
    - Event Detail Screen
    - Side-by-Side Comparison Screen
    - Article Detail & Evidence Report Screen
    - User Authentication & Settings Screens
  - Verify screen transitions and responsive layouts.
- **Verification:**
  - `npm start` launches Expo dev server without compile or type errors.
  - Navigation between all screens operates smoothly.

---

### Day 3: 21 November 2026 — Backend Architecture, APIs, Auth & Database Setup
- **Focus:** Node.js Express server, PostgreSQL database integration, Prisma ORM, and JWT authentication.
- **Objectives:**
  - Initialize clean Node.js Express application in `backend/`.
  - Configure Prisma ORM with comprehensive PostgreSQL schema (`schema.prisma`).
  - Implement JWT authentication pipeline (register, login, password hashing with bcrypt, auth middleware).
  - Create REST API routing under `/api/v1` for users, articles, events, and comparisons.
  - Implement centralized error handling, CORS, and request validation.
- **Verification:**
  - Prisma schema validation passes (`npx prisma validate`).
  - Unit/integration tests for auth endpoints and health routes pass.

---

### Day 4: 22 November 2026 — News Ingestion Engine (RSS & News APIs)
- **Focus:** Multi-source news collection, text extraction, sanitization, and deduplication.
- **Objectives:**
  - Implement RSS feed parser supporting varied publication formats.
  - Configure ingestion workers for diverse news sources.
  - Implement web article text and metadata extraction (title, author, published date, content, imagery).
  - Deduplicate incoming articles by canonical URL and content hashes.
  - Store normalized article records in PostgreSQL.
- **Verification:**
  - Ingestion service successfully fetches and parses sample RSS feeds.
  - Database is populated with clean, normalized article records.

---

### Day 5: 23 November 2026 — AI/NLP Engine & Multi-Dimensional Framing Analysis
- **Focus:** Python FastAPI service, Hugging Face transformers, and analytical pipelines.
- **Objectives:**
  - Initialize clean FastAPI service in `ai-engine/` with Uvicorn.
  - Implement text preprocessing, sentence segmentation, and boilerplate filtering.
  - Integrate Named Entity Recognition (NER) pipeline (Persons, Organizations, Locations).
  - Implement topic extraction and keyword salience.
  - Implement multi-dimensional framing analysis (Conflict, Economic, Human Interest, Morality, Attribution of Responsibility).
  - Implement sentiment, emotional valence, and subjectivity analysis.
  - Ground all metrics in cited article excerpts.
- **Verification:**
  - FastAPI `/health` and `/api/v1/analyze` endpoints operational.
  - Pytest suite verifies analysis accuracy and evidence extraction schemas.

---

### Day 6: 24 November 2026 — Related-Event Detection & Cross-Source Comparison
- **Focus:** Semantic article clustering and cross-source comparative analysis.
- **Objectives:**
  - Implement sentence-transformer embeddings for semantic event clustering.
  - Group articles from multiple sources covering identical real-world events into `NewsEvent` records.
  - Implement cross-source comparison logic:
    - Headline contrast and framing divergence
    - Quoted stakeholder distribution analysis
    - Fact and topic coverage overlap matrix
  - Connect Backend orchestration with AI Engine comparison endpoints.
- **Verification:**
  - Test suite clusters related articles accurately across disparate sources.
  - Comparison payload accurately highlights narrative differences.

---

### Day 7: 25 November 2026 — End-to-End Integration, Interactive Reports & UI Polish
- **Focus:** Mobile client integration with backend APIs, real-time data flow, testing, and debugging.
- **Objectives:**
  - Connect mobile application services to live Express backend endpoints.
  - Implement dynamic state rendering for real-time article analyses and event comparisons.
  - Render interactive comparison charts, evidence citations, and quote breakdowns on mobile.
  - Perform comprehensive end-to-end integration testing and bug fixes.
  - Polish UI interactions, error states, and empty states.
- **Verification:**
  - Mobile app fetches live backend data and renders interactive framing reports seamlessly.
  - All critical user flows pass manual and automated integration checks.

---

### Day 8: 26 November 2026 — Final Testing, APK Generation, Deployment & Project Freeze
- **Focus:** Final regression testing, Android APK build, production documentation, GitHub sync, and academic submission freeze.
- **Objectives:**
  - Execute full end-to-end regression test suite across Mobile, Backend, and AI Engine.
  - Fix any remaining high-priority bugs.
  - Generate release Android APK using EAS build or local build tools.
  - Verify APK installation and functionality on Android.
  - Prepare final academic documentation, user guides, and architecture summary.
  - Create final, comprehensive Git commit on `main` branch.
  - Synchronize all work with remote GitHub repository.
  - **Execute absolute project freeze:** No modifications after 26 November 2026.
- **Verification:**
  - Android APK generated, verified, and ready for presentation.
  - Repository cleanly synchronized with origin/main.
  - Academic submission deliverables fully finalized.
