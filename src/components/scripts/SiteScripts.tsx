'use client';

import { useEffect } from 'react';
import { SCRIPTS, withVersion } from './script-list';

/**
 * Browser scripts (jQuery, Bootstrap, slick, lazy loading, popups), loaded once and strictly in this
 * order. The files under /scripts are served from public/scripts.
 */


/**
 * Bump this whenever a file in public/scripts changes. Local scripts keep stable names and used to be cached for a
 * day, so browsers kept running an old copy (e.g. the one that reloaded the page on every portfolio filter click).
 */


function loadScript(src: string): Promise<void> {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = withVersion(src);
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => {
      console.error(`[SiteScripts] failed to load ${script.src}`);
      resolve(); // one blocked CDN must not stop the rest of the page
    };
    document.body.appendChild(script);
  });
}

// Module-level singleton: load exactly once, strictly in order (also under StrictMode double effects).
let loading: Promise<void> | null = null;

function loadAllInOrder(): Promise<void> {
  loading ??= (async () => {
    for (const src of SCRIPTS) await loadScript(src);
  })();
  return loading;
}

/**
 * Fallback for `<img class="lazy" data-src="...">`. The jQuery Lazy plugin normally fills in `src`,
 * but it depends on several CDN scripts loading first. If any of them is blocked or slow, images
 * would stay blank, so this also promotes `data-src` -> `src` natively as images near the viewport.
 */
function setupLazyImageFallback(): () => void {
  const promote = (img: HTMLImageElement) => {
    const src = img.getAttribute('data-src');
    if (src && img.getAttribute('src') !== src) img.setAttribute('src', src);
  };
  const pending = () => Array.from(document.querySelectorAll<HTMLImageElement>('img[data-src]'));

  if (typeof IntersectionObserver === 'undefined') {
    pending().forEach(promote);
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        promote(entry.target as HTMLImageElement);
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '1500px 0px' },
  );
  pending().forEach((img) => observer.observe(img));

  // Carousels (slick) clone slides after load; watch for images added later.
  const mutations = new MutationObserver(() => {
    pending().forEach((img) => observer.observe(img));
  });
  mutations.observe(document.body, { childList: true, subtree: true });

  return () => {
    mutations.disconnect();
    observer.disconnect();
  };
}

/**
 * Slick measures its slides once, when it starts. With API content the page is often still settling at that moment
 * (fonts, images, scrollbar), so slides could end up too narrow. Re-measure after the page has loaded and on resize.
 */
function setupSliderRemeasure(): () => void {
  type SlickJq = ((selector: string) => { filter: (s: string) => { slick: (method: string) => void } }) | undefined;
  const remeasure = () => {
    const $ = (window as unknown as { jQuery?: SlickJq }).jQuery;
    try {
      $?.('.blog-slider').filter('.slick-initialized').slick('setPosition');
    } catch {
      /* slick not ready yet */
    }
  };
  const timers = [300, 1000, 2500].map((ms) => window.setTimeout(remeasure, ms));
  window.addEventListener('load', remeasure);
  window.addEventListener('resize', remeasure);
  void loadAllInOrder().then(remeasure);
  return () => {
    timers.forEach((t) => window.clearTimeout(t));
    window.removeEventListener('load', remeasure);
    window.removeEventListener('resize', remeasure);
  };
}

export function SiteScripts() {
  useEffect(() => {
    void loadAllInOrder();
    const stopLazy = setupLazyImageFallback();
    const stopSlider = setupSliderRemeasure();
    return () => {
      stopLazy();
      stopSlider();
    };
  }, []);
  return null;
}