# NewsLens AI — Requirements Analysis & Specification

## 1. Problem Statement

Modern news consumption is characterized by rapid dissemination across highly divergent media outlets. Even when reporting on identical events, news organizations frequently present contrasting narratives through headline formulation, selective topic prioritization, asymmetric quote selection, distinct emotional tones, and framing variations.

Conventional "media bias" tools frequently oversimplify this problem by assigning static, monolithic political bias ratings (e.g., "Far Left" or "Right Wing") to entire news institutions. Such blanket characterizations:
- Obscure editorial diversity and variations across journalists, opinion versus reporting desks, and specific topics.
- Lack empirical traceability, failing to explain *why* or *how* a specific article conveys bias.
- Alienate critical readers seeking objective, verifiable insights into news composition.

**NewsLens AI** addresses this challenge by providing an **AI-based news bias and framing analysis system**. The system analyzes news coverage at the **individual article level**, presenting transparent, evidence-grounded comparisons of how different outlets report on shared events without reducing journalistic work to simplistic stereotypes.

---

## 2. Core Project Objectives

1. **Multi-Source News Aggregation:** Automatically collect news coverage of breaking and current events from diverse global and national sources via RSS feeds and news APIs.
2. **Related-Event Identification:** Semantically cluster articles from disparate publications that cover the same underlying real-world event.
3. **Multi-Dimensional Framing Analysis:** Evaluate individual articles across multiple linguistic and communicative axes:
   - **Headline Framing:** Analyze semantic slant, clickbait tendencies, and tonal differences.
   - **Information & Factual Coverage:** Detect which facts, figures, and background contexts are emphasized or omitted.
   - **Topic & Entity Extraction:** Identify key actors, organizations, locations, and central subjects.
   - **Quote Attribution & Sourcing:** Extract direct and indirect quotations, identifying which voices are highlighted, marginalized, or omitted.
   - **Tone & Affective Language:** Measure subjectivity, emotional polarity, and linguistic intensity.
   - **Political & Ideological Signals:** Detect policy framing, party-associated rhetoric, and ideologically resonant framing cues without monolithic branding.
4. **Cross-Source Comparative Reporting:** Contrast paired or clustered articles side-by-side with clear highlighting of divergence points.
5. **Interactive Evidence-Based Delivery:** Present findings through a responsive mobile application featuring interactive visual comparisons, cited excerpts, and granular metric breakdowns.

---

## 3. Guiding Analytical Philosophy: Evidence-First Framing

> **Fundamental Constraint:** The system must never assign a simplistic fixed political bias score to an entire news organization. All evaluations are computed dynamically on an article-by-article basis and must be anchored to cited textual evidence.

- **No Blanket Outlet Ratings:** A news organization cannot be labeled "biased" in perpetuity; an article is evaluated on its specific text, facts, framing, and sources.
- **Traceable Textual Grounding:** Every score, sentiment indicator, or framing badge must link directly to the specific sentences or paragraphs that triggered the assessment.
- **Uncertainty & Nuance Transparency:** Linguistic analysis inherently carries nuance. Metrics must communicate degrees of confidence rather than claiming absolute moral or political certainty.

---

## 4. Functional Requirements

### 4.1 Module 1: News Collection & Ingestion
- **FR-1.1:** Periodically poll configured RSS feeds from diverse news outlets (e.g., international, national, public broadcasters, independent outlets).
- **FR-1.2:** Ingest articles via news APIs where available, with rate-limiting and duplicate prevention.
- **FR-1.3:** Extract and sanitize clean article text, headline, author, publication timestamp, canonical URL, and top-level imagery.
- **FR-1.4:** Normalize metadata and store raw ingested content with UTC timestamps.

