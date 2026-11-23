jest.mock('../src/utils/prisma.js', () => ({
  prisma: {
    newsArticle: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
    newsEvent: { create: jest.fn(), findUnique: jest.fn() },
    $transaction: jest.fn(),
  },
}));

import { prisma } from '../src/utils/prisma.js';
import { eventDetectionService } from '../src/services/eventDetectionService.js';

const prismaMock = prisma as any;
const publishedAt = new Date('2026-11-24T08:00:00.000Z');
let records: any[];

describe('event membership persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    records = [
      {
        id: 'article-a', headline: 'Coastal city evacuates as Hurricane Iris makes landfall',
        content: 'Hurricane Iris made landfall near Bayport on Tuesday. Residents evacuated as emergency crews opened shelters.',
        publishedAt, eventId: null, analyses: [],
      },
      {
        id: 'article-b', headline: 'Hurricane Iris forces evacuation in Bayport coastal districts',
        content: 'After Hurricane Iris reached Bayport on Tuesday, emergency crews opened shelters and residents left coastal neighborhoods.',
        publishedAt: new Date(publishedAt.getTime() + 3_600_000), eventId: null, analyses: [],
      },
    ];
    prismaMock.newsArticle.findUnique.mockImplementation(async ({ where }: any) => records.find((item) => item.id === where.id) ?? null);
    prismaMock.newsArticle.findMany.mockImplementation(async ({ where }: any) => records.filter((item) => item.id !== where?.id?.not));
    prismaMock.newsEvent.create.mockResolvedValue({ id: 'event-1' });
    prismaMock.newsArticle.updateMany.mockImplementation(async ({ where, data }: any) => {
      const record = records.find((item) => item.id === where.id);
      if (!record || record.eventId !== null) return { count: 0 };
      record.eventId = data.eventId;
      return { count: 1 };
    });
    prismaMock.$transaction.mockImplementation((callback: (tx: any) => unknown) => callback(prismaMock));
  });

  it('creates one event and assigns both matched articles', async () => {
    const result = await eventDetectionService.assignArticle('article-a');
    expect(result.matched).toBe(true);
    expect(result.eventId).toBe('event-1');
    expect(records.map((record) => record.eventId)).toEqual(['event-1', 'event-1']);
    expect(prismaMock.newsEvent.create).toHaveBeenCalledTimes(1);
  });

  it('does not create a duplicate event on repeated detection', async () => {
    records[0].eventId = 'existing-event';
    const result = await eventDetectionService.assignArticle('article-a');
    expect(result.alreadyAssigned).toBe(true);
    expect(result.eventId).toBe('existing-event');
    expect(prismaMock.newsEvent.create).not.toHaveBeenCalled();
  });
});
