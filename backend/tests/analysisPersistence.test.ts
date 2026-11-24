jest.mock('../src/utils/prisma.js', () => ({
  prisma: {
    newsArticle: { findUnique: jest.fn() },
    articleAnalysis: { upsert: jest.fn() },
    analysisHistory: { findFirst: jest.fn(), create: jest.fn() },
  },
}));

import { prisma } from '../src/utils/prisma.js';
import { analysisService } from '../src/services/analysisService.js';

const db = prisma as any;

describe('stored article analysis persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    db.newsArticle.findUnique.mockResolvedValue({
      id: 'article-1', headline: 'Council approves a new public health policy',
      content: 'The city council approved a public health policy after a lengthy public hearing.',
      source: { name: 'Daily Example' },
    });
    jest.spyOn(analysisService, 'analyzeText').mockResolvedValue({
      articleId: 'article-1', modelVersion: '1.0.0', headlineSentiment: 0.1,
      headlineSensationalism: 0, overallTone: 'NEUTRAL', subjectivityScore: 0.2,
      framingScores: { conflict: 0, economic: 0, humanInterest: 0, morality: 0, responsibility: 0.2 },
      entities: [], quotes: [], topics: [], politicalSignals: [], supportingEvidence: [], metadata: {}, limitations: [],
    } as any);
    db.articleAnalysis.upsert.mockImplementation(async ({ where }: any) => ({ id: 'analysis-1', articleId: where.articleId_modelVersion.articleId }));
    db.analysisHistory.findFirst.mockResolvedValue(null);
    db.analysisHistory.create.mockResolvedValue({ id: 'history-1' });
  });

  afterEach(() => jest.restoreAllMocks());

  it('analyzes, upserts the result, and records user history', async () => {
    const saved = await analysisService.analyzeArticle('article-1', 'user-1');
    expect(saved.id).toBe('analysis-1');
    expect(db.articleAnalysis.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { articleId_modelVersion: { articleId: 'article-1', modelVersion: '1.0.0' } },
    }));
    expect(db.analysisHistory.create).toHaveBeenCalledWith({ data: { userId: 'user-1', articleId: 'article-1' } });
  });

  it('returns 404 for a missing article and does not call the AI service', async () => {
    db.newsArticle.findUnique.mockResolvedValue(null);
    await expect(analysisService.analyzeArticle('missing', 'user-1')).rejects.toMatchObject({ statusCode: 404 });
    expect(analysisService.analyzeText).not.toHaveBeenCalled();
  });

  it('rejects articles without enough stored text', async () => {
    db.newsArticle.findUnique.mockResolvedValue({ id: 'short', headline: 'Short item', content: 'Too short', source: { name: 'Daily Example' } });
    await expect(analysisService.analyzeArticle('short', 'user-1')).rejects.toMatchObject({ statusCode: 422 });
  });

  it('processes a stored-article batch in the requested order', async () => {
    const analyzeSpy = jest.spyOn(analysisService, 'analyzeArticle')
      .mockImplementation(async (articleId) => ({ id: `analysis-${articleId}` } as any));
    const result = await analysisService.analyzeArticles(['article-a', 'article-b'], 'user-1');
    expect(result.map((row: any) => row.id)).toEqual(['analysis-article-a', 'analysis-article-b']);
    expect(analyzeSpy.mock.calls.map((call) => call[0])).toEqual(['article-a', 'article-b']);
  });
});
