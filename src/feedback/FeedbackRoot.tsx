import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { FeedbackNote } from './types';
import { fetchNotes, createNote, deleteNote } from './api';
import { sendWebhook } from './webhook';
import { detectRoute, detectSection } from './detectSection';
import { DraggableNotePen } from './DraggableNotePen';
import { PasskeyPrompt } from './PasskeyPrompt';
import { CommentForm } from './CommentForm';
import { StickyNote } from './StickyNote';

const ENABLED = import.meta.env.VITE_FEEDBACK_ENABLED === 'true';
const SESSION_KEY = 'quiver_feedback_unlocked';
const POLL_INTERVAL = 15_000; // refresh notes every 15 seconds

type Stage =
  | { step: 'idle' }
  | { step: 'passkey'; xPx: number; yPx: number; section: string; route: string }
  | { step: 'comment'; xPx: number; yPx: number; section: string; route: string };

export function FeedbackRoot() {
  if (!ENABLED) return null;
  return <FeedbackInner />;
}

function FeedbackInner() {
  const [notes, setNotes] = useState<FeedbackNote[]>([]);
  const [stage, setStage] = useState<Stage>({ step: 'idle' });
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === 'true'
  );
  const pollRef = useRef<ReturnType<typeof setInterval>>();
  const [currentRoute, setCurrentRoute] = useState(() => detectRoute());
  const lastPathRef = useRef(window.location.pathname);

  // Load notes from backend on mount + poll
  const loadNotes = useCallback(() => {
    fetchNotes().then(setNotes);
  }, []);

  useEffect(() => {
    loadNotes();
    pollRef.current = setInterval(loadNotes, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [loadNotes]);

  // Re-detect route on navigation and after DOM settles on refresh.
  // Always poll detectRoute() so heading-based detection picks up
  // headings that render after mount.
  useEffect(() => {
    const onPop = () => setCurrentRoute(detectRoute());
    window.addEventListener('popstate', onPop);

    const id = setInterval(() => {
      const detected = detectRoute();
      lastPathRef.current = window.location.pathname;
      setCurrentRoute((prev) => (prev !== detected ? detected : prev));
    }, 500);

    return () => {
      window.removeEventListener('popstate', onPop);
      clearInterval(id);
    };
  }, []);

  // Pen dropped
  const handleDrop = useCallback((xPx: number, yPx: number, clientX: number, clientY: number) => {
    const route = detectRoute();
    const section = detectSection(clientX, clientY);

    if (unlocked) {
      // Already authenticated this session — go straight to comment
      setStage({ step: 'comment', xPx, yPx, section, route });
    } else {
      setStage({ step: 'passkey', xPx, yPx, section, route });
    }
  }, [unlocked]);

  const handlePasskeySuccess = () => {
    if (stage.step !== 'passkey') return;
    setUnlocked(true);
    sessionStorage.setItem(SESSION_KEY, 'true');
    setStage({ ...stage, step: 'comment' });
  };

  const handleCancel = () => setStage({ step: 'idle' });

  const handleComment = async (text: string) => {
    if (stage.step !== 'comment') return;

    const saved = await createNote({
      text,
      route: stage.route,
      section: stage.section,
      xPx: stage.xPx,
      yPx: stage.yPx,
    });

    setStage({ step: 'idle' });

    if (saved) {
      setNotes((prev) => [saved, ...prev]);
      // Also fire the webhook notification
      sendWebhook({ ...saved, webhookSent: false }).catch(() => {});
    }
  };

  const handleDelete = useCallback(async (id: string) => {
    const ok = await deleteNote(id);
    if (ok) setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <>
      {stage.step === 'idle' && <DraggableNotePen onDrop={handleDrop} />}

      {stage.step === 'passkey' && (
        <PasskeyPrompt onSuccess={handlePasskeySuccess} onCancel={handleCancel} />
      )}

      {stage.step === 'comment' && (
        <CommentForm
          xPx={stage.xPx}
          yPx={stage.yPx}
          section={stage.section}
          onSubmit={handleComment}
          onCancel={handleCancel}
        />
      )}

      {notes.filter((n) => n.route === currentRoute).map((note) => (
        <StickyNote key={note.id} note={note} onDelete={handleDelete} canDelete={unlocked} />
      ))}
    </>
  );
}
