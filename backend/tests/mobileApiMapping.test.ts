import { toArticleAnalysis, toEventComparison, toNewsArticle } from '../../mobile/services/apiMappers';

describe('mobile API response mappings', () => {
  it('maps persisted article rows without losing nullable fields or source labels', () => {
    expect(toNewsArticle({
      id: 'article-1', sourceId: 'source-1', headline: 'Headline', originalUrl: 'https://example.test/a',
      publishedAt: '2026-11-25T10:00:00.000Z', summary: null, content: null,
      source: { name: 'Example News', category: 'World' }, eventId: null,
    })).toEqual({
      id: 'article-1', sourceId: 'source-1', sourceName: 'Example News', eventId: undefined,
      title: 'Headline', author: undefined, publishedAt: '2026-11-25T10:00:00.000Z',
      url: 'https://example.test/a', summary: '', content: undefined, category: 'World',
    });
  });

  it('maps analysis fields and persisted limitations from metadata', () => {
    const mapped = toArticleAnalysis({
      id: 'analysis-1', articleId: 'article-1', createdAt: '2026-11-25T10:00:00.000Z',
      headlineSentiment: -0.25, headlineSensationalism: 0.1, overallTone: 'NEGATIVE',
      subjectivityScore: 0.3, framingScores: { conflict: 0.4 }, entities: [{ name: 'A', type: 'ORG', mentionCount: 1, stance: 'neutral' }],
      quotes: [], topics: [{ topic: 'policy', score: 0.8 }], politicalSignals: [], supportingEvidence: [],
      metadata: { limitations: ['Rule-based analysis'] }, article: { id: 'article-1', headline: 'Headline', source: { name: 'Example News' } },
    });
    expect(mapped.articleTitle).toBe('Headline');
    expect(mapped.sourceName).toBe('Example News');
    expect(mapped.headlineSentiment).toBe(-0.25);
    expect(mapped.topics).toEqual([{ topic: 'policy', score: 0.8 }]);
    expect(mapped.limitations).toEqual(['Rule-based analysis']);
  });

  it('maps stored comparison rows and preserves evidence and limitation details', () => {
    const mapped = toEventComparison({
      id: 'comparison-1', event: { id: 'event-1', title: 'Event', eventDate: '2026-11-25' },
      articleA: { id: 'a', headline: 'A', publishedAt: '2026-11-25', source: { name: 'Source A' } },
      articleB: { id: 'b', headline: 'B', publishedAt: '2026-11-25', source: { name: 'Source B' } },
      comparisonDetails: { evidence: [{ articleId: 'a', excerpt: 'Observed wording' }], limitations: ['Heuristic comparison'] },
    });
    expect(mapped.eventTitle).toBe('Event');
    expect(mapped.articles.map((article) => article.sourceName)).toEqual(['Source A', 'Source B']);
    expect(mapped.evidence).toEqual([{ articleId: 'a', excerpt: 'Observed wording' }]);
    expect(mapped.limitations).toEqual(['Heuristic comparison']);
  });
});
