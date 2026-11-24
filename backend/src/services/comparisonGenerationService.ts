import { AppError } from '../middleware/errorHandler.js';
import { prisma } from '../utils/prisma.js';
import { analysisService } from './analysisService.js';
import { compareArticlesForEvent } from './eventMatching.js';

const asList = (value: unknown): any[] => Array.isArray(value) ? value : [];
const textSet = (items: any[], key: string): string[] => items
  .map((item) => typeof item === 'string' ? item : item?.[key])
  .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
  .map((value) => value.trim());
const keyOf = (value: string) => value.toLocaleLowerCase().replace(/\s+/g, ' ').trim();
const findExcerpt = (body: string, term: string): string | null => {
  const position = body.toLocaleLowerCase().indexOf(term.toLocaleLowerCase());
  if (position < 0) return null;
  const start = Math.max(0, body.lastIndexOf('.', position) + 1, position - 100);
  const nextPeriod = body.indexOf('.', position + term.length);
  const end = nextPeriod >= 0 && nextPeriod - start <= 260 ? nextPeriod + 1 : Math.min(body.length, start + 260);
  const excerpt = body.slice(start, end).trim();
  return excerpt.includes(term) || excerpt.toLocaleLowerCase().includes(term.toLocaleLowerCase()) ? excerpt : null;
};

const ensureAnalysis = async (article: any) => {
  const saved = article.analyses?.[0];
  if (saved) return saved;
  const body = article.content || article.summary;
  if (!body || body.trim().length < 15) {
    throw new AppError(`Article ${article.id} has no usable content for comparison.`, 422);
  }
  const result: any = await analysisService.analyzeText(article.headline, body, article.source?.name);
  return prisma.articleAnalysis.upsert({
    where: { articleId_modelVersion: { articleId: article.id, modelVersion: result.modelVersion ?? '1.0.0' } },
    create: {
      articleId: article.id,
      modelVersion: result.modelVersion ?? '1.0.0',
      headlineSentiment: result.headlineSentiment,
      headlineSensationalism: result.headlineSensationalism,
      overallTone: result.overallTone,
      subjectivityScore: result.subjectivityScore,
      framingScores: result.framingScores,
      entities: result.entities,
      quotes: result.quotes,
      topics: result.topics,
      politicalSignals: result.politicalSignals,
      supportingEvidence: result.supportingEvidence,
      metadata: result.metadata,
    },
    update: {
      headlineSentiment: result.headlineSentiment,
      headlineSensationalism: result.headlineSensationalism,
      overallTone: result.overallTone,
      subjectivityScore: result.subjectivityScore,
      framingScores: result.framingScores,
      entities: result.entities,
      quotes: result.quotes,
      topics: result.topics,
      politicalSignals: result.politicalSignals,
      supportingEvidence: result.supportingEvidence,
      metadata: result.metadata,
    },
  });
};

