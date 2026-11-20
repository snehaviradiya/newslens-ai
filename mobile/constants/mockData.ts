// Realistic Editorial Mock Data for Day 2 Interface Demonstration

import { ArticleAnalysis, ArticleComparison, NewsArticle, NewsEvent, NewsSource, UserProfile } from '../types/models';

export const MOCK_SOURCES: NewsSource[] = [
  { id: 'src-1', name: 'BBC News', canonicalUrl: 'https://bbc.com/news', country: 'UK', category: 'General', articleCount: 142 },
  { id: 'src-2', name: 'Reuters', canonicalUrl: 'https://reuters.com', country: 'International', category: 'Newswire', articleCount: 210 },
  { id: 'src-3', name: 'The Guardian', canonicalUrl: 'https://theguardian.com', country: 'UK', category: 'Analysis', articleCount: 118 },
  { id: 'src-4', name: 'Associated Press', canonicalUrl: 'https://apnews.com', country: 'USA', category: 'Newswire', articleCount: 184 },
  { id: 'src-5', name: 'Financial Times', canonicalUrl: 'https://ft.com', country: 'UK', category: 'Financial', articleCount: 96 },
];

export const MOCK_EVENTS: NewsEvent[] = [
  {
    id: 'evt-1',
    title: 'Global Climate Summit Adopts New Energy Transition Pact',
    summary: 'Delegates from 195 nations reach late-night compromise on renewable energy acceleration and gradual emissions reductions.',
    topicCategory: 'Environment & Policy',
    sourceCount: 4,
    articleCount: 12,
    updatedAt: '2026-11-20T10:15:00Z',
    sources: ['Reuters', 'BBC News', 'The Guardian', 'Financial Times'],
  },
  {
    id: 'evt-2',
    title: 'Central Banks Signal Cautious Monetary Easing as Inflation Cools',
    summary: 'Policymakers balance employment stability against persistent service-sector price pressures across major economies.',
    topicCategory: 'Economy',
    sourceCount: 3,
    articleCount: 8,
    updatedAt: '2026-11-20T08:45:00Z',
    sources: ['Financial Times', 'Reuters', 'Associated Press'],
  },
  {
    id: 'evt-3',
    title: 'New AI Governance Framework Introduced in International Forum',
    summary: 'Multi-stakeholder summit debates standardized safety audits and transparency standards for frontier foundation models.',
    topicCategory: 'Technology & Governance',
    sourceCount: 3,
    articleCount: 6,
    updatedAt: '2026-11-19T18:30:00Z',
    sources: ['BBC News', 'The Guardian', 'Associated Press'],
  },
];

export const MOCK_ARTICLES: NewsArticle[] = [
  {
    id: 'art-1',
    sourceId: 'src-2',
    sourceName: 'Reuters',
    eventId: 'evt-1',
    title: 'Nations Agree Historic Energy Roadmap After Heated Negotiations',
    author: 'David Alistair',
    publishedAt: '2026-11-20T09:30:00Z',
    url: 'https://reuters.com/world/climate-pact-agreement',
    category: 'Environment',
    summary: 'Fact-focused dispatch highlighting the financial commitments and renewable build-out benchmarks accepted by member delegations.',
    content: 'Delegates approved an updated roadmap accelerating renewable investments while deferring contentious fossil fuel subsidy phaseouts to future sessions. Negotiators cited economic realism and grid resilience requirements.',
  },
  {
    id: 'art-2',
    sourceId: 'src-3',
    sourceName: 'The Guardian',
    eventId: 'evt-1',
    title: 'Climate Deal Falls Short of Binding Targets Amid Fossil Fuel Lobbying',
    author: 'Fiona Campbell',
    publishedAt: '2026-11-20T09:45:00Z',
    url: 'https://theguardian.com/environment/summit-verdict',
    category: 'Environment',
    summary: 'Critical analysis examining loophole clauses, vulnerability of developing island states, and civil society protests outside the plenary hall.',
    content: 'While hailed as a diplomatic triumph by host officials, environmental watchdogs warned the absence of binding enforcement mechanisms leaves frontline communities exposed to severe climate disruptions.',
  },
];

