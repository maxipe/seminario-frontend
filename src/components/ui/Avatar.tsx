/** Avatar circular con imagen o iniciales como fallback sobre fondo brand-purple. */

interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
};

function initials(alt: string): string {
  return alt
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export default function Avatar({ src, alt, size = 'md' }: AvatarProps) {
  return (
    <div
      className={`relative rounded-full overflow-hidden bg-brand-purple flex items-center justify-center shrink-0 ${sizeClasses[size]}`}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span className="font-display font-semibold text-white leading-none">
          {initials(alt)}
        </span>
      )}
    </div>
  );
}