### 4.2 Module 2: Event Clustering & Article Matching
- **FR-2.1:** Compute semantic vector embeddings for article titles, abstracts, and bodies using sentence-transformer models.
- **FR-2.2:** Cluster articles within defined temporal windows (e.g., 24–72 hours) to detect shared real-world events.
- **FR-2.3:** Require that an event cluster contain articles from at least two distinct news sources to qualify for cross-source comparison.
- **FR-2.4:** Dynamically generate descriptive event titles and topic tags based on member articles.

### 4.3 Module 3: Natural Language Processing & Framing Engine
- **FR-3.1 (Headline Analysis):** Measure headline sentiment, sensationalism score, and semantic alignment with article body text.
- **FR-3.2 (Entity Extraction):** Extract Named Entities (Person, Organization, GPE, Event) and analyze entity mention frequency and sentiment context.
- **FR-3.3 (Topic Extraction):** Identify primary and secondary topics, categorizing subjects (e.g., Economy, Governance, Environment, Foreign Affairs).
- **FR-3.4 (Quote & Source Extraction):** Parse direct and attributed quotations, identifying speakers, their institutional affiliations, and the sentiment of attributed clauses.
- **FR-3.5 (Tone & Sentiment):** Evaluate document-level and paragraph-level sentiment (Positive, Neutral, Negative) and subjectivity scores (Objective vs. Subjective).
- **FR-3.6 (Framing Dimensions):** Classify news framing according to established communication science dimensions:
  - *Conflict Frame:* Emphasis on disagreement, confrontation, or political battle.
  - *Economic Frame:* Emphasis on financial consequences, costs, and economic impacts.
  - *Human Interest Frame:* Emphasis on emotional cases, personal stories, and human impact.
  - *Morality / Ethics Frame:* Framing in terms of moral duties, ethics, or religious principles.
  - *Attribution of Responsibility Frame:* Assigning blame or credit to specific governments, parties, or individuals.
- **FR-3.7 (Political & Policy Signals):** Identify framing language associated with distinct political agendas, policy priorities, or partisan debates, providing supporting quotes.

### 4.4 Module 4: Cross-Source Comparison Engine
- **FR-4.1:** Perform pairwise and groupwise comparisons across articles covering the same event cluster.
- **FR-4.2:** Compute a Coverage Overlap Index (shared facts/topics vs. exclusive perspectives).
- **FR-4.3:** Contrast headline choices (e.g., active vs. passive voice, blame attribution).
- **FR-4.4:** Contrast quote distribution (e.g., Source A quoted 3 opposition figures, while Source B quoted exclusively government spokespersons).
- **FR-4.5:** Generate a synthesized comparative narrative summary with traceable citation links.

### 4.5 Module 5: Mobile User Experience
- **FR-5.1:** Home Dashboard presenting trending events with multi-source perspective badges.
- **FR-5.2:** Event Detail View showing all reporting outlets, timeline of reporting, and coverage overview.
- **FR-5.3:** Comparison Studio allowing side-by-side comparison of any two articles with synchronized scrolling and diff highlights.
- **FR-5.4:** Article Deep-Dive providing interactive cards for Entities, Quotes, Framing Breakdown, and Supporting Textual Evidence.
- **FR-5.5:** User Authentication (Registration, Login, JWT management) and personalized reading history / saved comparisons.

---

## 5. Non-Functional Requirements

- **Performance & Latency:** Mobile UI must maintain responsive 60 fps interactions; cached API responses should return within <200ms; AI inference tasks must execute asynchronously without blocking API threads.
- **Scalability & Modularity:** Clean micro-service separation between the Express backend (business logic, persistence) and the FastAPI AI engine (compute-heavy inference).
- **Data Integrity & Security:** Passwords hashed with bcrypt; secure JWT transmission in Authorization headers; input validation across all endpoints; strict `.env` segregation.
- **Reliability:** Graceful handling of network drops on mobile with offline-safe fallbacks; resilient RSS parser fault tolerance when source layouts change.
- **Reproducibility & Testability:** Unit tests for backend endpoints and AI preprocessing pipelines; comprehensive mocks for news ingestion.
