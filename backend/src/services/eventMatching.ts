export interface MatchArticle {
  headline: string;
  content?: string | null;
  summary?: string | null;
  publishedAt: Date | string;
  entities?: unknown;
  topics?: unknown;
}

export interface EventMatchEvidence {
  score: number;
  matched: boolean;
  headlineSimilarity: number;
  contentSimilarity: number;
  entityOverlap: number;
  topicOverlap: number;
  dateProximity: number;
  sharedEntities: string[];
  sharedTopics: string[];
  sharedTerms: string[];
  explanation: string[];
}

const STOPWORDS = new Set([
  'about', 'after', 'against', 'amid', 'among', 'are', 'because', 'been', 'before',
  'between', 'could', 'from', 'have', 'into', 'more', 'over', 'says', 'that',
  'their', 'there', 'these', 'this', 'through', 'under', 'were', 'what', 'when',
  'where', 'which', 'while', 'with', 'would', 'will', 'says', 'report', 'reports',
  'news', 'live', 'latest', 'update', 'updates', 'official', 'officials', 'today',
  'yesterday', 'after', 'during', 'says', 'said', 'the', 'and', 'for', 'from',
  'its', 'was', 'has', 'his', 'her', 'they', 'who', 'how', 'why', 'not', 'but',
  'all', 'any', 'can', 'get', 'new', 'out', 'use', 'one', 'two', 'per', 'via',
]);

const TOPIC_TERMS: Record<string, string[]> = {
  economy: ['economy', 'inflation', 'budget', 'tax', 'market', 'jobs', 'prices', 'trade', 'bank', 'rates'],
  government: ['government', 'congress', 'parliament', 'senate', 'minister', 'president', 'legislation', 'policy', 'election'],
  health: ['health', 'hospital', 'patient', 'medical', 'vaccine', 'disease', 'doctor', 'healthcare'],
  climate: ['climate', 'emissions', 'energy', 'weather', 'hurricane', 'flood', 'wildfire', 'carbon', 'environment'],
  conflict: ['war', 'attack', 'military', 'troops', 'ceasefire', 'violence', 'missile', 'conflict'],
  justice: ['court', 'judge', 'trial', 'police', 'lawsuit', 'crime', 'ruling', 'justice'],
  technology: ['technology', 'software', 'artificial', 'intelligence', 'cyber', 'data', 'chip', 'technology'],
  education: ['school', 'student', 'teacher', 'university', 'education', 'college', 'tuition'],
};

export const EVENT_MATCH_THRESHOLD = (() => {
  const parsed = Number(process.env.EVENT_MATCH_THRESHOLD ?? 0.52);
  return Number.isFinite(parsed) && parsed >= 0.1 && parsed <= 1 ? parsed : 0.52;
})();

export const EVENT_MATCH_WINDOW_HOURS = 72;

export const normalizeTokens = (text: string): string[] =>
  (text.toLocaleLowerCase().normalize('NFKC').match(/[\p{L}\p{N}]{3,}/gu) ?? [])
    .filter((token) => !STOPWORDS.has(token));

const diceSimilarity = (left: string[], right: string[]): number => {
  const a = new Set(left);
  const b = new Set(right);
  if (!a.size || !b.size) return 0;
  let shared = 0;
  for (const token of a) if (b.has(token)) shared += 1;
  return (2 * shared) / (a.size + b.size);
};

const stringValues = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item: any) => {
    if (typeof item === 'string') return [item.toLocaleLowerCase()];
    if (item && typeof item.name === 'string') return [item.name.toLocaleLowerCase()];
    if (item && typeof item.topic === 'string') return [item.topic.toLocaleLowerCase()];
    return [];
  });
};

