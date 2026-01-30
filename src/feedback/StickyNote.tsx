import React, { useState } from 'react';
import { Z } from './constants';
import type { FeedbackNote } from './types';

interface Props {
  note: FeedbackNote;
  onDelete: (id: string) => void;
}

export function StickyNote({ note, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        position: 'fixed',
        left: `${note.xPercent}%`,
        top: `${note.yPercent}%`,
        zIndex: Z.note,
        transform: 'translate(-50%, -50%)',
        maxWidth: expanded ? 240 : 32,
        transition: 'max-width 0.15s ease',
      }}
    >
      {/* Collapsed: small yellow square */}
      {!expanded && (
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
          {/* Close / Delete row */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginBottom: 4 }}>
            <button
              onClick={() => setExpanded(false)}
              title="Collapse"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                color: '#92400e',
                padding: 0,
                lineHeight: 1,
              }}
            >
              &minus;
            </button>
            <button
              onClick={() => onDelete(note.id)}
              title="Delete note"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                color: '#dc2626',
                padding: 0,
                lineHeight: 1,
              }}
            >
              &times;
            </button>
          </div>

          <div style={{ marginBottom: 6, wordBreak: 'break-word' }}>{note.text}</div>
          <div style={{ fontSize: 10, color: '#a16207' }}>
            {note.section && <div>{note.section}</div>}
            <div>{new Date(note.timestamp).toLocaleString()}</div>
            {!note.webhookSent && (
              <div style={{ color: '#dc2626', marginTop: 2 }}>Webhook failed</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
