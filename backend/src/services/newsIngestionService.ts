// Idempotent News Ingestion Pipeline & Persistence Service

import { DEFAULT_NEWS_SOURCES } from '../config/sources.js';
import { prisma } from '../utils/prisma.js';
import { rssParser, ParsedFeedItem } from './rssParserService.js';

export interface IngestionSourceSummary {
  sourceId: string;
  sourceName: string;
  feedUrl: string;
  status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
  fetchedCount: number;
  insertedCount: number;
  duplicateCount: number;
  error?: string;
}

export interface IngestionRunSummary {
  jobId: string;
  startTime: Date;
  endTime: Date;
  durationMs: number;
  totalSources: number;
  successfulSources: number;
  failedSources: number;
  totalFetched: number;
  totalInserted: number;
  totalDuplicates: number;
  sources: IngestionSourceSummary[];
}

export class NewsIngestionService {
  private isRunning: boolean = false;
  private lastRunSummary: IngestionRunSummary | null = null;

  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRunSummary,
    };
  }

  /**
   * Ensures default verified news sources exist in the database.
   */
  async seedDefaultSources(): Promise<void> {
    for (const source of DEFAULT_NEWS_SOURCES) {
      try {
        await prisma.newsSource.upsert({
          where: { websiteUrl: source.websiteUrl },
          update: {
            name: source.name,
            rssFeedUrl: source.rssFeedUrl,
            description: source.description,
            country: source.country,
            category: source.category,
            isActive: source.isActive,
          },
          create: {
            name: source.name,
            websiteUrl: source.websiteUrl,
            rssFeedUrl: source.rssFeedUrl,
            description: source.description,
            country: source.country,
            category: source.category,
            isActive: source.isActive,
          },
        });
      } catch (err) {
        // Log and continue if db unready
        console.warn(`[Ingestion] Failed to seed source ${source.name}:`, (err as any).message);
      }
    }
  }

  /**
   * Ingests articles from an individual source.
   */
  async ingestFromSource(source: { id: string; name: string; rssFeedUrl: string | null }): Promise<IngestionSourceSummary> {
    if (!source.rssFeedUrl) {
      return {
        sourceId: source.id,
        sourceName: source.name,
        feedUrl: '',
        status: 'SKIPPED',
        fetchedCount: 0,
        insertedCount: 0,
        duplicateCount: 0,
        error: 'No RSS feed URL configured for source.',
      };
    }

    try {
      const parsedFeed = await rssParser.parseFeed(source.rssFeedUrl, source.name);
      let insertedCount = 0;
      let duplicateCount = 0;

      for (const item of parsedFeed.items) {
        const result = await this.saveArticleIfNew(item, source.id);
        if (result === 'INSERTED') {
          insertedCount++;
        } else {
          duplicateCount++;
        }
      }

      return {
        sourceId: source.id,
        sourceName: source.name,
        feedUrl: source.rssFeedUrl,
        status: 'SUCCESS',
        fetchedCount: parsedFeed.items.length,
        insertedCount,
        duplicateCount,
      };
    } catch (err: any) {
      return {
        sourceId: source.id,
        sourceName: source.name,
        feedUrl: source.rssFeedUrl,
        status: 'FAILED',
        fetchedCount: 0,
        insertedCount: 0,
        duplicateCount: 0,
        error: err.message || 'Feed parse or ingestion failure.',
      };
    }
  }

  /**
   * Saves an article idempotently. If originalUrl already exists, skips insertion.
   */
  async saveArticleIfNew(item: ParsedFeedItem, sourceId: string): Promise<'INSERTED' | 'DUPLICATE'> {
    // 1. Check existing in database by unique originalUrl
    const existing = await prisma.newsArticle.findUnique({
      where: { originalUrl: item.url },
      select: { id: true },
    });

    if (existing) {
      return 'DUPLICATE';
    }

    // 2. Insert new article
    await prisma.newsArticle.create({
      data: {
        headline: item.title,
        originalUrl: item.url,
        author: item.author || null,
        summary: item.summary || null,
        content: item.content || item.summary || null,
        publishedAt: item.publishedAt,
        sourceId: sourceId,
      },
    });

    return 'INSERTED';
  }

  /**
   * Runs the full collection pipeline across all active configured sources.
   * Concurrency-guarded: prevents multiple overlapping ingestion runs.
   */
  async runCollection(): Promise<IngestionRunSummary> {
    if (this.isRunning) {
      throw new Error('A news collection pipeline is already running.');
    }

    this.isRunning = true;
    const startTime = new Date();
    const jobId = `job_${Date.now()}`;

    try {
      // 1. Ensure seed sources exist
      await this.seedDefaultSources();

      // 2. Retrieve active sources
      const sources = await prisma.newsSource.findMany({
        where: { isActive: true },
      });

      const summaries: IngestionSourceSummary[] = [];

      for (const source of sources) {
        const summary = await this.ingestFromSource(source);
        summaries.push(summary);
      }

      const endTime = new Date();
      const totalFetched = summaries.reduce((acc, s) => acc + s.fetchedCount, 0);
      const totalInserted = summaries.reduce((acc, s) => acc + s.insertedCount, 0);
      const totalDuplicates = summaries.reduce((acc, s) => acc + s.duplicateCount, 0);
      const successfulSources = summaries.filter((s) => s.status === 'SUCCESS').length;
      const failedSources = summaries.filter((s) => s.status === 'FAILED').length;

      const runSummary: IngestionRunSummary = {
        jobId,
        startTime,
        endTime,
        durationMs: endTime.getTime() - startTime.getTime(),
        totalSources: sources.length,
        successfulSources,
        failedSources,
        totalFetched,
        totalInserted,
        totalDuplicates,
        sources: summaries,
      };

      this.lastRunSummary = runSummary;
      return runSummary;
    } finally {
      this.isRunning = false;
    }
  }
}

export const newsIngestionService = new NewsIngestionService();
