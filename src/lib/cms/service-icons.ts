import { fetchFromCms } from './client';
import type { ApiPortfolio } from './adapters/api-types';

interface ApiServiceCategories {
  categories?: Array<{ id: number; slug?: string | null; icon?: string | null; services?: Array<{ id: number; slug?: string | null; icon?: string | null }> | null }> | null;
}

const clean = (value: string | null | undefined) => (typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined);

/**
 * GET /pages/portfolio sends each project's service as `{ id, title, slug }`, without its icon, so the filter tabs would
 * all show the bundled stand-in icon. The icons are in GET /service-categories (every category with its services), so
 * they are read from there and put on the projects' `service`:
 *   1. the service's own icon, 2. else the icon of the category it belongs to, 3. else nothing (the tab keeps the
 *      stand-in icon of the template).
 * A service that already carries an `icon` in the page payload is left as sent. A failed request changes nothing.
 */
export async function fillServiceIcons(api: ApiPortfolio): Promise<void> {
  const projects = api.sections?.portfolio?.portfolios ?? [];
  const missing = projects.filter((project) => project.service && !clean(project.service.icon));
  if (missing.length === 0) return;

  const data = await fetchFromCms<ApiServiceCategories>('service-categories');
  const byId = new Map<number, string>();
  const bySlug = new Map<string, string>();
  for (const category of data?.categories ?? []) {
    for (const service of category.services ?? []) {
      const icon = clean(service.icon) ?? clean(category.icon);
      if (!icon) continue;
      byId.set(service.id, icon);
      if (service.slug) bySlug.set(service.slug, icon);
    }
  }

  for (const project of missing) {
    const service = project.service;
    if (!service) continue;
    const icon = byId.get(service.id) ?? (service.slug ? bySlug.get(service.slug) : undefined);
    if (icon) service.icon = icon;
  }
}
