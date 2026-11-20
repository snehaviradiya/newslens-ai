// Core Data Models for NewsLens AI Mobile Client

export interface NewsSource {
  id: string;
  name: string;
  canonicalUrl: string;
  country: string;
  category: string;
  articleCount?: number;
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
  type: 'PERSON' | 'ORG' | 'GPE' | 'EVENT';
  mentionCount: number;
  stance: 'Supportive' | 'Critical' | 'Neutral';
}

export interface QuoteEvidence {
  speaker: string;
  quote: string;
  affiliation?: string;
}

export interface TextEvidenceExcerpt {
  frame: string;
  excerpt: string;
}

export interface ArticleAnalysis {
  id: string;
  articleId: string;
  articleTitle: string;
  sourceName: string;
  analyzedAt: string;
  headlineSentiment: number;    // -1.0 to 1.0
  headlineSensationalism: number; // 0.0 to 1.0
  overallTone: 'Neutral' | 'Critical' | 'Advocating' | 'Alarmist' | 'Balanced';
  subjectivityScore: number;     // 0.0 (Objective) - 1.0 (Subjective)
  framingScores: FramingBreakdown;
  entities: EntityEvidence[];
  quotes: QuoteEvidence[];
  supportingEvidence: TextEvidenceExcerpt[];
  isDemo?: boolean;
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
