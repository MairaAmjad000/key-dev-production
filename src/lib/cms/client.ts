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
 * Returns null when no CMS is configured or the request fails, so callers can fall back to content/.
 */
export async function fetchFromCms<T>(path: string, tags: string[] = []): Promise<T | null> {
  if (!cmsConfig.apiUrl) return null;

  const url = `${cmsConfig.apiUrl}/${path.replace(/^\/+/, '')}`;
  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        ...(cmsConfig.apiToken ? { Authorization: `Bearer ${cmsConfig.apiToken}` } : {}),
      },
      next: { revalidate: cmsConfig.revalidateSeconds, tags: [CMS_TAG, ...tags] },
    });
    if (!response.ok) {
      if (response.status !== 404) console.error(`[cms] ${url} responded ${response.status}`);
      return null;
    }
    return unwrap<T>(await response.json());
  } catch (error) {
    console.error(`[cms] could not reach ${url}`, error);
    return null;
  }
}
