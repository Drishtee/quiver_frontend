/**
 * Identify the current screen by matching visible DOM content
 * against known screen patterns. Returns a short route identifier.
 */
const SCREEN_PATTERNS: [string, RegExp][] = [
  ['otp',              /verify\s+mobile|otp\s+verif/i],
  ['business-model',   /business\s+model\s+confirm/i],
  ['consent',          /section\s*a|understanding\s+quiver|quiver को समझें/i],
  ['profile',          /section\s*b|entrepreneur\s+profile|उद्यमी की जानकारी/i],
  ['enterprise',       /section\s*c|enterprise\s+details|व्यवसाय की जानकारी/i],
  ['questionnaire',    /section\s*[d-g]|business\s+questionnaire|प्रश्नावली/i],
  ['equity',           /section\s*h|equity\s+partnership|इक्विटी/i],
  ['review',           /section\s*i|final\s+confirm|अंतिम पुष्टि/i],
  ['success',          /congratulations|success|सफल/i],
  ['voice-onboarding', /voice\s+onboarding/i],
  ['ai-pathway',       /ai\s+growth\s+pathway/i],
  ['schedule',         /schedule\s+meeting/i],
  ['video-meeting',    /google\s+meet|video\s+meeting/i],
  ['admin',            /admin\s+dashboard/i],
  ['dashboard',        /dashboard/i],
  ['login',            /login|sign\s+in|welcome\s+back/i],
  ['landing',          /we\s+grow\s+your\s+business|quiver/i],
];

export function detectRoute(): string {
  // URL path takes priority (works for /admin, /dashboard, /login)
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
  if (path === 'admin' || path === 'dashboard' || path === 'login') return path;

  // Scan visible headings for known screen keywords
  const headings = Array.from(document.querySelectorAll('h1, h2, h3'));
  const blob = headings.map((h) => h.textContent ?? '').join(' ');

  for (const [name, re] of SCREEN_PATTERNS) {
    if (re.test(blob)) return name;
  }

  return path || 'unknown';
}

/**
 * Find the nearest short heading above or near a viewport point.
 * Ignores very long text (hero slogans) to prefer section titles.
 */
export function detectSection(clientX: number, clientY: number): string {
  const els = Array.from(
    document.querySelectorAll('h1, h2, h3, h4, legend, [data-section]')
  );

  let best: { text: string; dist: number } | null = null;

  for (const el of els) {
    const text = el.textContent?.trim();
    if (!text || text.length > 80) continue;          // skip hero-length blobs
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue; // hidden
    const cy = rect.top + rect.height / 2;
    if (cy > clientY + 200) continue;                 // well below click

    const dist =
      Math.abs(clientY - cy) +
      Math.abs(clientX - (rect.left + rect.width / 2)) * 0.25;

    if (!best || dist < best.dist) best = { text, dist };
  }

  return best?.text ?? '';
}
