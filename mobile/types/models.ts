// Core Data Models for NewsLens AI Mobile Client

export interface NewsSource {
  id: string;
  name: string;
  canonicalUrl: string;
  country: string;
  category: string;
  articleCount?: number;
  rssFeedUrl?: string | null;
}

export interface NewsEvent {
  id: string;
  title: string;
  summary: string;
  topicCategory: string;
  sourceCount: number;
  articleCount: number;
  updatedAt: string;
  sources: string[]; // e.g. ['BBC', 'Reuters', 'CNN']
}

export interface ComparisonEvidence {
  articleId: string;
  sourceName: string;
  kind: string;
  excerpt: string;
  frame?: string;
  topic?: string;
  speaker?: string;
}

export interface EventComparisonResult {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  articles: Array<{ id: string; headline: string; sourceName: string; publishedAt: string }>;
  headlineComparison: {
    articleA: { headline: string; sourceName: string; sentiment: number; sensationalism: number; evidence: string };
    articleB: { headline: string; sourceName: string; sentiment: number; sensationalism: number; evidence: string };
  };
  sharedEntities: Array<{ name: string; typeA: string; typeB: string; mentionCountA: number; mentionCountB: number }>;
  uniqueEntities: { articleA: string[]; articleB: string[] };
  sharedTopics: string[];
  uniqueTopics: { articleA: string[]; articleB: string[] };
  quoteComparison: { shared: QuoteEvidence[]; uniqueArticleA: QuoteEvidence[]; uniqueArticleB: QuoteEvidence[] };
  framingContrast: Array<{ frame: string; articleA: number; articleB: number; difference: number; evidenceA: string[]; evidenceB: string[] }>;
  evidence: ComparisonEvidence[];
  similarity: { score: number; method: string; evidence: Record<string, unknown> };
  keyDivergencePoints: string[];
  limitations: string[];
  metadata: Record<string, unknown>;
}

export interface NewsArticle {
  id: string;
  sourceId: string;
  sourceName: string;
  eventId?: string;
  title: string;
  author?: string;
  publishedAt: string;
  url: string;
  summary: string;
  content?: string;
  category: string;
}

export interface FramingBreakdown {
  conflict: number;           // 0.0 - 1.0
  economic: number;           // 0.0 - 1.0
  humanInterest: number;      // 0.0 - 1.0
  morality: number;           // 0.0 - 1.0
  responsibility: number;     // 0.0 - 1.0
}

export interface EntityEvidence {
  name: string;
  type: string;
  mentionCount: number;
  stance: string;
  evidence?: string;
}

export interface QuoteEvidence {
  speaker: string;
  quote: string;
  affiliation?: string;
}

export interface TextEvidenceExcerpt {
  frame: string;
  excerpt: string;
  location?: string;
}

export interface ArticleAnalysis {
  id: string;
  articleId: string;
  articleTitle: string;
  sourceName: string;
  analyzedAt: string;
  headlineSentiment: number;    // -1.0 to 1.0
  headlineSensationalism: number; // 0.0 to 1.0
  overallTone: string;
  subjectivityScore: number;     // 0.0 (Objective) - 1.0 (Subjective)
  framingScores: FramingBreakdown;
  entities: EntityEvidence[];
  quotes: QuoteEvidence[];
  supportingEvidence: TextEvidenceExcerpt[];
  topics?: Array<{ topic: string; score: number; supportingText?: string }>;
  politicalSignals?: Array<{ signalType: string; observation: string; supportingExcerpt: string }>;
  limitations?: string[];
  metadata?: Record<string, unknown>;
  isDemo?: boolean;
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

export interface HistoryRecord {
  id: string;
  createdAt: string;
  article?: NewsArticle & { analysis?: ArticleAnalysis };
  comparison?: EventComparisonResult;
}

export interface ArticleComparison {
  id: string;
  eventId?: string;
  eventTitle: string;
  articleA: NewsArticle;
  articleB: NewsArticle;
  analysisA?: ArticleAnalysis;
  analysisB?: ArticleAnalysis;
  coverageOverlapScore: number; // e.g. 0.65 (65%)
  keyDivergencePoints: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  savedAnalysesCount: number;
  comparedArticlesCount: number;
}
