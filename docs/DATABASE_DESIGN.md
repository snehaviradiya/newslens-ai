# NewsLens AI — Database Design & Data Modeling

## 1. Overview

The NewsLens AI database layer is built on **PostgreSQL** and accessed using **Prisma ORM**. The data model supports high-integrity relational associations for users, news sources, raw articles, event clusters, multi-dimensional NLP analyses, and cross-source comparisons.

JSONB columns are strategically utilized for multi-dimensional NLP results, entity occurrence maps, and cited evidence spans, allowing the analytical algorithms to evolve without requiring destructive schema migrations.

---

## 2. Entity-Relationship Conceptual Model

```
+---------------+       1..*       +---------------+
|  NewsSource   |------------------|  NewsArticle  |
+---------------+                  +---------------+
                                       |        |
                         0..*          |        | 1..*
    +---------------+<-----------------+        v
    |   NewsEvent   |                      +-----------------+
    |   (Cluster)   |                      | ArticleAnalysis |
    +---------------+                      +-----------------+
            ^                                       |
            | 0..1                                  |
    +-------------------+                           |
    | ArticleComparison |<--------------------------+ (references A & B)
    +-------------------+
            |
            | 0..*
            v
    +---------------+
    |     User      |
    +---------------+
            |
            | 1..*
            v
    +---------------+
    | AnalysisHistory|
    +---------------+
```

---

## 3. Data Dictionary & Table Definitions

### 3.1 `User` Table
Manages application users, credentials, and preferences.
- `id` (String, UUID/CUID, Primary Key): Unique identifier.
- `email` (String, Unique, Indexed): User email address.
- `passwordHash` (String): Hashed password using bcrypt.
- `displayName` (String, Optional): User's profile display name.
- `role` (String, Default 'USER'): Role for authorization ('USER', 'ADMIN').
- `createdAt` (DateTime): Creation timestamp in UTC.
- `updatedAt` (DateTime): Last update timestamp in UTC.

### 3.2 `NewsSource` Table
Represents publication outlets (e.g., BBC, Reuters, AP, CNN, Fox News).
- `id` (String, UUID/CUID, Primary Key): Unique identifier.
- `name` (String): Name of the publication.
- `canonicalUrl` (String, Unique): Homepage or base URL.
- `feedUrl` (String, Optional): RSS or Atom feed endpoint.
- `country` (String, Optional): Country of origin.
- `language` (String, Default 'en'): Primary language.
- `isActive` (Boolean, Default true): Ingestion active status.
- `createdAt` (DateTime): Creation timestamp in UTC.

### 3.3 `NewsEvent` Table (Event Cluster)
Represents a real-world event synthesized from multiple reporting articles.
- `id` (String, UUID/CUID, Primary Key): Unique identifier.
- `title` (String): Algorithmic descriptive event title.
- `summary` (String, Optional): Synthesized event summary.
- `topicCategory` (String): Broad category (e.g., Politics, Economy, Tech).
- `firstReportedAt` (DateTime): Earliest publication timestamp in cluster.
- `lastReportedAt` (DateTime): Latest publication timestamp in cluster.
- `articleCount` (Int, Default 1): Number of linked articles.
- `sourceCount` (Int, Default 1): Distinct news sources in cluster.
- `createdAt` (DateTime): Creation timestamp in UTC.

### 3.4 `NewsArticle` Table
Stores raw and normalized news articles ingested from sources.
- `id` (String, UUID/CUID, Primary Key): Unique identifier.
- `sourceId` (String, Foreign Key -> `NewsSource.id`): Publishing source.
- `eventId` (String, Optional, Foreign Key -> `NewsEvent.id`): Associated event cluster.
- `url` (String, Unique, Indexed): Canonical article web URL.
- `title` (String): Article headline.
- `author` (String, Optional): Author byline.
- `content` (Text): Full extracted article text.
- `summary` (Text, Optional): Extracted abstract or brief.
- `imageUrl` (String, Optional): Lead article image URL.
- `language` (String, Default 'en'): Language code.
- `publishedAt` (DateTime): Publication timestamp reported by source.
- `ingestedAt` (DateTime): System ingestion timestamp.

