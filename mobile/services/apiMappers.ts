import { ArticleAnalysis, EventComparisonResult, NewsArticle } from '../types/models';

const asArray = <T>(value: unknown): T[] => Array.isArray(value) ? value as T[] : [];

export const toNewsArticle = (article: any): NewsArticle => ({
  id: article.id,
  sourceId: article.sourceId,
  sourceName: article.sourceName || article.source?.name || 'Unknown source',
  eventId: article.eventId || undefined,
  title: article.headline || article.title || '',
  author: article.author || undefined,
  publishedAt: article.publishedAt,
  url: article.originalUrl || article.url || '',
  summary: article.summary || '',
  content: article.content || undefined,
  category: article.category || article.source?.category || 'General',
});

export const toArticleAnalysis = (row: any): ArticleAnalysis => {
  const article = row.article || {};
  const metadata = row.metadata || {};
  return {
    id: row.id || row.articleId || `transient-${Date.now()}`,
    articleId: row.articleId || article.id || '',
    articleTitle: article.headline || row.articleTitle || row.headline || '',
    sourceName: article.source?.name || row.sourceName || metadata.sourceName || 'Unknown source',
    analyzedAt: row.createdAt || row.updatedAt || new Date().toISOString(),
    headlineSentiment: Number(row.headlineSentiment ?? 0),
    headlineSensationalism: Number(row.headlineSensationalism ?? 0),
    overallTone: row.overallTone || 'NEUTRAL',
    subjectivityScore: Number(row.subjectivityScore ?? 0),
    framingScores: row.framingScores || { conflict: 0, economic: 0, humanInterest: 0, morality: 0, responsibility: 0 },
    entities: asArray(row.entities),
    quotes: asArray(row.quotes),
    supportingEvidence: asArray(row.supportingEvidence),
    topics: asArray(row.topics),
    politicalSignals: asArray(row.politicalSignals),
    limitations: row.limitations || metadata.limitations || [],
    metadata,
  };
};

export const toEventComparison = (row: any): EventComparisonResult => {
  const details = row.comparisonDetails || {};
  const articleRows = row.articles || [row.articleA, row.articleB].filter(Boolean);
  return {
    ...details,
    id: row.id,
    eventId: row.eventId || row.event?.id || '',
    eventTitle: row.eventTitle || row.event?.title || 'Event comparison',
    eventDate: row.eventDate || row.event?.eventDate || '',
    articles: details.articles || articleRows.map((article: any) => ({
      id: article.id,
      headline: article.headline,
      sourceName: article.source?.name || article.sourceName || 'Unknown source',
      publishedAt: article.publishedAt,
    })),
    headlineComparison: row.headlineComparison || details.headlineComparison,
    sharedEntities: details.sharedEntities || [],
    uniqueEntities: details.uniqueEntities || { articleA: [], articleB: [] },
    sharedTopics: details.sharedTopics || [],
    uniqueTopics: details.uniqueTopics || { articleA: [], articleB: [] },
    quoteComparison: row.quoteComparison || details.quoteComparison || { shared: [], uniqueArticleA: [], uniqueArticleB: [] },
    framingContrast: row.framingContrast || details.framingContrast || [],
    evidence: details.evidence || [],
    similarity: details.similarity || { score: Number(row.coverageOverlap || 0), method: 'stored rule-based comparison', evidence: {} },
    keyDivergencePoints: row.keyDivergencePoints || details.keyDivergencePoints || [],
    limitations: details.limitations || [],
    metadata: details.metadata || {},
  };
};
