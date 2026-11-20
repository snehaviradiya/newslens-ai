// Centralized API Service for NewsLens AI Mobile Client

import { ArticleAnalysis, ArticleComparison, NewsArticle, NewsEvent, NewsSource } from '../types/models';
import { MOCK_ANALYSES, MOCK_ARTICLES, MOCK_COMPARISON, MOCK_EVENTS, MOCK_SOURCES } from '../constants/mockData';

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
  async getEvents(): Promise<{ data: NewsEvent[]; isLive: boolean }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${this.baseUrl}/api/v1/events`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        return { data: json.data || json, isLive: true };
      }
    } catch {
      // Fallback to local mock data during frontend development
    }

    return { data: MOCK_EVENTS, isLive: false };
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

  // Request Article Framing Analysis
  async analyzeArticle(payload: { url?: string; text?: string }): Promise<{ analysis: ArticleAnalysis; isLive: boolean }> {
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
      // Fallback to generated demo analysis
    }

    // Return demonstrative analysis for frontend testing
    const demoAnalysis: ArticleAnalysis = {
      id: `ana-demo-${Date.now()}`,
      articleId: 'art-demo',
      articleTitle: payload.url ? `Analysis for ${payload.url.replace(/^https?:\/\//, '').slice(0, 40)}...` : 'Submitted Article Text Analysis',
      sourceName: payload.url?.includes('reuters') ? 'Reuters' : payload.url?.includes('guardian') ? 'The Guardian' : 'Independent Source',
      analyzedAt: new Date().toISOString(),
      headlineSentiment: -0.15,
      headlineSensationalism: 0.22,
      overallTone: 'Balanced',
      subjectivityScore: 0.38,
      framingScores: {
        conflict: 0.42,
        economic: 0.65,
        humanInterest: 0.35,
        morality: 0.20,
        responsibility: 0.50,
      },
      entities: [
        { name: 'Regulatory Authority', type: 'ORG', mentionCount: 4, stance: 'Neutral' },
        { name: 'Industry Spokesperson', type: 'PERSON', mentionCount: 2, stance: 'Supportive' },
      ],
      quotes: [
        { speaker: 'Policy Representative', quote: 'We are evaluating the implementation timeline with industry stakeholders.' },
      ],
      supportingEvidence: [
        { frame: 'economic', excerpt: 'Projected capital expenditure requirements were estimated at $450M.' },
        { frame: 'conflict', excerpt: 'Opposition leaders questioned whether proposed safeguards are enforceable.' },
      ],
      isDemo: true,
    };

    return { analysis: demoAnalysis, isLive: false };
  }

  // Fetch Side-by-Side Comparison
  async getComparison(articleAId?: string, articleBId?: string): Promise<{ comparison: ArticleComparison; isLive: boolean }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${this.baseUrl}/api/v1/comparisons?articleA=${articleAId}&articleB=${articleBId}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        return { comparison: json.data || json, isLive: true };
      }
    } catch {
      // Fallback
    }

    return { comparison: MOCK_COMPARISON, isLive: false };
  }
}

export const api = new ApiClient();
