"use client";
import { clsx } from "clsx";
import { useCallback, useRef, useState } from "react";
import styles from "./GlowEffect.module.scss";

interface GlowEffectProps {
  children: React.ReactNode;
  className?: string;
}

export default function GlowEffect({ children, className }: GlowEffectProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const [showGlow, setShowGlow] = useState(false);

  const handleMouseMove = useCallback<React.MouseEventHandler<HTMLDivElement>>(
    (event) => {
      if (!containerRef.current || !glowRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
      glowRef.current.style.setProperty("--x", `${x}px`);
      if (!showGlow) setShowGlow(true);
    },
    [showGlow]
  );

  const handleMouseLeave = useCallback<React.MouseEventHandler<HTMLDivElement>>(() => {
    if (!glowRef.current) return;
    glowRef.current.style.removeProperty("--x");
    setShowGlow(false);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={clsx("relative", className)}
    >
      {children}
      {/* Moving bottom glow */}
      <div className={styles.glowTrack} aria-hidden>
        <div ref={glowRef} className={clsx(styles.glow, { [styles.glowHidden]: !showGlow })} />
      </div>
    </div>
  );
}
