import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Z } from './constants';
import type { FeedbackNote } from './types';

interface Props {
  note: FeedbackNote;
  onDelete: (id: string) => void;
  canDelete: boolean;
}

export function StickyNote({ note, onDelete, canDelete }: Props) {
  const [expanded, setExpanded] = useState(false);

  // Portal into document.body with position:fixed so notes
  // stay at the viewport position where they were placed.
  return createPortal(
    <div
      style={{
        position: 'fixed',
        left: note.xPx,
        top: note.yPx,
        zIndex: Z.note,
        transform: 'translate(-50%, -50%)',
        maxWidth: expanded ? 240 : 32,
        transition: 'max-width 0.15s ease',
        pointerEvents: 'auto',
      }}
    >
      {/* Collapsed: small yellow square with delete badge */}
      {!expanded && (
        <div style={{ position: 'relative', width: 28, height: 28 }}>
          <div
            onClick={() => setExpanded(true)}
            style={{
              width: 28,
              height: 28,
              background: '#fef08a',
              border: '1px solid #eab308',
              borderRadius: 4,
              cursor: 'pointer',
              boxShadow: '1px 2px 4px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
            }}
          >
            <span style={{ lineHeight: 1 }}>&#9998;</span>
          </div>
          {canDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
              title="Delete note"
              style={{
                position: 'absolute', top: -6, right: -6,
                width: 16, height: 16, borderRadius: '50%',
                background: '#475569', color: '#fff',
                border: 'none', cursor: 'pointer',
                fontSize: 11, lineHeight: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}
            >
              &times;
            </button>
          )}
        </div>
      )}

      {/* Expanded: sticky note card */}
      {expanded && (
        <div
          style={{
            background: '#fef9c3',
            border: '1px solid #eab308',
            borderRadius: 6,
            padding: 10,
            boxShadow: '2px 3px 8px rgba(0,0,0,0.15)',
            minWidth: 180,
            fontSize: 13,
            color: '#422006',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginBottom: 4 }}>
            <button
              onClick={() => setExpanded(false)}
              title="Collapse"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 14, color: '#92400e', padding: 0, lineHeight: 1,
              }}
            >
              &minus;
            </button>
            {canDelete && (
              <button
                onClick={() => onDelete(note.id)}
                title="Delete note"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 14, color: '#475569', padding: 0, lineHeight: 1,
                }}
              >
                &times;
              </button>
            )}
          </div>

          <div style={{ marginBottom: 6, wordBreak: 'break-word' }}>{note.text}</div>
          <div style={{ fontSize: 10, color: '#a16207' }}>
            <div style={{ fontWeight: 600 }}>{note.route}</div>
            {note.section && <div>{note.section}</div>}
            <div>{new Date(note.timestamp).toLocaleString()}</div>
            {!note.webhookSent && (
              <div style={{ color: '#D97706', marginTop: 2 }}>Webhook failed</div>
            )}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
