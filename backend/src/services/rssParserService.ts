// Robust RSS & Atom Feed Parser Service

import Parser from 'rss-parser';
import { cleanHtmlText, normalizePublishedDate, normalizeUrl } from '../utils/sanitizer.js';

export interface ParsedFeedItem {
  title: string;
  url: string;
  summary: string;
  content?: string;
  author?: string;
  publishedAt: Date;
  categories?: string[];
}

export interface ParsedFeedResult {
  sourceName: string;
  feedUrl: string;
  websiteUrl?: string;
  title?: string;
  description?: string;
  items: ParsedFeedItem[];
}

export class RssParserService {
  private parser: Parser;

  constructor(timeoutMs: number = 8000) {
    this.parser = new Parser({
      timeout: timeoutMs,
      headers: {
        'User-Agent': 'NewsLensAI-Aggregator/1.0 (+https://github.com/snehaviradiya/newslens-ai)',
        'Accept': 'application/rss+xml, application/rdf+xml, application/atom+xml, application/xml, text/xml',
      },
      customFields: {
        item: [
          ['media:content', 'mediaContent'],
          ['content:encoded', 'contentEncoded'],
          ['dc:creator', 'creator'],
        ],
      },
    });
  }

  /**
   * Fetches and parses a single RSS or Atom feed URL.
   */
  async parseFeed(feedUrl: string, sourceName: string = 'Unknown Source'): Promise<ParsedFeedResult> {
    if (!feedUrl || typeof feedUrl !== 'string') {
      throw new Error(`Invalid feed URL provided for source: ${sourceName}`);
    }

    const feed = await this.parser.parseURL(feedUrl);
    const items: ParsedFeedItem[] = [];

    if (Array.isArray(feed.items)) {
      for (const item of feed.items) {
        // Must have link or guid to identify article
        const rawUrl = item.link || item.guid;
        if (!rawUrl) continue;

        const normalizedUrl = normalizeUrl(rawUrl);
        if (!normalizedUrl || !normalizedUrl.startsWith('http')) continue;

        const title = cleanHtmlText(item.title);
        if (!title) continue;

        const rawSummary = item.contentSnippet || item.summary || item.content || '';
        const summary = cleanHtmlText(rawSummary);

        const rawContent = (item as any).contentEncoded || item.content || rawSummary;
        const content = cleanHtmlText(rawContent);

        const author = cleanHtmlText(item.creator || (item as any)['dc:creator'] || item.author || null) || undefined;
        const publishedAt = normalizePublishedDate(item.isoDate || item.pubDate);

        const categories: string[] = Array.isArray(item.categories)
          ? item.categories.map((c: any) => (typeof c === 'string' ? c : c?._ || '')).filter(Boolean)
          : [];

        items.push({
          title,
          url: normalizedUrl,
          summary,
          content: content || summary,
          author,
          publishedAt,
          categories,
        });
      }
    }

    return {
      sourceName,
      feedUrl,
      websiteUrl: feed.link,
      title: feed.title,
      description: feed.description,
      items,
    };
  }

  /**
   * Validates if an RSS feed URL is accessible and returns valid feed items.
   */
  async validateFeedUrl(feedUrl: string): Promise<{ valid: boolean; title?: string; itemCount: number; error?: string }> {
    try {
      const feed = await this.parser.parseURL(feedUrl);
      return {
        valid: true,
        title: feed.title,
        itemCount: feed.items ? feed.items.length : 0,
      };
    } catch (err: any) {
      return {
        valid: false,
        itemCount: 0,
        error: err.message || 'Failed to parse RSS feed.',
      };
    }
  }
}

export const rssParser = new RssParserService();
