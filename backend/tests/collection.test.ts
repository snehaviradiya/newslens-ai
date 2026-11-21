// News Collection & Ingestion Pipeline Tests

import request from 'supertest';
import { createApp } from '../src/app';
import { cleanHtmlText, normalizePublishedDate, normalizeUrl } from '../src/utils/sanitizer';
import { rssParser } from '../src/services/rssParserService';
import { newsIngestionService } from '../src/services/newsIngestionService';
import { signToken } from '../src/utils/jwt';

// Mock Prisma for Collection & Source operations
jest.mock('../src/utils/prisma.js', () => {
  const sources = [
    {
      id: 'src-1',
      name: 'BBC News',
      websiteUrl: 'https://bbc.com/news',
      rssFeedUrl: 'https://feeds.bbci.co.uk/news/rss.xml',
      description: 'Public service broadcaster',
      country: 'UK',
      category: 'General',
      isActive: true,
      _count: { articles: 5 },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'src-2',
      name: 'The Guardian',
      websiteUrl: 'https://theguardian.com',
      rssFeedUrl: 'https://www.theguardian.com/world/rss',
      description: 'Independent news',
      country: 'UK',
      category: 'Analysis',
      isActive: true,
      _count: { articles: 8 },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const articles: any[] = [
    {
      id: 'art-1',
      headline: 'Global Climate Summit Reaches Agreement',
      originalUrl: 'https://bbc.com/news/world-climate-123',
      author: 'Environment Reporter',
      content: 'World leaders gathered to finalize climate targets.',
      summary: 'World leaders gathered to finalize climate targets.',
      publishedAt: new Date('2026-11-21T10:00:00Z'),
      sourceId: 'src-1',
      eventId: null,
      source: sources[0],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  return {
    prisma: {
      newsSource: {
        findMany: jest.fn(async () => sources),
        count: jest.fn(async () => sources.length),
        findUnique: jest.fn(async ({ where }: any) =>
          sources.find((s) => s.id === where.id || s.websiteUrl === where.websiteUrl) || null),
        create: jest.fn(async ({ data }: any) => {
          const created = { id: `src-${sources.length + 1}`, ...data, createdAt: new Date(), updatedAt: new Date() };
          sources.push(created);
          return created;
        }),
        update: jest.fn(async ({ where, data }: any) => {
          const idx = sources.findIndex((s) => s.id === where.id);
          if (idx >= 0) {
            sources[idx] = { ...sources[idx], ...data, updatedAt: new Date() };
            return sources[idx];
          }
          return null;
        }),
        upsert: jest.fn(async ({ create }: any) => create),
      },
      newsArticle: {
        findMany: jest.fn(async ({ where, skip = 0, take = 10 }: any) => {
          let list = [...articles];
          if (where?.sourceId) list = list.filter((a) => a.sourceId === where.sourceId);
          if (where?.search || where?.OR) {
            const term = where.search || (where.OR && where.OR[0]?.headline?.contains);
            if (term) {
              list = list.filter((a) => a.headline.toLowerCase().includes(term.toLowerCase()));
            }
          }
          return list.slice(skip, skip + take);
        }),
        count: jest.fn(async () => articles.length),
        findUnique: jest.fn(async ({ where }: any) =>
          articles.find((a) => a.originalUrl === where.originalUrl || a.id === where.id) || null),
        create: jest.fn(async ({ data }: any) => {
          const created = { id: `art-${articles.length + 1}`, ...data, source: sources[0], createdAt: new Date(), updatedAt: new Date() };
          articles.push(created);
          return created;
        }),
      },
      newsEvent: {
        findMany: jest.fn(async () => []),
        count: jest.fn(async () => 0),
        findUnique: jest.fn(async () => null),
      },
    },
  };
});

describe('RSS Ingestion & Collection Pipeline Unit Tests', () => {
  describe('Sanitizer & Normalizer Utilities', () => {
    it('normalizes URLs and strips tracking parameters', () => {
      const dirtyUrl = 'http://example.com/world/news/?utm_source=twitter&utm_medium=social&fbclid=12345#section';
      const clean = normalizeUrl(dirtyUrl);
      expect(clean).toBe('https://example.com/world/news#section');
    });

    it('removes trailing slashes from path URLs', () => {
      expect(normalizeUrl('https://example.com/article/')).toBe('https://example.com/article');
      expect(normalizeUrl('https://example.com/')).toBe('https://example.com/');
    });

    it('strips HTML tags and decodes entities', () => {
      const html = '<p>Breaking: &quot;Agreement&quot; reached &amp; ratified &lt;today&gt;.<script>alert(1)</script></p>';
      const cleaned = cleanHtmlText(html);
      expect(cleaned).toBe('Breaking: "Agreement" reached & ratified <today>.');
    });

    it('handles empty or null HTML gracefully', () => {
      expect(cleanHtmlText(null)).toBe('');
      expect(cleanHtmlText(undefined)).toBe('');
      expect(cleanHtmlText('   ')).toBe('');
    });

    it('normalizes valid and invalid published dates', () => {
      const validDate = '2026-11-20T14:30:00Z';
      expect(normalizePublishedDate(validDate).toISOString()).toBe('2026-11-20T14:30:00.000Z');

      const invalidDate = 'invalid-date-string';
      const fallback = normalizePublishedDate(invalidDate);
      expect(fallback instanceof Date).toBe(true);
      expect(isNaN(fallback.getTime())).toBe(false);
    });
  });

  describe('RSS Parser Service', () => {
    it('parses valid feed mock entries correctly', async () => {
      jest.spyOn((rssParser as any).parser, 'parseURL').mockResolvedValueOnce({
        title: 'Mock News Feed',
        link: 'https://mocknews.com',
        description: 'World News Feed',
        items: [
          {
            title: 'Test Headline <b>Bold</b>',
            link: 'http://mocknews.com/articles/1?utm_campaign=daily',
            contentSnippet: 'Test snippet content with &amp; entity',
            content: '<p>Full HTML content</p>',
            creator: 'Jane Reporter',
            isoDate: '2026-11-21T08:00:00.000Z',
            categories: ['World', 'Diplomacy'],
          },
          {
            // Missing link - should be skipped
            title: 'Article Without Link',
          },
          {
            // Empty title - should be skipped
            link: 'https://mocknews.com/articles/empty-title',
            title: '   ',
          },
        ],
      } as any);

      const result = await rssParser.parseFeed('https://mocknews.com/rss', 'Mock News');
      expect(result.sourceName).toBe('Mock News');
      expect(result.items.length).toBe(1);
      expect(result.items[0].title).toBe('Test Headline Bold');
      expect(result.items[0].url).toBe('https://mocknews.com/articles/1');
      expect(result.items[0].author).toBe('Jane Reporter');
      expect(result.items[0].summary).toBe('Test snippet content with & entity');
      expect(result.items[0].categories).toEqual(['World', 'Diplomacy']);
    });

    it('handles feed parse errors gracefully', async () => {
      jest.spyOn((rssParser as any).parser, 'parseURL').mockRejectedValueOnce(new Error('Network timeout'));

      await expect(rssParser.parseFeed('https://badfeed.com/rss', 'Bad Source')).rejects.toThrow('Network timeout');
    });

    it('validates valid and invalid feed URLs', async () => {
      jest.spyOn((rssParser as any).parser, 'parseURL').mockResolvedValueOnce({
        title: 'Valid RSS',
        items: [{ title: 'Item 1' }, { title: 'Item 2' }],
      } as any);

      const validCheck = await rssParser.validateFeedUrl('https://good.com/rss');
      expect(validCheck.valid).toBe(true);
      expect(validCheck.itemCount).toBe(2);

      jest.spyOn((rssParser as any).parser, 'parseURL').mockRejectedValueOnce(new Error('Not an XML feed'));
      const invalidCheck = await rssParser.validateFeedUrl('https://notanrss.com/page');
      expect(invalidCheck.valid).toBe(false);
      expect(invalidCheck.error).toBe('Not an XML feed');
    });
  });

  describe('News Ingestion Service Pipeline & Deduplication', () => {
    it('detects existing duplicate articles and prevents re-insertion', async () => {
      const mockItem = {
        title: 'Existing Article',
        url: 'https://bbc.com/news/world-climate-123',
        summary: 'Existing summary',
        publishedAt: new Date(),
      };

      const status = await newsIngestionService.saveArticleIfNew(mockItem, 'src-1');
      expect(status).toBe('DUPLICATE');
    });

    it('inserts fresh non-duplicate articles', async () => {
      const freshItem = {
        title: 'Brand New Discovery',
        url: 'https://bbc.com/news/brand-new-discovery-456',
        summary: 'A new article summary',
        publishedAt: new Date(),
      };

      const status = await newsIngestionService.saveArticleIfNew(freshItem, 'src-1');
      expect(status).toBe('INSERTED');
    });

    it('runs collection cycle across sources and returns full summary', async () => {
      jest.spyOn(rssParser, 'parseFeed').mockResolvedValue({
        sourceName: 'Mock Source',
        feedUrl: 'https://mock.com/rss',
        items: [
          {
            title: 'Collection Run Item 1',
            url: 'https://mock.com/articles/run-1',
            summary: 'Summary 1',
            publishedAt: new Date(),
          },
          {
            title: 'Collection Run Item Duplicate',
            url: 'https://bbc.com/news/world-climate-123', // Existing duplicate
            summary: 'Duplicate summary',
            publishedAt: new Date(),
          },
        ],
      });

      const summary = await newsIngestionService.runCollection();
      expect(summary.jobId).toBeDefined();
      expect(summary.totalSources).toBeGreaterThan(0);
      expect(summary.totalFetched).toBeGreaterThan(0);
      expect(summary.totalDuplicates).toBeGreaterThan(0);
      expect(summary.sources.length).toBeGreaterThan(0);
    });
  });
});

describe('Collection & Enhanced News API Integration Tests', () => {
  const app = createApp();
  const researcherToken = signToken({
    userId: 'user-researcher-1',
    email: 'researcher@newslens.ai',
    role: 'RESEARCHER',
  });
  const regularUserToken = signToken({
    userId: 'user-regular-1',
    email: 'user@newslens.ai',
    role: 'USER',
  });

  describe('GET /api/v1/collection/status', () => {
    it('returns collection pipeline running status and last run metadata', async () => {
      const res = await request(app).get('/api/v1/collection/status');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isRunning).toBeDefined();
    });
  });

  describe('POST /api/v1/collection/run', () => {
    it('rejects unauthenticated requests with 401', async () => {
      const res = await request(app).post('/api/v1/collection/run');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects standard USER role requests with 403 (requires RESEARCHER or ADMIN)', async () => {
      const res = await request(app)
        .post('/api/v1/collection/run')
        .set('Authorization', `Bearer ${regularUserToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('triggers manual collection when authenticated as RESEARCHER', async () => {
      jest.spyOn(newsIngestionService, 'runCollection').mockResolvedValueOnce({
        jobId: 'job_test_123',
        startTime: new Date(),
        endTime: new Date(),
        durationMs: 500,
        totalSources: 2,
        successfulSources: 2,
        failedSources: 0,
        totalFetched: 10,
        totalInserted: 8,
        totalDuplicates: 2,
        sources: [],
      });

      const res = await request(app)
        .post('/api/v1/collection/run')
        .set('Authorization', `Bearer ${researcherToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.jobId).toBe('job_test_123');
      expect(res.body.data.totalInserted).toBe(8);
    });
  });

  describe('POST /api/v1/sources/validate-feed', () => {
    it('validates a feed URL successfully', async () => {
      jest.spyOn(rssParser, 'validateFeedUrl').mockResolvedValueOnce({
        valid: true,
        title: 'BBC World News',
        itemCount: 30,
      });

      const res = await request(app)
        .post('/api/v1/sources/validate-feed')
        .send({ feedUrl: 'https://feeds.bbci.co.uk/news/world/rss.xml' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.valid).toBe(true);
      expect(res.body.data.itemCount).toBe(30);
    });

    it('rejects invalid feedUrl payload with 400', async () => {
      const res = await request(app)
        .post('/api/v1/sources/validate-feed')
        .send({ feedUrl: 'not-a-valid-url' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/articles with Search & Date Filters', () => {
    it('supports date range filtering and sorting options', async () => {
      const res = await request(app).get(
        '/api/v1/articles?startDate=2026-11-01T00:00:00Z&endDate=2026-11-25T23:59:59Z&sortBy=publishedAt&sortOrder=desc'
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('rejects malformed date filter query with 400', async () => {
      const res = await request(app).get('/api/v1/articles?startDate=invalid-date');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
