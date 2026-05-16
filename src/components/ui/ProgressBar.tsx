/** Barra de progreso animada con color semántico según el porcentaje alcanzado. */

interface ProgressBarProps {
  percent: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

function barColor(percent: number): string {
  if (percent >= 100) return 'bg-status-confirmed';
  if (percent >= 90) return 'bg-status-urgent';
  return 'bg-brand-teal';
}

export default function ProgressBar({ percent, showLabel = false, size = 'md' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const trackHeight = size === 'sm' ? 'h-1.5' : 'h-2.5';

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-ink-muted font-body">Progreso</span>
          <span className="text-xs font-semibold font-display text-ink">{clamped}%</span>
        </div>
      )}
      <div className={`w-full ${trackHeight} bg-ink-faint/50 rounded-full overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor(clamped)}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
