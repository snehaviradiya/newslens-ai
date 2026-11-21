// URL & Text Sanitization Utilities for Article Ingestion

/**
 * Normalizes an article URL:
 * - Trims whitespace
 * - Strips trailing slashes (except root)
 * - Removes common tracking query parameters (utm_*, ref, source, fbclid, etc.)
 */
export function normalizeUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl.trim());
    
    // Normalize protocol to https if standard web
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      parsed.protocol = 'https:';
    }

    // Tracking query parameter keys to remove
    const trackingParams = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'utm_id',
      'fbclid',
      'gclid',
      '_ga',
      'ref',
      'source',
      'ocid',
    ];

    for (const param of trackingParams) {
      parsed.searchParams.delete(param);
    }

    // Strip trailing slash from pathname if not root
    if (parsed.pathname !== '/' && parsed.pathname.endsWith('/')) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }

    return parsed.toString();
  } catch {
    // If not a parseable URL, return trimmed original
    return rawUrl.trim();
  }
}

/**
 * Strips HTML tags, decodes common entities, and collapses excessive whitespace.
 */
export function cleanHtmlText(text?: string | null): string {
  if (!text) return '';

  return text
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes published dates safely with fallback to now.
 */
export function normalizePublishedDate(dateInput?: string | Date | null): Date {
  if (!dateInput) return new Date();

  const parsed = new Date(dateInput);
  if (isNaN(parsed.getTime())) {
    return new Date();
  }

  // Prevent dates far in the future
  const maxFuture = Date.now() + 24 * 60 * 60 * 1000;
  if (parsed.getTime() > maxFuture) {
    return new Date();
  }

  return parsed;
}
