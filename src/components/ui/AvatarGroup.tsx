/** Fila de avatares superpuestos con contador de excedente (+N). */

import Avatar from './Avatar';

interface AvatarGroupProps {
  users: Array<{ src?: string; alt: string }>;
  max?: number;
}

export default function AvatarGroup({ users, max = 5 }: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <div className="flex items-center">
      {visible.map((user, i) => (
        <div
          key={i}
          className="ring-2 ring-surface-card rounded-full"
          style={{ marginLeft: i === 0 ? 0 : '-8px', zIndex: visible.length - i }}
        >
          <Avatar src={user.src} alt={user.alt} size="sm" />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className="w-7 h-7 rounded-full bg-ink-faint/60 flex items-center justify-center ring-2 ring-surface-card text-xs font-semibold font-display text-ink-muted"
          style={{ marginLeft: '-8px' }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
