import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * A glowing beam that travels along the border of its parent container.
 */
export function BorderBeam({ className, duration = 6, delay = 0, borderWidth = 1.5, color }) {
  return (
    <span
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden',
        className
      )}
    >
      <span
        className="absolute inset-x-0 top-0 h-[--beam-size] animate-border-beam opacity-70"
        style={{
          '--beam-size': `${borderWidth}px`,
          background: `linear-gradient(90deg, transparent, ${color || 'var(--color-primary)'}, transparent)`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
        }}
      />
    </span>
  );
}

/**
 * Text with a moving shimmer highlight.
 */
export function ShimmerText({ children, className }) {
  return (
    <span
      className={cn(
        'bg-gradient-to-r from-foreground/40 via-foreground to-foreground/40 bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer',
        className
      )}
    >
      {children}
    </span>
  );
}

/**
 * Animated number counter that counts up when it enters the viewport.
 */
export function NumberCounter({ value = 0, duration = 1200, decimals = 0, className }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame;
    const start = performance.now();
    const target = Number(value) || 0;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(target * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <span className={className}>{display.toFixed(decimals)}</span>;
}

/**
 * Soft radial spotlight that follows the pointer inside its container.
 */
export function Spotlight({ className, fillColor = 'rgba(120, 80, 255, 0.14)' }) {
  const [position, setPosition] = useState({ x: 50, y: 50 });

  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]', className)}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }}
    >
      <div
        className="absolute h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-opacity duration-300"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          background: `radial-gradient(circle, ${fillColor}, transparent 70%)`,
        }}
      />
    </div>
  );
}
