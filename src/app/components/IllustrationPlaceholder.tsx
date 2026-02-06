/**
 * IllustrationPlaceholder - Placeholder component for planned illustrations.
 * Replace each instance with the actual SVG/PNG illustration once available.
 *
 * See GRAPHIC_DESIGN_SPEC.md for full details on each illustration.
 */

interface IllustrationPlaceholderProps {
  id: string;
  label: string;
  width?: string;
  height?: string;
  className?: string;
}

export function IllustrationPlaceholder({
  id,
  label,
  width = '100%',
  height = '120px',
  className = '',
}: IllustrationPlaceholderProps) {
  // In production, replace this entire component with actual <img> tags pointing to SVGs
  // The id corresponds to GFX-XXX-NNN codes in GRAPHIC_DESIGN_SPEC.md
  return (
    <div
      data-illustration-id={id}
      className={`flex items-center justify-center rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 ${className}`}
      style={{ width, height }}
      aria-label={label}
    >
      <div className="text-center px-3">
        <div className="text-xs font-medium text-primary/40 uppercase tracking-wider">{id}</div>
        <div className="text-xs text-primary/30 mt-0.5">{label}</div>
      </div>
    </div>
  );
}
