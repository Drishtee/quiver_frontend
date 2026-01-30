import { STORAGE_KEY } from './constants';
import type { FeedbackNote } from './types';

export function loadNotes(): FeedbackNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as FeedbackNote[];
  } catch {
    return [];
  }
}

export function saveNotes(notes: FeedbackNote[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}
