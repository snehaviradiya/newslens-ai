# NewsLens AI — Development Activity Log

This log documents the day-by-day development progress, technical verification, and engineering milestones for NewsLens AI between **19 November 2026** and **26 November 2026**.

---

## Day 1: 19 November 2026 — Repository Cleanup & Architecture Baseline

### Completed Work
- **Repository Audit:** Audited existing Git tree, verified remote configuration, and identified untracked premature implementation files.
- **Clean Baseline Established:** Safely removed premature, uncommitted code across `backend/`, `mobile/`, and `ai-engine/` along with heavy dependency caches (`node_modules/`, `.venv/`).
- **Core Architecture & Planning Suite:** Authored foundational project documentation:
  - `docs/REQUIREMENTS.md`: Detailed functional specifications (FR-1.1 to FR-5.5) and established the core principle: no blanket outlet bias scoring; all framing analysis is conducted at the individual article level with cited textual evidence.
  - `docs/ARCHITECTURE.md`: Multi-tier technical architecture diagram and service boundary definitions.
  - `docs/DEVELOPMENT_SCHEDULE.md`: Rigorous 8-day milestone plan with a hard freeze on 26 November 2026.
  - `docs/DATABASE_DESIGN.md`: PostgreSQL schema design, entity relations, and JSONB evidence structure.
  - `docs/API_SPECIFICATION.md`: REST API contracts for Backend and AI Engine services.
- **Git Synchronization:** Committed clean baseline to `main` (`18d9187`) and pushed to `origin/main`.

### Verification Status
- Clean working directory with zero untracked artifacts.
- Remote synchronization verified on GitHub.

---

## Day 2: 20 November 2026 — Mobile Application Foundation

### Objectives & Scope
Construct a fully functional, professional React Native / Expo mobile application foundation inside `mobile/` with TypeScript, React Navigation, design tokens, reusable components, and complete screen scaffolding.

### Completed Work
1. **Application Foundation & Configuration:**
   - Initialized managed Expo SDK 52 application in `mobile/` with TypeScript and Metro bundler.
   - Configured `app.json` (App Name: *NewsLens AI*, Slug: *newslens-ai*, bundle ID: *com.newslens.ai*).
   - Configured `tsconfig.json` with path aliases (`@/*`).
   - Configured `babel.config.js` with `babel-preset-expo`.
   - Created `mobile/.env.example` documenting `EXPO_PUBLIC_API_BASE_URL` for iOS simulators, Android emulators, and LAN physical devices.
2. **Design System & Tokens (`mobile/constants/theme.ts`):**
   - Established editorial color palette: Deep Academic Navy (`#1E3A8A`), Primary Light (`#3B82F6`), Slate backgrounds (`#F8FAFC`, `#0F172A`), and semantic framing badges (Conflict, Economic, Human Interest, Morality, Attribution).
   - Defined consistent typography scale, spacing tokens (`xs` to `xxxl`), border radii, and soft card shadows.
3. **Data Models & Types (`mobile/types/`):**
   - Created TypeScript interfaces for `NewsSource`, `NewsEvent`, `NewsArticle`, `ArticleAnalysis`, `FramingBreakdown`, `ArticleComparison`, `UserProfile`, and React Navigation route param lists (`RootStackParamList`, `MainTabParamList`).
4. **Centralized API Service (`mobile/services/api.ts`):**
   - Configured `ApiClient` with environment variable resolution (`process.env.EXPO_PUBLIC_API_BASE_URL`).
   - Implemented `checkBackendHealth()` with timeout and fallback logic.
   - Built endpoints for news events, monitored sources, article analysis, and cross-source comparisons that seamlessly fall back to realistic mock editorial data while backend is developed.
5. **Reusable UI Components (`mobile/components/`):**
   - `AppButton`: Accessible button with variants (`primary`, `secondary`, `outline`, `ghost`, `danger`), loading spinners, and sizing.
   - `AppInput`: Form input with focus states, floating labels, validation error alerts, and password toggle.
   - `ScreenHeader`: Editorial header with back button support and right action slots.
   - `ArticleCard`: Multi-source article card with source badge, publication date, summary, and framing inspect link.
   - `NewsSourceCard`: Publication card displaying monitoring status and article counts.
   - `AnalysisCard`: Detailed framing spectrum bars, subjectivity ratings, headline sentiment metrics, cited verbatim paragraph excerpts, and quoted stakeholder attributions.
   - `EmptyState`: Clean empty state illustration with title, message, and call-to-action button.
   - `LoadingIndicator`: Centered loading spinner with informative editorial status messages.
