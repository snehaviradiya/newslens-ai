import { analysisService } from '../src/services/analysisService.js';

describe('AI engine HTTP client contract', () => {
  const originalFetch = global.fetch;

  afterEach(() => { global.fetch = originalFetch; });

  it("sends the engine's expected headline, content, and sourceName fields", async () => {
    const responseBody = { headline: 'Example policy report', modelVersion: '1.0.0' };
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => responseBody });
    global.fetch = fetchMock as any;

    await expect(analysisService.analyzeText('Example policy report', 'A sufficiently long article text.', 'Test Source'))
      .resolves.toEqual(responseBody);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/api\/v1\/analyze$/), expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ headline: 'Example policy report', content: 'A sufficiently long article text.', sourceName: 'Test Source' }),
    }));
  });

  it('maps network failures to a service-unavailable application error', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('connection refused')) as any;
    await expect(analysisService.analyzeText('Example policy report', 'A sufficiently long article text.'))
      .rejects.toMatchObject({ statusCode: 503 });
  });
});
