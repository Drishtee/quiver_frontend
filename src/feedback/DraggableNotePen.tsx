import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Z } from './constants';

interface Props {
  onDrop: (xPercent: number, yPercent: number) => void;
}

const PEN_SIZE = 44;
const REST_BOTTOM = 24;
const REST_LEFT = 24;

export function DraggableNotePen({ onDrop }: Props) {
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    offsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setDragging(true);
    setPos({ x: rect.left, y: rect.top });
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      setPos({
        x: e.clientX - offsetRef.current.x,
        y: e.clientY - offsetRef.current.y,
      });
    },
    [dragging]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      setDragging(false);

      // Calculate where the center of the pen was dropped
      const cx = e.clientX - offsetRef.current.x + PEN_SIZE / 2;
      const cy = e.clientY - offsetRef.current.y + PEN_SIZE / 2;

      // Ignore if dropped back near the rest position
      const restX = REST_LEFT + PEN_SIZE / 2;
      const restY = window.innerHeight - REST_BOTTOM - PEN_SIZE / 2;
      const dist = Math.sqrt((cx - restX) ** 2 + (cy - restY) ** 2);
      if (dist < 60) {
        setPos(null);
        return;
      }

      const xPercent = (cx / window.innerWidth) * 100;
      const yPercent = (cy / window.innerHeight) * 100;
      setPos(null);
      onDrop(xPercent, yPercent);
    },
    [dragging, onDrop]
  );

  // When not dragging, Escape cancels
  useEffect(() => {
    if (!dragging) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDragging(false);
        setPos(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dragging]);

  const style: React.CSSProperties = dragging && pos
    ? {
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        zIndex: Z.pen,
        width: PEN_SIZE,
        height: PEN_SIZE,
        cursor: 'grabbing',
        touchAction: 'none',
      }
    : {
        position: 'fixed',
        bottom: REST_BOTTOM,
        left: REST_LEFT,
        zIndex: Z.pen,
        width: PEN_SIZE,
        height: PEN_SIZE,
        cursor: 'grab',
        touchAction: 'none',
      };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={style}
    >
      <div
        style={{
          width: PEN_SIZE,
          height: PEN_SIZE,
          borderRadius: '50%',
          background: '#fef08a',
          border: '2px solid #eab308',
          boxShadow: dragging
            ? '0 6px 20px rgba(0,0,0,0.25)'
            : '0 2px 8px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: dragging ? 'none' : 'box-shadow 0.15s',
          userSelect: 'none',
        }}
      >
        {/* Pen/note icon */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      </div>
      {!dragging && (
        <div
          style={{
            position: 'absolute',
            top: -6,
            right: -6,
            background: '#3b82f6',
            color: '#fff',
            fontSize: 9,
            fontWeight: 700,
            borderRadius: 4,
            padding: '1px 4px',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          Drag me
        </div>
      )}
    </div>
  );
}