const extractEntities = (article: MatchArticle): string[] => {
  const analyzed = stringValues(article.entities);
  if (analyzed.length) return Array.from(new Set(analyzed));
  const text = `${article.headline} ${article.content ?? ''} ${article.summary ?? ''}`;
  const phrases = text.match(/\b(?:[A-Z][a-z]{2,})(?:\s+[A-Z][a-z]{2,}){0,2}\b/g) ?? [];
  const ignored = new Set(['The', 'This', 'That', 'After', 'Before', 'Officials', 'Government', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
  const normalized = phrases
    .map((value) => value.toLocaleLowerCase())
    .filter((value) => !ignored.has(value[0].toUpperCase() + value.slice(1)));
  return Array.from(new Set(normalized));
};

const extractTopics = (article: MatchArticle): string[] => {
  const analyzed = stringValues(article.topics);
  if (analyzed.length) return Array.from(new Set(analyzed));
  const text = normalizeTokens(`${article.headline} ${article.content ?? ''} ${article.summary ?? ''}`);
  return Object.entries(TOPIC_TERMS)
    .filter(([, terms]) => terms.some((term) => text.includes(term)))
    .map(([topic]) => topic);
};

const overlap = (left: string[], right: string[]): { score: number; shared: string[] } => {
  const a = new Set(left);
  const b = new Set(right);
  const shared = Array.from(a).filter((value) => b.has(value));
  const union = new Set([...a, ...b]);
  return { score: union.size ? shared.length / union.size : 0, shared };
};

const dateProximity = (left: Date | string, right: Date | string): number => {
  const hours = Math.abs(new Date(left).getTime() - new Date(right).getTime()) / 3_600_000;
  return Number.isFinite(hours) && hours <= EVENT_MATCH_WINDOW_HOURS
    ? 1 - hours / EVENT_MATCH_WINDOW_HOURS
    : 0;
};

export const compareArticlesForEvent = (
  left: MatchArticle,
  right: MatchArticle,
  threshold = EVENT_MATCH_THRESHOLD,
): EventMatchEvidence => {
  const headlineTokens = normalizeTokens(left.headline);
  const rightHeadlineTokens = normalizeTokens(right.headline);
  const headlineSimilarity = diceSimilarity(headlineTokens, rightHeadlineTokens);
  const leftContentTokens = normalizeTokens(`${left.content ?? ''} ${left.summary ?? ''}`);
  const rightContentTokens = normalizeTokens(`${right.content ?? ''} ${right.summary ?? ''}`);
  const contentSimilarity = diceSimilarity(leftContentTokens, rightContentTokens);
  const entities = overlap(extractEntities(left), extractEntities(right));
  const topics = overlap(extractTopics(left), extractTopics(right));
  const proximity = dateProximity(left.publishedAt, right.publishedAt);
  const terms = overlap(headlineTokens, rightHeadlineTokens).shared.slice(0, 8);
  const score = Number((
    headlineSimilarity * 0.3 + contentSimilarity * 0.3 + entities.score * 0.2 +
    topics.score * 0.1 + proximity * 0.1
  ).toFixed(3));
  const hasDistinctiveSupport = contentSimilarity >= 0.08 || (entities.shared.length >= 2 && topics.shared.length > 0);
  const matched = proximity > 0 && headlineSimilarity >= 0.08 && hasDistinctiveSupport && score >= threshold;
  const explanation: string[] = [];
  if (entities.shared.length) explanation.push(`Shared named entities: ${entities.shared.slice(0, 5).join(', ')}.`);
  if (topics.shared.length) explanation.push(`Shared topic signals: ${topics.shared.join(', ')}.`);
  if (terms.length) explanation.push(`Shared headline terms: ${terms.join(', ')}.`);
  explanation.push(`Published ${Math.abs(new Date(left.publishedAt).getTime() - new Date(right.publishedAt).getTime()) / 3_600_000 < 1 ? 'within one hour' : 'within 72 hours'} of each other.`);
  if (!matched) explanation.push('The configured score or minimum-evidence gate was not met; articles remain separate.');
  return {
    score,
    matched,
    headlineSimilarity: Number(headlineSimilarity.toFixed(3)),
    contentSimilarity: Number(contentSimilarity.toFixed(3)),
    entityOverlap: Number(entities.score.toFixed(3)),
    topicOverlap: Number(topics.score.toFixed(3)),
    dateProximity: Number(proximity.toFixed(3)),
    sharedEntities: entities.shared,
    sharedTopics: topics.shared,
    sharedTerms: terms,
    explanation,
  };
};
