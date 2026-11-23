// Centralized API Service for NewsLens AI Mobile Client

import { ArticleAnalysis, EventComparisonResult, NewsArticle, NewsEvent, NewsSource } from '../types/models';
import { MOCK_ARTICLES, MOCK_SOURCES } from '../constants/mockData';

// Dynamic API Base URL resolution
// Configure in mobile/.env via EXPO_PUBLIC_API_BASE_URL
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export interface HealthStatus {
  backend: boolean;
  aiEngine: boolean;
  backendUrl: string;
  message: string;
  timestamp: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  // Health Check for Backend
  async checkBackendHealth(): Promise<HealthStatus> {
    const status: HealthStatus = {
      backend: false,
      aiEngine: false,
      backendUrl: this.baseUrl,
      message: 'Backend currently offline or unreachable. Using standalone mock data.',
      timestamp: new Date().toISOString(),
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        status.backend = true;
        status.message = 'Backend service connected and operational.';
      }
    } catch {
      // Expected during Day 2 before backend is started on Day 3
      status.backend = false;
    }

    return status;
  }

  // Fetch Latest News Events
  async getEvents(): Promise<{ data: NewsEvent[]; isLive: boolean; error?: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${this.baseUrl}/api/v1/events`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        const records = Array.isArray(json.data) ? json.data : [];
        return {
          data: records.map((event: any) => ({
            id: event.id,
            title: event.title,
            summary: event.description || '',
            topicCategory: event.category || 'General',
            sourceCount: event.sourceCount ?? event.sources?.length ?? 0,
            articleCount: event.articleCount ?? 0,
            updatedAt: event.updatedAt || event.eventDate,
            sources: Array.isArray(event.sources) ? event.sources.map((source: any) => typeof source === 'string' ? source : source.name) : [],
          })),
          isLive: true,
        };
      }
    } catch {
      // Empty state is shown by the screen; event data is never replaced with demo records.
    }

    return { data: [], isLive: false, error: 'Event service unavailable. Pull to retry.' };
  }

  async getEvent(eventId: string): Promise<{ data: NewsEvent | null; isLive: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/events/${encodeURIComponent(eventId)}`);
      if (!response.ok) return { data: null, isLive: false };
      const { data: event } = await response.json();
      if (!event) return { data: null, isLive: false };
      return {
        data: {
          id: event.id,
          title: event.title,
          summary: event.description || '',
          topicCategory: event.category || 'General',
          sourceCount: event.sourceCount ?? new Set((event.articles || []).map((article: any) => article.sourceId)).size,
          articleCount: event.articleCount ?? event.articles?.length ?? 0,
          updatedAt: event.updatedAt || event.eventDate,
          sources: event.sources || Array.from(new Set((event.articles || []).map((article: any) => article.source?.name).filter(Boolean))),
        },
        isLive: true,
      };
    } catch {
      return { data: null, isLive: false };
    }
  }

  async getEventArticles(eventId: string, page = 1, limit = 50): Promise<{ data: NewsArticle[]; isLive: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/events/${encodeURIComponent(eventId)}/articles?page=${page}&limit=${limit}`);
      if (!response.ok) return { data: [], isLive: false };
      const json = await response.json();
      return {
        data: (Array.isArray(json.data) ? json.data : []).map((article: any) => ({
          id: article.id,
          sourceId: article.sourceId,
          sourceName: article.source?.name || 'Unknown source',
          eventId: article.eventId,
          title: article.headline,
          author: article.author || undefined,
          publishedAt: article.publishedAt,
          url: article.originalUrl,
          summary: article.summary || '',
          content: article.content || undefined,
          category: article.source?.category || 'General',
        })),
        isLive: true,
      };
    } catch {
      return { data: [], isLive: false };
    }
  }

  async compareEvent(eventId: string): Promise<{ data: EventComparisonResult[]; isLive: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/events/${encodeURIComponent(eventId)}/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const json = await response.json();
      if (!response.ok) {
        return { data: [], isLive: false, error: json.error?.message || 'Comparison could not be generated.' };
      }
      return { data: json.data?.comparisons || [], isLive: true };
    } catch {
      return { data: [], isLive: false, error: 'Backend is unreachable. Check the API connection and retry.' };
    }
  }

  // Fetch News Sources
  async getSources(): Promise<{ data: NewsSource[]; isLive: boolean }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${this.baseUrl}/api/v1/sources`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        return { data: json.data || json, isLive: true };
      }
    } catch {
      // Fallback
    }

    return { data: MOCK_SOURCES, isLive: false };
  }

  // Fetch News Articles
  async getArticles(params?: { sourceId?: string; search?: string; page?: number; limit?: number }): Promise<{ data: NewsArticle[]; isLive: boolean }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const query = new URLSearchParams();
      if (params?.sourceId) query.set('sourceId', params.sourceId);
      if (params?.search) query.set('search', params.search);
      if (params?.page) query.set('page', params.page.toString());
      if (params?.limit) query.set('limit', params.limit.toString());

      const url = `${this.baseUrl}/api/v1/articles${query.toString() ? `?${query.toString()}` : ''}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        return { data: json.data || json, isLive: true };
      }
    } catch {
      // Fallback
    }

    return { data: MOCK_ARTICLES, isLive: false };
  }

  // Request Article Framing Analysis
  async analyzeArticle(payload: { url?: string; text?: string }): Promise<{ analysis: ArticleAnalysis | null; isLive: boolean; error?: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`${this.baseUrl}/api/v1/articles/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        return { analysis: json.data || json, isLive: true };
      }
    } catch {
      // Leave the result empty when the API is unavailable.
    }
    return { analysis: null, isLive: false, error: 'Analysis service is unavailable. Check the API connection and retry.' };
  }

}

export const api = new ApiClient();