export const comparisonPayload = (event: any, articleA: any, analysisA: any, articleB: any, analysisB: any) => {
  const entitiesA = asList(analysisA.entities);
  const entitiesB = asList(analysisB.entities);
  const entityNamesA = textSet(entitiesA, 'name');
  const entityNamesB = textSet(entitiesB, 'name');
  const entityMapA = new Map(entitiesA.map((entity) => [keyOf(entity.name ?? ''), entity]));
  const entityMapB = new Map(entitiesB.map((entity) => [keyOf(entity.name ?? ''), entity]));
  const topicsA = asList(analysisA.topics);
  const topicsB = asList(analysisB.topics);
  const topicNamesA = textSet(topicsA, 'topic');
  const topicNamesB = textSet(topicsB, 'topic');
  const keysA = new Set(entityNamesA.map(keyOf));
  const keysB = new Set(entityNamesB.map(keyOf));
  const topicKeysA = new Set(topicNamesA.map(keyOf));
  const topicKeysB = new Set(topicNamesB.map(keyOf));
  const quotesA = asList(analysisA.quotes).filter((quote) => typeof quote.quote === 'string' && quote.quote.length > 0 && (articleA.content ?? articleA.summary ?? '').includes(quote.quote));
  const quotesB = asList(analysisB.quotes).filter((quote) => typeof quote.quote === 'string' && quote.quote.length > 0 && (articleB.content ?? articleB.summary ?? '').includes(quote.quote));
  const quoteKeysA = new Set(quotesA.map((quote) => keyOf(`${quote.speaker ?? ''}:${quote.quote}`)));
  const quoteKeysB = new Set(quotesB.map((quote) => keyOf(`${quote.speaker ?? ''}:${quote.quote}`)));
  const frameScoresA = (analysisA.framingScores ?? {}) as Record<string, number>;
  const frameScoresB = (analysisB.framingScores ?? {}) as Record<string, number>;
  const frameKeys = ['conflict', 'economic', 'humanInterest', 'morality', 'responsibility'];
  const evidenceA = asList(analysisA.supportingEvidence).filter((item) => typeof item.excerpt === 'string' && (articleA.content ?? articleA.summary ?? '').includes(item.excerpt));
  const evidenceB = asList(analysisB.supportingEvidence).filter((item) => typeof item.excerpt === 'string' && (articleB.content ?? articleB.summary ?? '').includes(item.excerpt));
  const headlineA = articleA.headline;
  const headlineB = articleB.headline;
  const match = compareArticlesForEvent(
    { headline: headlineA, content: articleA.content, summary: articleA.summary, publishedAt: articleA.publishedAt, entities: entitiesA, topics: topicsA },
    { headline: headlineB, content: articleB.content, summary: articleB.summary, publishedAt: articleB.publishedAt, entities: entitiesB, topics: topicsB },
  );
  const framingContrast = frameKeys.map((frame) => ({
    frame,
    articleA: Number(frameScoresA[frame] ?? 0),
    articleB: Number(frameScoresB[frame] ?? 0),
    difference: Number((Number(frameScoresA[frame] ?? 0) - Number(frameScoresB[frame] ?? 0)).toFixed(3)),
    evidenceA: evidenceA.filter((item) => keyOf(item.frame ?? '').replace(/[^a-z]/g, '').includes(frame.toLocaleLowerCase().replace(/[^a-z]/g, ''))).map((item) => item.excerpt),
    evidenceB: evidenceB.filter((item) => keyOf(item.frame ?? '').replace(/[^a-z]/g, '').includes(frame.toLocaleLowerCase().replace(/[^a-z]/g, ''))).map((item) => item.excerpt),
  }));
  const uniqueEntitiesA = entityNamesA.filter((name) => !keysB.has(keyOf(name)));
  const uniqueEntitiesB = entityNamesB.filter((name) => !keysA.has(keyOf(name)));
  const sharedEntities = entityNamesA.filter((name) => keysB.has(keyOf(name))).map((name) => ({
    name,
    typeA: entityMapA.get(keyOf(name))?.type ?? 'UNKNOWN',
    typeB: entityMapB.get(keyOf(name))?.type ?? 'UNKNOWN',
    mentionCountA: Number(entityMapA.get(keyOf(name))?.mentionCount ?? 0),
    mentionCountB: Number(entityMapB.get(keyOf(name))?.mentionCount ?? 0),
  }));
  const headlineComparison = {
    articleA: { headline: headlineA, sourceName: articleA.source?.name ?? 'Unknown source', sentiment: analysisA.headlineSentiment, sensationalism: analysisA.headlineSensationalism, evidence: headlineA },
    articleB: { headline: headlineB, sourceName: articleB.source?.name ?? 'Unknown source', sentiment: analysisB.headlineSentiment, sensationalism: analysisB.headlineSensationalism, evidence: headlineB },
  };
  const quoteComparison = {
    shared: quotesA.filter((quote) => quoteKeysB.has(keyOf(`${quote.speaker ?? ''}:${quote.quote}`))),
    uniqueArticleA: quotesA.filter((quote) => !quoteKeysB.has(keyOf(`${quote.speaker ?? ''}:${quote.quote}`))),
    uniqueArticleB: quotesB.filter((quote) => !quoteKeysA.has(keyOf(`${quote.speaker ?? ''}:${quote.quote}`))),
  };
  const keyDivergencePoints = [
    ...(uniqueEntitiesA.length ? [`${articleA.source?.name ?? 'Article A'} names entities absent from the other analyzed article.`] : []),
    ...(uniqueEntitiesB.length ? [`${articleB.source?.name ?? 'Article B'} names entities absent from the other analyzed article.`] : []),
    ...(quoteComparison.uniqueArticleA.length ? [`${articleA.source?.name ?? 'Article A'} contains attributed quote text not found in the other article.`] : []),
    ...(quoteComparison.uniqueArticleB.length ? [`${articleB.source?.name ?? 'Article B'} contains attributed quote text not found in the other article.`] : []),
    ...(headlineA !== headlineB ? ['The headlines use different wording; headline text is shown verbatim for review.'] : []),
  ];
  const evidence = [
    { articleId: articleA.id, sourceName: articleA.source?.name ?? 'Unknown source', kind: 'headline', excerpt: headlineA },
    { articleId: articleB.id, sourceName: articleB.source?.name ?? 'Unknown source', kind: 'headline', excerpt: headlineB },
    ...evidenceA.map((item) => ({ articleId: articleA.id, sourceName: articleA.source?.name ?? 'Unknown source', kind: 'framing', excerpt: item.excerpt, frame: item.frame })),
    ...evidenceB.map((item) => ({ articleId: articleB.id, sourceName: articleB.source?.name ?? 'Unknown source', kind: 'framing', excerpt: item.excerpt, frame: item.frame })),
    ...entitiesA.flatMap((item) => typeof item.evidence === 'string' && (articleA.content ?? articleA.summary ?? '').includes(item.evidence)
      ? [{ articleId: articleA.id, sourceName: articleA.source?.name ?? 'Unknown source', kind: 'entity', excerpt: item.evidence, entity: item.name }]
      : []),
    ...entitiesB.flatMap((item) => typeof item.evidence === 'string' && (articleB.content ?? articleB.summary ?? '').includes(item.evidence)
      ? [{ articleId: articleB.id, sourceName: articleB.source?.name ?? 'Unknown source', kind: 'entity', excerpt: item.evidence, entity: item.name }]
      : []),
    ...topicsA.flatMap((item) => {
      const term = typeof item.supportingText === 'string' ? item.supportingText.split(',')[0]?.trim() : '';
      const excerpt = term ? findExcerpt(articleA.content ?? articleA.summary ?? '', term) : null;
      return excerpt ? [{ articleId: articleA.id, sourceName: articleA.source?.name ?? 'Unknown source', kind: 'topic', excerpt, topic: item.topic }] : [];
    }),
    ...topicsB.flatMap((item) => {
      const term = typeof item.supportingText === 'string' ? item.supportingText.split(',')[0]?.trim() : '';
      const excerpt = term ? findExcerpt(articleB.content ?? articleB.summary ?? '', term) : null;
      return excerpt ? [{ articleId: articleB.id, sourceName: articleB.source?.name ?? 'Unknown source', kind: 'topic', excerpt, topic: item.topic }] : [];
    }),
    ...quotesA.map((quote) => ({ articleId: articleA.id, sourceName: articleA.source?.name ?? 'Unknown source', kind: 'quote', excerpt: quote.quote, speaker: quote.speaker })),
    ...quotesB.map((quote) => ({ articleId: articleB.id, sourceName: articleB.source?.name ?? 'Unknown source', kind: 'quote', excerpt: quote.quote, speaker: quote.speaker })),
  ];
  const payload = {
    eventId: event.id,
    eventTitle: event.title,
    eventDate: event.eventDate,
    articles: [
      { id: articleA.id, headline: headlineA, sourceName: articleA.source?.name ?? 'Unknown source', publishedAt: articleA.publishedAt },
      { id: articleB.id, headline: headlineB, sourceName: articleB.source?.name ?? 'Unknown source', publishedAt: articleB.publishedAt },
    ],
    headlineComparison,
    sharedEntities,
    uniqueEntities: { articleA: uniqueEntitiesA, articleB: uniqueEntitiesB },
    sharedTopics: topicNamesA.filter((topic) => topicKeysB.has(keyOf(topic))),
    uniqueTopics: {
      articleA: topicNamesA.filter((topic) => !topicKeysB.has(keyOf(topic))),
      articleB: topicNamesB.filter((topic) => !topicKeysA.has(keyOf(topic))),
    },
    quoteComparison,
    framingContrast,
    evidence,
    similarity: { score: match.score, method: 'token_overlap_composite', evidence: match },
    keyDivergencePoints,
    limitations: [
      'Entity and topic lists come from the rule-based article analysis and may be incomplete.',
      'Scores reflect lexical and structural overlap; they do not establish editorial intent or factual agreement.',
      'The system does not infer that a topic or fact was intentionally omitted from either article.',
      'Only quote text and evidence excerpts present verbatim in the corresponding stored article text are included.',
    ],
    metadata: { method: 'deterministic rule-based comparison', modelVersion: '1.0.0' },
  };
  const avgFrameDifference = framingContrast.reduce((sum, item) => sum + Math.abs(item.difference), 0) / framingContrast.length;
  const overlap = Number(Math.max(0, Math.min(1, match.score * 0.75 + (1 - avgFrameDifference) * 0.25)).toFixed(3));
  return { payload, framingContrast, quoteComparison, overlap, keyDivergencePoints };
};

