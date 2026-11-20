import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { cache } from 'react';
import { cmsConfig } from '@/config/cms';
import { CMS_TAG } from '@/lib/cms/client';
import { MAX_SVG_BYTES, sanitizeSvg } from '@/lib/utils/svg';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

/** SVG text for an icon address: a file of /public, or a file served by the admin panel (same origin only). */
async function readSvg(src: string): Promise<string | null> {
  try {
    if (src.startsWith('/') && !src.startsWith('//')) {
      const file = path.normalize(path.join(PUBLIC_DIR, src.split('?')[0]));
      if (!file.startsWith(PUBLIC_DIR + path.sep)) return null; // no path traversal
      return await readFile(file, 'utf8');
    }
    // Only fetch from the admin panel's own host, so an icon value can never make the server call another site.
    const url = new URL(src.startsWith('//') ? `https:${src}` : src);
    if (!cmsConfig.apiUrl || url.origin !== new URL(cmsConfig.apiUrl).origin) return null;
    const response = await fetch(url, {
      next: { revalidate: cmsConfig.revalidateSeconds, tags: [CMS_TAG] },
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return null;
    const text = await response.text();
    return text.length > MAX_SVG_BYTES ? null : text;
  } catch {
    return null;
  }
}

const load = cache(async (src: string) => {
  try {
    const raw = await readSvg(src);
    return raw ? await sanitizeSvg(raw, `i${createHash('md5').update(src).digest('hex').slice(0, 6)}`) : null;
  } catch (error) {
    // Never let one icon break the page: the caller falls back to a plain <img>.
    console.error(`[svg] could not inline ${src}`, error);
    return null;
  }
});

/**
 * An SVG uploaded in the admin panel, inlined as a real <svg> so CSS can change its lines and fills (hover, theme).
 * The wrapper is `display: contents`, so it adds no box: `.slot svg path { stroke… }` and `.slot:hover svg path { … }`
 * apply to it exactly as they do to the bundled inline icons. If the file cannot be read or is not a valid SVG,
 * it falls back to a plain <img>, so the icon still shows (just without hover colours).
 */
export async function CmsSvg({ src }: { src: string }) {
  const markup = await load(src);
  if (!markup) return <img className="cms-icon" src={src} alt="" />;
  return <span className="cms-svg" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: markup }} />;
}