6. **Screens Implemented (`mobile/screens/`):**
   - `WelcomeScreen`: Editorial landing screen with NewsLens AI branding, feature highlights, and navigation into main flow or auth.
   - `LoginScreen`: Email and password authentication form with client-side validation and dev-mode handoff.
   - `RegisterScreen`: Full name, email, password, and confirm-password validation form.
   - `HomeScreen`: Real-time dashboard featuring backend connectivity badge, fast framing inspection entry banner, clustered shared events, monitored newsroom carousel, and recent analyses.
   - `AnalysisScreen`: URL and multiline text input for on-demand article analysis with framing spectrum visualization.
   - `ComparisonScreen`: Side-by-side comparative analysis between competing outlets (e.g. Reuters vs The Guardian), contrasting headlines, framing dimension differences, quoted stakeholders, and key narrative divergence points.
   - `HistoryScreen`: Chronological log of past article inspections with metric summaries and empty-state toggles.
   - `ProfileScreen`: Researcher profile details, saved statistics, backend connection status checker, and sign-out action.
   - `EventDetailScreen`: Clustered articles from different news sources covering the same event with a one-tap transition to comparison mode.
   - `ArticleDetailScreen`: Full view of article text paired with granular framing evidence.
7. **Navigation (`mobile/navigation/`):**
   - `BottomTabNavigator`: 5-tab persistent bottom navigation (`Home`, `Analyze`, `Compare`, `History`, `Profile`) with `@expo/vector-icons` Ionicons.
   - `RootNavigator`: Native stack navigator orchestrating the Welcome onboarding, Login/Register auth flows, Main tabs, and detailed modal/drill-down screens.

### Testing & Verification
- **Dependency Audit:** Audited all 897 packages with `npx expo-doctor`. All 18 checks passed cleanly with zero warnings (`18/18 checks passed`).
- **TypeScript Compilation:** Ran `npx tsc --noEmit` across all mobile source files. Zero type or syntax errors reported (`Exit code: 0`).
- **Multi-Platform Bundler Export:** Executed `npx expo export` to test full Metro bundle compilation across all targets:
  - Web bundle: `AppEntry.js` (1.27 MB)
  - iOS bundle: Hermes bytecode `AppEntry.hbc` (2.50 MB)
  - Android bundle: Hermes bytecode `AppEntry.hbc` (2.51 MB)
  - Result: 100% compilation success with zero missing module errors.

### Remaining Integrations (Scheduled)
- Day 3 (21 Nov): Connect authentication and user profile routes to Express/Prisma backend.
- Day 4 (22 Nov): Ingest live multi-source RSS feeds into database to replace mock event lists.
- Day 5 (23 Nov): Connect analysis screen to Python FastAPI AI engine for live Hugging Face transformer inference.
- Day 6 (24 Nov): Wire automated cross-source event clustering and divergence matching.

---

## Day 3: 21 November 2026 — Backend Architecture, APIs, Auth & Database Setup

### Completed Work
- Restored and completed the Express/TypeScript backend foundation.
- Added Prisma PostgreSQL models for users, sources, articles, events, analyses, comparisons, and history.
- Generated an initial migration SQL script under `backend/prisma/migrations/`.
- Implemented secure JWT registration/login/profile routes with bcrypt password hashing and Zod validation.
- Removed in-memory authentication and fabricated source/article/event fallbacks.
- Implemented database-backed paginated source, article, and event routes.
- Added read-only analysis and comparison routes plus authenticated, user-owned history routing.
- Changed live article analysis submission to an honest `501 NOT_IMPLEMENTED` response until the AI engine exists.
- Added centralized validation, application, JSON, 404, and authentication error handling.
- Added mocked integration tests for auth, news, analyses, comparisons, history, health, and 404 behavior.

### Verification
- `npm test -- --runInBand`: 4 suites passed, 24 tests passed.
- `npm run build`: passed.
- `npm run prisma:validate`: passed.
- Mobile `npm run typecheck`: passed.
- `git diff --check`: passed.

### Database Status
- Prisma schema and migration SQL are prepared.
- A valid PostgreSQL instance was not available in the local environment, so migrations and database integration were not executed against a live server.
- API routes return `503` for database operations when PostgreSQL is unavailable; they do not fabricate data.

---

## Day 4: 22 November 2026 — RSS News Collection & Ingestion Pipeline

