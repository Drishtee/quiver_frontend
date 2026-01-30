/**
 * Detect the current page screen by scanning DOM headings.
 * The app uses state-based routing so pathname is unreliable.
 */
export function detectPage(): string {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
  if (path && path !== '') return path;

  const h1 = document.querySelector('h1')?.textContent?.trim();
  if (h1) return h1;

  return document.title || 'unknown';
}

/**
 * Find the nearest heading/label above (or at) the given viewport point.
 */
export function detectSection(clientX: number, clientY: number): string {
  const els = Array.from(document.querySelectorAll('h1, h2, h3, h4, legend, label'));
  let best: { text: string; dist: number } | null = null;

  for (const el of els) {
    const rect = el.getBoundingClientRect();
    const cy = rect.top + rect.height / 2;
    if (cy > clientY + 150) continue;
    const dist = Math.abs(clientY - cy) + Math.abs(clientX - (rect.left + rect.width / 2)) * 0.3;
    const text = el.textContent?.trim();
    if (!text) continue;
    if (!best || dist < best.dist) best = { text, dist };
  }

  return best?.text ?? '';
}
