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
        page: note.page,
        section: note.section,
        coordinates: { xPercent: note.xPercent, yPercent: note.yPercent },
        timestamp: note.timestamp,
        feedbackId: note.id,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
