// Centralized, typed API client. Authentication is held in memory for the app session.

import { Platform } from 'react-native';
import {
  ApiUser,
  ArticleAnalysis,
  EventComparisonResult,
  HistoryRecord,
  NewsArticle,
  NewsEvent,
  NewsSource,
} from '../types/models';
import { toArticleAnalysis, toEventComparison, toNewsArticle } from './apiMappers';

const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
export const API_BASE_URL = configuredBaseUrl || (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000');

export interface HealthStatus {
  backend: boolean;
  aiEngine: boolean;
  backendUrl: string;
  message: string;
  timestamp: string;
}

const asArray = <T>(value: unknown): T[] => Array.isArray(value) ? value as T[] : [];
const messageFrom = (body: any, fallback: string) => body?.error?.message || body?.message || fallback;

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private user: ApiUser | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  getBaseUrl(): string { return this.baseUrl; }
  getSessionUser(): ApiUser | null { return this.user; }
  isAuthenticated(): boolean { return Boolean(this.token); }

  private async request(path: string, init: RequestInit = {}, timeoutMs = 10000): Promise<any> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        headers: {
          Accept: 'application/json',
          ...(init.body ? { 'Content-Type': 'application/json' } : {}),
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
          ...init.headers,
        },
        signal: controller.signal,
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(messageFrom(body, `Request failed (${response.status}).`));
      return body;
    } finally {
      clearTimeout(timeout);
    }
  }

  async checkBackendHealth(): Promise<HealthStatus> {
    try {
      const body = await this.request('/health', {}, 3000);
      return { backend: true, aiEngine: false, backendUrl: this.baseUrl, message: 'Backend service connected.', timestamp: body.timestamp || new Date().toISOString() };
    } catch {
      return { backend: false, aiEngine: false, backendUrl: this.baseUrl, message: 'Backend service is unavailable.', timestamp: new Date().toISOString() };
    }
  }

  async login(email: string, password: string): Promise<ApiUser> {
    const body = await this.request('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    this.token = body.data.token;
    this.user = body.data.user;
    return this.user!;
  }

  async register(name: string, email: string, password: string): Promise<ApiUser> {
    const body = await this.request('/api/v1/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
    this.token = body.data.token;
    this.user = body.data.user;
    return this.user!;
  }

  async getProfile(): Promise<ApiUser> {
    const body = await this.request('/api/v1/auth/me');
    this.user = body.data.user;
    return this.user!;
  }

  logout(): void {
    this.token = null;
    this.user = null;
  }

  async getEvents(): Promise<{ data: NewsEvent[]; error?: string }> {
    try {
      const body = await this.request('/api/v1/events?page=1&limit=20');
      return { data: asArray<any>(body.data).map((event) => ({
        id: event.id,
        title: event.title,
        summary: event.description || '',
        topicCategory: event.category || 'General',
        sourceCount: Number(event.sourceCount || 0),
        articleCount: Number(event.articleCount || 0),
        updatedAt: event.updatedAt || event.eventDate,
        sources: asArray<any>(event.sources).map((source) => typeof source === 'string' ? source : source.name).filter(Boolean),
      })) };
    } catch (error) { return { data: [], error: (error as Error).message }; }
  }

  async getEvent(eventId: string): Promise<NewsEvent> {
    const body = await this.request(`/api/v1/events/${encodeURIComponent(eventId)}`);
    const event = body.data;
    const articles = asArray<any>(event.articles);
    return {
      id: event.id,
      title: event.title,
      summary: event.description || '',
      topicCategory: event.category || 'General',
      sourceCount: new Set(articles.map((article) => article.sourceId)).size,
      articleCount: articles.length,
      updatedAt: event.updatedAt || event.eventDate,
      sources: Array.from(new Set(articles.map((article) => article.source?.name).filter(Boolean))),
    };
  }

  async getEventArticles(eventId: string, page = 1, limit = 50): Promise<NewsArticle[]> {
    const body = await this.request(`/api/v1/events/${encodeURIComponent(eventId)}/articles?page=${page}&limit=${limit}`);
    return asArray<any>(body.data).map(toNewsArticle);
  }

  async compareEvent(eventId: string): Promise<EventComparisonResult[]> {
    const body = await this.request(`/api/v1/events/${encodeURIComponent(eventId)}/compare`, { method: 'POST', body: JSON.stringify({}) });
    return asArray<EventComparisonResult>(body.data?.comparisons);
  }

  async getComparison(comparisonId: string): Promise<EventComparisonResult> {
    const body = await this.request(`/api/v1/comparisons/${encodeURIComponent(comparisonId)}`);
    return toEventComparison(body.data);
  }

  async getSources(): Promise<NewsSource[]> {
    const body = await this.request('/api/v1/sources?page=1&limit=50');
    return asArray<any>(body.data).map((source) => ({
      id: source.id,
      name: source.name,
      canonicalUrl: source.websiteUrl,
      country: source.country || 'International',
      category: source.category || 'General',
      articleCount: Number(source.articleCount || 0),
      rssFeedUrl: source.rssFeedUrl,
    }));
  }

  async getArticles(params?: { sourceId?: string; search?: string; page?: number; limit?: number }): Promise<NewsArticle[]> {
    const query = new URLSearchParams();
    query.set('page', String(params?.page ?? 1));
    query.set('limit', String(params?.limit ?? 20));
    if (params?.sourceId) query.set('sourceId', params.sourceId);
    if (params?.search) query.set('search', params.search);
    const body = await this.request(`/api/v1/articles?${query.toString()}`);
    return asArray<any>(body.data).map(toNewsArticle);
  }

  async getArticle(articleId: string): Promise<NewsArticle & { analysis?: ArticleAnalysis }> {
    const body = await this.request(`/api/v1/articles/${encodeURIComponent(articleId)}`);
    const article = body.data;
    const latest = asArray<any>(article.analyses)
      .filter((analysis) => analysis.status === 'COMPLETED')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    return { ...toNewsArticle(article), ...(latest ? { analysis: toArticleAnalysis({ ...latest, article }) } : {}) };
  }

  async analyzeStoredArticle(articleId: string): Promise<ArticleAnalysis> {
    const body = await this.request(`/api/v1/articles/${encodeURIComponent(articleId)}/analyze`, { method: 'POST', body: '{}' });
    return toArticleAnalysis(body.data);
  }

  async analyzeStoredArticles(articleIds: string[]): Promise<ArticleAnalysis[]> {
    const body = await this.request('/api/v1/articles/analyze/batch', {
      method: 'POST',
      body: JSON.stringify({ articleIds }),
    });
    return asArray<any>(body.data).map(toArticleAnalysis);
  }

  async analyzeArticle(payload: { url?: string; text?: string; headline?: string }): Promise<ArticleAnalysis> {
    const body = await this.request('/api/v1/articles/analyze', { method: 'POST', body: JSON.stringify(payload) });
    return toArticleAnalysis(body.data);
  }

  async getHistory(): Promise<HistoryRecord[]> {
    const body = await this.request('/api/v1/history?page=1&limit=100');
    return asArray<any>(body.data).map((record) => ({
      id: record.id,
      createdAt: record.createdAt,
      ...(record.article ? {
        article: {
          ...toNewsArticle(record.article),
          ...(asArray<any>(record.article.analyses).find((analysis) => analysis.status === 'COMPLETED')
            ? { analysis: toArticleAnalysis({ ...record.article.analyses.find((analysis: any) => analysis.status === 'COMPLETED'), article: record.article }) }
            : {}),
        },
      } : {}),
      ...(record.comparison ? { comparison: toEventComparison(record.comparison) } : {}),
    }));
  }
}

export const api = new ApiClient();
