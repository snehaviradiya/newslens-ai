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
  - Prisma schema validation passes (`npx prisma validate`) — completed.
  - Unit/integration tests for auth, news, analysis, and health routes pass — completed with mocked database operations.
  - Initial migration SQL generated; live PostgreSQL migration remains environment-dependent.

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
- **Focus:** Python 3.9-compatible FastAPI service and deterministic, evidence-grounded rule-based analysis. No pretrained model is integrated.
- **Objectives:**
  - Initialize clean FastAPI service in `ai-engine/` with Uvicorn.
  - Implement text preprocessing, sentence segmentation, and boilerplate filtering.
  - Implement heuristic entity candidate extraction (not pretrained NER).
  - Implement topic extraction and keyword salience.
  - Implement multi-dimensional framing analysis (Conflict, Economic, Human Interest, Morality, Attribution of Responsibility).
  - Implement sentiment, emotional valence, and subjectivity analysis.
  - Ground all metrics in cited article excerpts.
- **Verification:**
  - FastAPI `/health` and `/api/v1/analyze` endpoints operational.
  - Pytest suite verifies analysis accuracy and evidence extraction schemas.

---

### Day 6: 24 November 2026 — Related-Event Detection & Cross-Source Comparison
- **Focus:** Deterministic lexical/date event grouping and evidence-grounded cross-source comparison.
- **Objectives:**
  - Combine headline/content token similarity, entity/topic overlap, and date proximity with a configurable threshold.
  - Group articles from multiple sources covering identical real-world events into `NewsEvent` records.
  - Implement cross-source comparison logic:
    - Headline contrast and framing divergence
    - Quoted stakeholder distribution analysis
    - Fact and topic coverage overlap matrix
  - Persist comparison payloads through Prisma and connect the mobile event/comparison screens.
- **Verification:**
  - Deterministic tests cover matching, separation, date windows, grouping, and source-grounded comparisons.
  - No semantic understanding or editorial intent is claimed.

---

### Day 7: 25 November 2026 — End-to-End Integration, Interactive Reports & UI Polish
- **Focus:** Complete authenticated article analysis/history, live event/comparison mobile flows, API contract validation, and final-day deployment preparation.
- **Objectives:**
  - Connect mobile application services to live Express backend endpoints.
  - Implement dynamic state rendering for real-time article analyses and event comparisons.
  - Render interactive comparison charts, evidence citations, and quote breakdowns on mobile.
  - Perform comprehensive end-to-end integration testing and bug fixes.
  - Polish UI interactions, error states, and empty states.
- **Verification:**
  - Backend and mobile typechecks, AI/backend tests, Prisma generation/validation, and Expo Android bundle export.
  - Full live PostgreSQL/physical-device/APK flow remains for final-day verification if those services are available.

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

---

## 3. Git Workflow & Incremental Commit Policy

To ensure high-resolution academic traceability, development must never be batched into a single monolithic end-of-day commit. Development follows a continuous incremental commit model:

1. **Commit Frequency:** No more than 2–3 meaningful commits per day, only for independently completed milestones.
2. **Immediate Checkpoint Rule:** Whenever an independent component, service, screen, data model, test suite, or documentation block is implemented and verified, commit it immediately.
3. **Branch Model:** All work is committed directly to the `main` branch. No PRs or unnecessary branches.
4. **Regular Remote Synchronization:** Push verified commits to `origin/main` continuously throughout each development day.
5. **Pre-Commit Verification:** Run relevant validations (typecheck, lint, unit tests, bundle checks) and inspect `git status` and `git diff` before creating each commit.
6. **No Artificial Commits:** Every commit must reflect genuine, functioning, verified work. Never backdate timestamps, fabricate activity, or commit broken code.
7. **Conventional Commit Standard:** Use structured conventional commit messages:
   - `feat(...)`: Functional feature or screen additions.
   - `fix(...)`: Bug fixes and error resolutions.
   - `test(...)`: Test additions and verification suites.
   - `docs(...)`: Documentation updates and architecture specifications.
   - `refactor(...)`: Code cleanup and structural improvements without behavioral change.
   - `chore(...)`: Dependency updates, tooling, and build configuration.