### 3.5 `ArticleAnalysis` Table
Stores versioned NLP and framing evaluation metrics for an individual article.
- `id` (String, UUID/CUID, Primary Key): Unique identifier.
- `articleId` (String, Foreign Key -> `NewsArticle.id`, Indexed): Target article.
- `modelVersion` (String): Identifier of NLP model suite (e.g., 'v1.0.0').
- `status` (String, Default 'COMPLETED'): Status ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED').
- `headlineSentiment` (Float): Headline sentiment score (-1.0 to +1.0).
- `headlineSensationalism` (Float): Clickbait/sensationalism score (0.0 to 1.0).
- `overallTone` (String): Primary tone ('NEUTRAL', 'CRITICAL', 'ADVOCATING', etc.).
- `subjectivityScore` (Float): Subjectivity rating (0.0 = Objective, 1.0 = Subjective).
- `framingScores` (JSONB): Scores for framing dimensions:
  - `conflict` (0.0 to 1.0)
  - `economic` (0.0 to 1.0)
  - `humanInterest` (0.0 to 1.0)
  - `morality` (0.0 to 1.0)
  - `attributionOfResponsibility` (0.0 to 1.0)
- `entities` (JSONB): Extracted entities with mention counts, sentiment context, and roles.
- `quotes` (JSONB): Array of extracted quotes, quoted speakers, and affiliated stances.
- `topics` (JSONB): Extracted topics and weighted keywords.
- `politicalSignals` (JSONB): Detected policy rhetoric and ideological framing cues.
- `supportingEvidence` (JSONB): Textual excerpts and paragraph spans supporting the analysis.
- `createdAt` (DateTime): Analysis execution timestamp.

### 3.6 `ArticleComparison` Table
Stores comparative evaluations between two or more articles covering the same event.
- `id` (String, UUID/CUID, Primary Key): Unique identifier.
- `eventId` (String, Optional, Foreign Key -> `NewsEvent.id`): Shared event.
- `articleAId` (String, Foreign Key -> `NewsArticle.id`): First article.
- `articleBId` (String, Foreign Key -> `NewsArticle.id`): Second article.
- `userId` (String, Optional, Foreign Key -> `User.id`): Initiating user.
- `headlineComparison` (JSONB): Comparative headline analysis.
- `framingContrast` (JSONB): Framing divergences between A and B.
- `quoteComparison` (JSONB): Overlap and unique quoted voices.
- `coverageOverlap` (Float): Percentage of factual overlap (0.0 to 1.0).
- `synthesisSummary` (Text, Optional): Synthesized comparative narrative.
- `createdAt` (DateTime): Comparison creation timestamp.

### 3.7 `AnalysisHistory` Table
Tracks user reading and comparison history for personalization and saved reports.
- `id` (String, UUID/CUID, Primary Key): Unique identifier.
- `userId` (String, Foreign Key -> `User.id`): User.
- `articleId` (String, Optional, Foreign Key -> `NewsArticle.id`): Viewed article.
- `comparisonId` (String, Optional, Foreign Key -> `ArticleComparison.id`): Viewed comparison.
- `isBookmarked` (Boolean, Default false): Saved status.
- `viewedAt` (DateTime): Timestamp of interaction.

---

## 4. Indexing & Optimization Strategy

1. **Articles by Published Date & Source:** Compound index on `(sourceId, publishedAt DESC)` for rapid feed queries.
2. **Event Membership:** Index on `eventId` in `NewsArticle` for fast retrieval of all articles reporting on an event.
3. **Analysis by Article:** Unique index on `(articleId, modelVersion)` ensuring deterministic single active analysis per model version.
4. **Comparison Pairing:** Compound unique index on `(articleAId, articleBId)` to avoid duplicate comparison computations.
