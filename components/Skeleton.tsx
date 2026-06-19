export function Skeleton({
  width,
  height,
  circle,
  className = '',
  style,
}: {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`skeleton skeleton-block ${circle ? 'skeleton-circle' : ''} ${className}`}
      style={{ width, height, ...style }}
    />
  );
}

export function SkeletonText({ lines = 1, width }: { lines?: number; width?: string | (string | undefined)[] }) {
  return (
    <>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton skeleton-text"
          style={{ width: Array.isArray(width) ? width[i] || '100%' : width || '100%' }}
        />
      ))}
    </>
  );
}
