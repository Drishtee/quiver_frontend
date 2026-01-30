import { PASSKEY } from './constants';
import type { FeedbackNote } from './types';

const BASE = import.meta.env.VITE_API_BASE_URL || '';

export async function fetchNotes(): Promise<FeedbackNote[]> {
  try {
    const res = await fetch(`${BASE}/feedback/notes/`);
    if (!res.ok) return [];
    const data = await res.json();
    return ((data.notes ?? []) as FeedbackNote[]).map((n) => ({
      ...n,
      webhookSent: n.webhookSent ?? true,
    }));
  } catch {
    return [];
  }
}

export async function createNote(
  note: Omit<FeedbackNote, 'id' | 'timestamp' | 'webhookSent'>
): Promise<FeedbackNote | null> {
  try {
    const res = await fetch(`${BASE}/feedback/notes/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Feedback-Passkey': PASSKEY,
      },
      body: JSON.stringify({
        text: note.text,
        route: note.route,
        section: note.section,
        xPx: note.xPx,
        yPx: note.yPx,
      }),
    });
    if (!res.ok) return null;
    return (await res.json()) as FeedbackNote;
  } catch {
    return null;
  }
}

export async function deleteNote(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/feedback/notes/${id}/`, {
      method: 'DELETE',
      headers: { 'X-Feedback-Passkey': PASSKEY },
    });
    return res.ok;
  } catch {
    return false;
  }
}
