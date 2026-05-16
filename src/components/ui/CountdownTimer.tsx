/** Muestra el tiempo restante hasta el cierre de un grupo en formato DD:HH:MM:SS. */

import { useCountdown } from '../../hooks/useCountdown';

interface CountdownTimerProps {
  expiresAt: string;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export default function CountdownTimer({ expiresAt }: CountdownTimerProps) {
  const { days, hours, minutes, seconds, expired } = useCountdown(expiresAt);

  if (expired) {
    return (
      <span className="font-display text-sm font-semibold text-status-cancelled">
        Finalizado
      </span>
    );
  }

  return (
    <span className="font-display text-sm font-semibold text-ink tabular-nums">
      {pad(days)}:{pad(hours)}:{pad(minutes)}:{pad(seconds)}
    </span>
  );
}