const hydrateComparison = (row: any) => ({
  id: row.id,
  eventId: row.eventId,
  eventTitle: row.event?.title ?? 'Event comparison',
  eventDate: row.event?.eventDate ?? null,
  articles: [row.articleA, row.articleB].map((article: any) => ({
    id: article.id,
    headline: article.headline,
    sourceName: article.source?.name ?? 'Unknown source',
    publishedAt: article.publishedAt,
  })),
  headlineComparison: row.headlineComparison,
  framingContrast: row.framingContrast,
  quoteComparison: row.quoteComparison,
  ...(row.comparisonDetails as object ?? {}),
  coverageOverlap: row.coverageOverlap,
  keyDivergencePoints: row.keyDivergencePoints,
  synthesisSummary: row.synthesisSummary,
});

export const comparisonGenerationService = {
  compareEvent: async (eventId: string, requestedIds?: string[], userId?: string) => {
    const event = await prisma.newsEvent.findUnique({
      where: { id: eventId },
      include: { articles: { include: { source: true, analyses: { orderBy: { createdAt: 'desc' }, take: 1 } }, orderBy: { publishedAt: 'desc' } } },
    });
    if (!event) throw new AppError('News event not found.', 404);
    const articles = requestedIds?.length
      ? event.articles.filter((article) => requestedIds.includes(article.id))
      : event.articles;
    if (requestedIds?.length && articles.length !== new Set(requestedIds).size) {
      throw new AppError('One or more requested articles do not belong to this event.', 422);
    }
    if (articles.length < 2) throw new AppError('At least two event articles are required for comparison.', 409);

    const pairs: Array<[any, any]> = [];
    for (let left = 0; left < articles.length; left += 1) {
      for (let right = left + 1; right < articles.length; right += 1) {
        if (articles[left].sourceId !== articles[right].sourceId) pairs.push([articles[left], articles[right]]);
      }
    }
    if (!pairs.length) throw new AppError('This event needs articles from at least two distinct sources.', 409);

    const analyses = new Map<string, any>();
    for (const article of articles) analyses.set(article.id, await ensureAnalysis(article));
    if (userId) {
      for (const article of articles) {
        const priorHistory = await prisma.analysisHistory.findFirst({
          where: { userId, articleId: article.id, comparisonId: null },
          select: { id: true },
        });
        if (!priorHistory) await prisma.analysisHistory.create({ data: { userId, articleId: article.id } });
      }
    }

    const comparisons = [];
    for (const [first, second] of pairs) {
      const [articleA, articleB] = first.id.localeCompare(second.id) <= 0 ? [first, second] : [second, first];
      const generated = comparisonPayload(event, articleA, analyses.get(articleA.id), articleB, analyses.get(articleB.id));
      const row = await prisma.articleComparison.upsert({
        where: { articleAId_articleBId: { articleAId: articleA.id, articleBId: articleB.id } },
        create: {
          eventId: event.id,
          articleAId: articleA.id,
          articleBId: articleB.id,
          ...(userId ? { userId } : {}),
          headlineComparison: generated.payload.headlineComparison as any,
          framingContrast: generated.framingContrast as any,
          quoteComparison: generated.quoteComparison as any,
          comparisonDetails: {
            articles: generated.payload.articles,
            sharedEntities: generated.payload.sharedEntities,
            uniqueEntities: generated.payload.uniqueEntities,
            sharedTopics: generated.payload.sharedTopics,
            uniqueTopics: generated.payload.uniqueTopics,
            evidence: generated.payload.evidence,
            similarity: generated.payload.similarity,
            limitations: generated.payload.limitations,
            metadata: generated.payload.metadata,
          } as any,
          coverageOverlap: generated.overlap,
          keyDivergencePoints: generated.keyDivergencePoints as any,
          synthesisSummary: `Rule-based comparison of ${articleA.source?.name ?? 'one source'} and ${articleB.source?.name ?? 'another source'}; inspect the linked excerpts and indicators.`,
        },
        update: {
          eventId: event.id,
          headlineComparison: generated.payload.headlineComparison as any,
          framingContrast: generated.framingContrast as any,
          quoteComparison: generated.quoteComparison as any,
          comparisonDetails: {
            articles: generated.payload.articles,
            sharedEntities: generated.payload.sharedEntities,
            uniqueEntities: generated.payload.uniqueEntities,
            sharedTopics: generated.payload.sharedTopics,
            uniqueTopics: generated.payload.uniqueTopics,
            evidence: generated.payload.evidence,
            similarity: generated.payload.similarity,
            limitations: generated.payload.limitations,
            metadata: generated.payload.metadata,
          } as any,
          coverageOverlap: generated.overlap,
          keyDivergencePoints: generated.keyDivergencePoints as any,
          synthesisSummary: `Rule-based comparison of ${articleA.source?.name ?? 'one source'} and ${articleB.source?.name ?? 'another source'}; inspect the linked excerpts and indicators.`,
        },
        include: { articleA: { include: { source: true } }, articleB: { include: { source: true } }, event: true },
      });
      if (userId) {
        const priorHistory = await prisma.analysisHistory.findFirst({
          where: { userId, comparisonId: row.id },
          select: { id: true },
        });
        if (!priorHistory) await prisma.analysisHistory.create({ data: { userId, comparisonId: row.id } });
      }
      comparisons.push(hydrateComparison(row));
    }
    return { eventId: event.id, eventTitle: event.title, eventDate: event.eventDate, comparisons };
  },
};
