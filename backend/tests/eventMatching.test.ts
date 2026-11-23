import { compareArticlesForEvent } from '../src/services/eventMatching.js';

const baseTime = new Date('2026-11-24T08:00:00.000Z');

describe('deterministic article event matching', () => {
  it('matches differently worded coverage with overlapping text, entities, topics, and dates', () => {
    const left = {
      headline: 'Coastal city evacuates as Hurricane Iris makes landfall',
      content: 'Hurricane Iris made landfall near Bayport on Tuesday. Residents in coastal neighborhoods evacuated as emergency crews opened shelters.',
      publishedAt: baseTime,
    };
    const right = {
      headline: 'Hurricane Iris forces evacuation in Bayport coastal districts',
      content: 'After Hurricane Iris reached Bayport on Tuesday, emergency crews opened shelters and residents left coastal neighborhoods.',
      publishedAt: new Date(baseTime.getTime() + 3_600_000),
    };
    const result = compareArticlesForEvent(left, right);
    expect(result.matched).toBe(true);
    expect(result.sharedEntities).toContain('hurricane iris');
    expect(result.sharedTopics).toContain('climate');
    expect(result.explanation.length).toBeGreaterThan(0);
  });

  it('does not merge unrelated stories solely because the same person is named', () => {
    const left = {
      headline: 'Taylor Reed opens regional arts festival',
      content: 'Taylor Reed opened the annual arts festival, where local musicians performed in the city park.',
      entities: [{ name: 'Taylor Reed', type: 'PERSON' }],
      topics: [],
      publishedAt: baseTime,
    };
    const right = {
      headline: 'Taylor Reed announces new orbital research mission',
      content: 'Taylor Reed announced an orbital research mission focused on telescope instruments and deep space observations.',
      entities: [{ name: 'Taylor Reed', type: 'PERSON' }],
      topics: [],
      publishedAt: baseTime,
    };
    expect(compareArticlesForEvent(left, right).matched).toBe(false);
  });

  it('does not match articles outside the 72-hour window', () => {
    const left = { headline: 'Parliament approves water safety bill', content: 'Parliament approved a water safety bill after a long debate.', publishedAt: baseTime };
    const right = { ...left, publishedAt: new Date(baseTime.getTime() + 73 * 3_600_000) };
    expect(compareArticlesForEvent(left, right).matched).toBe(false);
  });

  it('honors an explicitly stricter threshold', () => {
    const article = { headline: 'Central bank reviews policy', content: 'The central bank reviewed its policy at a scheduled meeting.', publishedAt: baseTime };
    expect(compareArticlesForEvent(article, article, 1).matched).toBe(true);
    expect(compareArticlesForEvent(article, article, 1.01).matched).toBe(false);
  });
});