export const MOCK_ANALYSES: ArticleAnalysis[] = [
  {
    id: 'ana-1',
    articleId: 'art-1',
    articleTitle: 'Nations Agree Historic Energy Roadmap After Heated Negotiations',
    sourceName: 'Reuters',
    analyzedAt: '2026-11-20T10:00:00Z',
    headlineSentiment: 0.15,
    headlineSensationalism: 0.08,
    overallTone: 'Neutral',
    subjectivityScore: 0.22,
    framingScores: {
      conflict: 0.28,
      economic: 0.72,
      humanInterest: 0.20,
      morality: 0.12,
      responsibility: 0.45,
    },
    entities: [
      { name: 'UN Framework Convention', type: 'ORG', mentionCount: 6, stance: 'Neutral' },
      { name: 'Elena Rostova', type: 'PERSON', mentionCount: 3, stance: 'Supportive' },
      { name: 'European Union', type: 'GPE', mentionCount: 4, stance: 'Supportive' },
    ],
    quotes: [
      { speaker: 'Elena Rostova, Chief Negotiator', quote: 'This represents a pragmatically achievable consensus that protects energy access while directing capital into solar and wind.', affiliation: 'UN Secretariat' },
    ],
    supportingEvidence: [
      { frame: 'economic', excerpt: 'Negotiators cited economic realism and grid resilience requirements.' },
      { frame: 'responsibility', excerpt: 'Member states committed to submit updated national allocation plans by Q3 2027.' },
    ],
    isDemo: true,
  },
  {
    id: 'ana-2',
    articleId: 'art-2',
    articleTitle: 'Climate Deal Falls Short of Binding Targets Amid Fossil Fuel Lobbying',
    sourceName: 'The Guardian',
    analyzedAt: '2026-11-20T10:05:00Z',
    headlineSentiment: -0.42,
    headlineSensationalism: 0.38,
    overallTone: 'Critical',
    subjectivityScore: 0.64,
    framingScores: {
      conflict: 0.74,
      economic: 0.35,
      humanInterest: 0.68,
      morality: 0.58,
      responsibility: 0.82,
    },
    entities: [
      { name: 'Alliance of Small Island States', type: 'ORG', mentionCount: 5, stance: 'Critical' },
      { name: 'Civil Society Coalition', type: 'ORG', mentionCount: 4, stance: 'Critical' },
    ],
    quotes: [
      { speaker: 'Dr. Malik Thorne, Climate Policy Director', quote: 'A voluntary target with zero enforcement penalty cannot shield vulnerable coastal populations from inevitable inundation.', affiliation: 'Global Justice Initiative' },
    ],
    supportingEvidence: [
      { frame: 'conflict', excerpt: 'Environmental watchdogs warned the absence of binding enforcement mechanisms leaves frontline communities exposed.' },
      { frame: 'morality', excerpt: 'Activists gathered on the steps describing the final text as a moral abdication of historical polluter duty.' },
    ],
    isDemo: true,
  },
];

export const MOCK_COMPARISON: ArticleComparison = {
  id: 'comp-1',
  eventId: 'evt-1',
  eventTitle: 'Global Climate Summit Adopts New Energy Transition Pact',
  articleA: MOCK_ARTICLES[0],
  articleB: MOCK_ARTICLES[1],
  analysisA: MOCK_ANALYSES[0],
  analysisB: MOCK_ANALYSES[1],
  coverageOverlapScore: 0.58,
  keyDivergencePoints: [
    'Headline emphasis: Reuters emphasizes "Historic Roadmap / Consensus", while The Guardian highlights "Falls Short / Lobbying".',
    'Framing divergence: Reuters prioritizes Economic feasibility (0.72), whereas The Guardian emphasizes Conflict (0.74) and Moral responsibility (0.82).',
    'Stakeholder representation: Reuters quotes primary ministerial delegation chiefs; The Guardian centers dissenting island delegates and advocacy leaders.',
  ],
};

export const MOCK_USER: UserProfile = {
  id: 'usr-101',
  name: 'Sneha Viradiya',
  email: 'sneha@newslens.ai',
  role: 'Researcher',
  savedAnalysesCount: 14,
  comparedArticlesCount: 8,
};
