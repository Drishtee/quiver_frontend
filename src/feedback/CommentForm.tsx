import React, { useState, useRef, useEffect } from 'react';
import { Z } from './constants';

interface Props {
  xPercent: number;
  yPercent: number;
  section: string;
  onSubmit: (text: string) => void;
  onCancel: () => void;
}

export function CommentForm({ xPercent, yPercent, section, onSubmit, onCancel }: Props) {
  const [text, setText] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { ref.current?.focus(); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (trimmed) onSubmit(trimmed);
  };

  const left = Math.min(xPercent, 65);
  const top = Math.min(yPercent, 55);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        left: `${left}%`,
        top: `${top}%`,
        zIndex: Z.form,
        width: 280,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: '#fef9c3',
          border: '1px solid #eab308',
          borderRadius: 8,
          boxShadow: '2px 3px 12px rgba(0,0,0,0.15)',
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {section && (
          <div style={{ fontSize: 11, color: '#92400e', fontWeight: 500 }}>
            {section}
          </div>
        )}
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 500))}
          placeholder="Leave your feedback..."
          rows={3}
          style={{
            width: '100%',
            border: '1px solid #eab308',
            borderRadius: 4,
            padding: 8,
            fontSize: 13,
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'inherit',
            background: '#fffef5',
            boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: '#a16207' }}>{text.length}/500</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '4px 10px', fontSize: 12, border: '1px solid #d1d5db',
                borderRadius: 4, background: '#fff', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!text.trim()}
              style={{
                padding: '4px 10px', fontSize: 12, border: 'none', borderRadius: 4,
                background: text.trim() ? '#eab308' : '#fde68a', color: '#422006',
                cursor: text.trim() ? 'pointer' : 'default', fontWeight: 600,
              }}
            >
              Post Note
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