### Objectives & Scope
Build a robust, idempotent news collection pipeline that ingests articles from multiple legitimate public RSS/Atom feeds, normalizes metadata and URLs, detects and prevents duplicate articles, persists data to PostgreSQL via Prisma, provides collection APIs and background scheduling, supports rich article filtering, and connects to the mobile client.

### Completed Work
1. **Verified Public RSS Sources Configuration (`backend/src/config/sources.ts`):**
   - Configured verified seed news sources with active public feeds:
     - **BBC News:** `http://feeds.bbci.co.uk/news/rss.xml` (General / UK)
     - **The Guardian:** `https://www.theguardian.com/world/rss` (Analysis / UK)
     - **The New York Times:** `https://rss.nytimes.com/services/xml/rss/nyt/World.xml` (General / USA)
     - **NPR News:** `https://feeds.npr.org/1001/rss.xml` (Public Radio / USA)
2. **URL & Text Sanitizer Utilities (`backend/src/utils/sanitizer.ts`):**
   - URL canonicalization: enforces HTTPS protocol, trims paths, removes trailing slashes, and strips tracking parameters (`utm_*`, `fbclid`, `gclid`, `_ga`, `ref`, `source`, `ocid`).
   - Text cleaning: strips embedded HTML/scripts, decodes entities (`&quot;`, `&amp;`, etc.), collapses whitespace.
   - Published date normalization: parses RFC/ISO timestamps, enforces safe fallbacks, and rejects future-dated anomalies.
3. **RSS Parser Service (`backend/src/services/rssParserService.ts`):**
   - Built on `rss-parser` with custom headers (`User-Agent`, XML content negotiation) and an 8-second request timeout.
   - Extracts title, normalized URL, author, summary, content, publication date, and category tags.
   - Added `validateFeedUrl` method for checking feed accessibility and item counts before saving sources.
4. **Idempotent Ingestion Pipeline (`backend/src/services/newsIngestionService.ts`):**
   - `seedDefaultSources`: Automatically seeds/upserts default sources into the database.
   - `saveArticleIfNew`: Idempotent persistence checking existing `originalUrl` before database insertion; returns `'DUPLICATE'` or `'INSERTED'`.
   - `runCollection`: Orchestrates ingestion across all active sources with concurrency lock preventing overlapping jobs; compiles structured execution summaries (duration, counts, error logs).
5. **Collection APIs & Management (`backend/src/controllers/`, `backend/src/routes/`):**
   - `GET /api/v1/collection/status`: Public status check returning running state and previous run summary.
   - `POST /api/v1/collection/run`: Protected endpoint (Researcher/Admin) to trigger manual ingestion.
   - `POST /api/v1/sources/validate-feed`: Public feed tester validating live feeds before source registration.
   - Enhanced `GET /api/v1/sources` with live article counts (`_count`).
   - Enhanced `POST /api/v1/sources` & `PATCH /api/v1/sources/:id` for protected source configuration.
   - Enhanced `GET /api/v1/articles` with keyword search (`search`), date range filtering (`startDate`, `endDate`), and sorting (`sortBy`, `sortOrder`).
6. **Automated Scheduler (`backend/src/services/newsSchedulerService.ts`):**
   - Configurable background timer (`ENABLE_COLLECTION_SCHEDULER`, `COLLECTION_INTERVAL_MINUTES`) with graceful shutdown on `SIGINT`/`SIGTERM`.
7. **Mobile Client Integration (`mobile/services/api.ts`, `mobile/screens/HomeScreen.tsx`):**
   - Added `getArticles` method to mobile `ApiClient`.
   - Connected `HomeScreen` to live `getArticles` API endpoint with source attribution and publication dates, while preserving standalone demo fallback when backend is offline.

### Verification & Testing
- **Backend Tests:** Added comprehensive suite `tests/collection.test.ts`. Full backend suite passes:
  - `npm test -- --runInBand`: 5 suites passed, 43 tests passed.
  - Covers URL normalization, HTML sanitization, feed parsing, duplicate detection, collection authorization, feed validation, and article date filtering.
- **TypeScript & Schema:**
  - `backend/npm run typecheck`: Passed cleanly with zero errors.
  - `backend/npx prisma validate`: Passed (schema valid).
  - `mobile/npm run typecheck`: Passed cleanly with zero errors.
- **Feed Verification:** Verified real public feeds against live servers (BBC, Guardian, NYT, NPR).
- **Git Commit Cadence:** Followed the strict Day 4 policy of maximum 2–3 meaningful commits directly on `main`.
