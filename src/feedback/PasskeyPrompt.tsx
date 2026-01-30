import React, { useState, useRef, useEffect } from 'react';
import { Z, PASSKEY } from './constants';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export function PasskeyPrompt({ onSuccess, onCancel }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() === PASSKEY) {
      onSuccess();
    } else {
      setError(true);
      setValue('');
    }
  };

  return (
    <>
      <div
        onClick={onCancel}
        style={{ position: 'fixed', inset: 0, zIndex: Z.passkey - 1, background: 'rgba(0,0,0,0.4)' }}
      />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: Z.passkey,
          width: 300,
          background: '#fff',
          borderRadius: 10,
          boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
          padding: 20,
        }}
      >
        <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: '#111' }}>
          Enter Passkey
        </h3>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#6b7280' }}>
          A passkey is required to leave feedback.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="password"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(false); }}
            placeholder="Passkey"
            style={{
              width: '100%',
              padding: '8px 10px',
              fontSize: 14,
              border: `1px solid ${error ? '#ef4444' : '#d1d5db'}`,
              borderRadius: 6,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {error && (
            <p style={{ margin: '4px 0 0', fontSize: 11, color: '#ef4444' }}>
              Wrong passkey.
            </p>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '5px 12px', fontSize: 13, border: '1px solid #d1d5db',
                borderRadius: 6, background: '#fff', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!value.trim()}
              style={{
                padding: '5px 12px', fontSize: 13, border: 'none', borderRadius: 6,
                background: value.trim() ? '#eab308' : '#fde68a', color: '#422006',
                cursor: value.trim() ? 'pointer' : 'default', fontWeight: 600,
              }}
            >
              Unlock
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
