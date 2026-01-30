import { WEBHOOK_URL } from './constants';
import type { FeedbackNote } from './types';

export async function sendWebhook(note: FeedbackNote): Promise<boolean> {
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'quiver-feedback',
        comment: note.text,
        route: note.route,
        section: note.section,
        coordinates: { xPx: note.xPx, yPx: note.yPx },
        timestamp: note.timestamp,
        feedbackId: note.id,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
