import React, { useState, useCallback, useEffect } from 'react';
import type { FeedbackNote } from './types';
import { loadNotes, saveNotes } from './storage';
import { sendWebhook } from './webhook';
import { detectPage, detectSection } from './detectSection';
import { DraggableNotePen } from './DraggableNotePen';
import { PasskeyPrompt } from './PasskeyPrompt';
import { CommentForm } from './CommentForm';
import { StickyNote } from './StickyNote';

const ENABLED = import.meta.env.VITE_FEEDBACK_ENABLED === 'true';

/*
  Flow:
  1. User drags the pen icon and drops it somewhere on the page.
  2. Passkey prompt appears.  Correct passkey → proceed.  Wrong → stays locked.
  3. Comment form appears at the drop location.
  4. User writes a comment and submits.
  5. A sticky note is placed there (visible to this browser), and the webhook fires.
*/

type Stage =
  | { step: 'idle' }
  | { step: 'passkey'; xPercent: number; yPercent: number; section: string; page: string }
  | { step: 'comment'; xPercent: number; yPercent: number; section: string; page: string };

export function FeedbackRoot() {
  if (!ENABLED) return null;

  return <FeedbackInner />;
}

function FeedbackInner() {
  const [notes, setNotes] = useState<FeedbackNote[]>(() => loadNotes());
  const [stage, setStage] = useState<Stage>({ step: 'idle' });

  // Persist on change
  useEffect(() => { saveNotes(notes); }, [notes]);

  // Pen dropped — start passkey flow
  const handleDrop = useCallback((xPercent: number, yPercent: number) => {
    const page = detectPage();
    const clientX = (xPercent / 100) * window.innerWidth;
    const clientY = (yPercent / 100) * window.innerHeight;
    const section = detectSection(clientX, clientY);
    setStage({ step: 'passkey', xPercent, yPercent, section, page });
  }, []);

  const handlePasskeySuccess = () => {
    if (stage.step !== 'passkey') return;
    setStage({ ...stage, step: 'comment' });
  };

  const handleCancel = () => setStage({ step: 'idle' });

  const handleComment = (text: string) => {
    if (stage.step !== 'comment') return;

    const note: FeedbackNote = {
      id: crypto.randomUUID(),
      text,
      page: stage.page,
      section: stage.section,
      xPercent: stage.xPercent,
      yPercent: stage.yPercent,
      timestamp: new Date().toISOString(),
      webhookSent: false,
    };

    setNotes((prev) => [note, ...prev]);
    setStage({ step: 'idle' });

    // Fire-and-forget webhook
    sendWebhook(note).then((ok) => {
      setNotes((prev) => prev.map((n) => (n.id === note.id ? { ...n, webhookSent: ok } : n)));
    });
  };

  const handleDelete = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <>
      {/* Draggable pen — always visible when idle */}
      {stage.step === 'idle' && <DraggableNotePen onDrop={handleDrop} />}

      {/* Passkey prompt */}
      {stage.step === 'passkey' && (
        <PasskeyPrompt onSuccess={handlePasskeySuccess} onCancel={handleCancel} />
      )}

      {/* Comment form at drop location */}
      {stage.step === 'comment' && (
        <CommentForm
          xPercent={stage.xPercent}
          yPercent={stage.yPercent}
          section={stage.section}
          onSubmit={handleComment}
          onCancel={handleCancel}
        />
      )}

      {/* All placed sticky notes */}
      {notes.map((note) => (
        <StickyNote key={note.id} note={note} onDelete={handleDelete} />
      ))}
    </>
  );
}
