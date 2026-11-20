import { cmsConfig } from '@/config/cms';

/** Cache tag attached to every CMS request; POST /api/revalidate purges it. */
export const CMS_TAG = 'cms';

/** The admin panel wraps every payload as { success, data }; anything else is returned as it is. */
function unwrap<T>(body: unknown): T | null {
  if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
    const envelope = body as { success: unknown; data: unknown };
    return envelope.success === false ? null : (envelope.data as T);
  }
  return body as T;
}

/**
 * GET {CMS_API_URL}/{path} and parse the JSON body.
 * Returns null when no CMS is configured or the request fails.
 */
export async function fetchFromCms<T>(path: string, tags: string[] = []): Promise<T | null> {
  if (!cmsConfig.apiUrl) return null;

  const url = `${cmsConfig.apiUrl}/${path.replace(/^\/+/, '')}`;
  // The admin server can be slow: never wait forever, and retry up to twice before giving up.
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          ...(cmsConfig.apiToken ? { Authorization: `Bearer ${cmsConfig.apiToken}` } : {}),
        },
        next: { revalidate: cmsConfig.revalidateSeconds, tags: [CMS_TAG, ...tags] },
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) {
        if (response.status === 404) return null;
        console.error(`[cms] ${url} responded ${response.status}`);
        if (response.status < 500) return null;
        continue; // 5xx: retry
      }
      return unwrap<T>(await response.json());
    } catch (error) {
      console.error(`[cms] could not reach ${url} (attempt ${attempt})`, error);
    }
  }
  return null;
}

/**
 * Like fetchFromCms, but for content the page cannot render without: when the admin panel is configured and the
 * request fails, this THROWS instead of returning null. There is deliberately no bundled fallback content: Next.js
 * then keeps serving the last successfully generated page (or shows its error page) rather than dummy data.
 * Returns null only when no CMS is configured (local demo mode, content/ is used).
 */
export async function requireFromCms<T>(path: string, tags: string[] = []): Promise<T | null> {
  if (!cmsConfig.apiUrl) return null;
  const data = await fetchFromCms<T>(path, tags);
  if (data === null || data === undefined) throw new Error(`[cms] "${path}" could not be loaded from ${cmsConfig.apiUrl}`);
  return data;
}