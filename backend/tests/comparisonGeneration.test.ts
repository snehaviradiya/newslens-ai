jest.mock('../src/utils/prisma.js', () => ({
  prisma: {
    newsEvent: { findUnique: jest.fn() },
    articleAnalysis: { upsert: jest.fn() },
    articleComparison: { upsert: jest.fn() },
    analysisHistory: { findFirst: jest.fn(), create: jest.fn() },
  },
}));

import { prisma } from '../src/utils/prisma.js';
import { comparisonGenerationService, comparisonPayload } from '../src/services/comparisonGenerationService.js';

const prismaMock = prisma as any;

describe('evidence-grounded comparison generation', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns a not-found error for a missing event', async () => {
    prismaMock.newsEvent.findUnique.mockResolvedValue(null);
    await expect(comparisonGenerationService.compareEvent('missing-event')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('rejects article IDs that do not belong to the requested event', async () => {
    prismaMock.newsEvent.findUnique.mockResolvedValue({ id: 'event-1', articles: [] });
    await expect(comparisonGenerationService.compareEvent('event-1', ['foreign-article', 'other-article']))
      .rejects.toMatchObject({ statusCode: 422 });
  });

  it('persists a user history link for generated comparisons', async () => {
    const event = {
      id: 'event-1', title: 'Storm response', eventDate: new Date('2026-11-24T08:00:00.000Z'),
      articles: [
        { id: 'article-a', sourceId: 'source-a', headline: 'City opens shelters after storm', content: 'City opens shelters after the storm. Mayor Lee said people need help.', publishedAt: new Date('2026-11-24T08:00:00Z'), source: { name: 'Outlet A' }, analyses: [{ id: 'analysis-a', entities: [], topics: [], quotes: [], framingScores: {}, supportingEvidence: [] }] },
        { id: 'article-b', sourceId: 'source-b', headline: 'Storm damages homes as shelters open', content: 'The storm damaged homes. Mayor Lee said the shelters can help residents.', publishedAt: new Date('2026-11-24T08:30:00Z'), source: { name: 'Outlet B' }, analyses: [{ id: 'analysis-b', entities: [], topics: [], quotes: [], framingScores: {}, supportingEvidence: [] }] },
      ],
    };
    prismaMock.newsEvent.findUnique.mockResolvedValue(event);
    prismaMock.articleComparison.upsert.mockImplementation(async ({ create }: any) => ({
      ...create, id: 'comparison-1', articleA: event.articles[0], articleB: event.articles[1], event,
    }));
    prismaMock.analysisHistory.findFirst.mockResolvedValue(null);
    prismaMock.analysisHistory.create.mockResolvedValue({ id: 'history-1' });

    const result = await comparisonGenerationService.compareEvent('event-1', undefined, 'user-1');
    expect(result.comparisons).toHaveLength(1);
    expect(prismaMock.analysisHistory.create).toHaveBeenCalledWith({
      data: { userId: 'user-1', comparisonId: 'comparison-1' },
    });
  });

  it('reports shared and unique findings and only returns source-grounded evidence', () => {
    const event = { id: 'event-1', title: 'Storm response', eventDate: new Date('2026-11-24T08:00:00.000Z') };
    const articleA = {
      id: 'article-a', headline: 'City opens shelters after storm', content: 'City officials opened shelters after the storm. Mayor Lee said, "We are helping families today."', publishedAt: event.eventDate, source: { name: 'Outlet A' },
    };
    const articleB = {
      id: 'article-b', headline: 'Storm damages homes as shelters open', content: 'The storm damaged homes. Mayor Lee said, "We are helping families today."', publishedAt: event.eventDate, source: { name: 'Outlet B' },
    };
    const analysisA = {
      entities: [{ name: 'Mayor Lee', type: 'PERSON', evidence: 'Mayor Lee said, "We are helping families today."' }, { name: 'City Hall', type: 'ORG' }],
      topics: [{ topic: 'Disaster response', supportingText: 'storm, shelters' }],
      quotes: [{ speaker: 'Mayor Lee', quote: 'We are helping families today' }, { speaker: 'Unknown Speaker', quote: 'invented statement absent from body' }],
      framingScores: { conflict: 0, economic: 0, humanInterest: 0.5, morality: 0, responsibility: 0 },
      supportingEvidence: [{ frame: 'Human Interest Frame', excerpt: 'City officials opened shelters after the storm.' }, { frame: 'Conflict Frame', excerpt: 'not in this article' }],
      headlineSentiment: 0, headlineSensationalism: 0.1,
    };
    const analysisB = {
      ...analysisA,
      entities: [{ name: 'Mayor Lee', type: 'PERSON', evidence: 'Mayor Lee said, "We are helping families today."' }],
      topics: [{ topic: 'Disaster response', supportingText: 'storm, homes' }],
      quotes: [{ speaker: 'Mayor Lee', quote: 'We are helping families today' }],
      supportingEvidence: [{ frame: 'Human Interest Frame', excerpt: 'not in this article' }],
    };
    const result = comparisonPayload(event, articleA, analysisA, articleB, analysisB);
    expect(result.payload.sharedEntities.map((entity: any) => entity.name)).toContain('Mayor Lee');
    expect(result.payload.uniqueEntities.articleA).toContain('City Hall');
    expect(result.payload.sharedTopics).toContain('Disaster response');
    expect(result.payload.quoteComparison.shared).toHaveLength(1);
    expect(result.payload.evidence.some((item: any) => item.excerpt === 'invented statement absent from body')).toBe(false);
    expect(result.payload.evidence.some((item: any) => item.excerpt === 'not in this article')).toBe(false);
    expect(result.overlap).toBeGreaterThanOrEqual(0);
  });
});
