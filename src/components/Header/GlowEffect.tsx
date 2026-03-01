"use client";
import { clsx } from "clsx";
import { useRef, useState } from "react";
import styles from "./GlowEffect.module.scss";

interface GlowEffectProps {
  children: React.ReactNode;
  className?: string;
}

export default function GlowEffect({ children, className }: GlowEffectProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const [showGlow, setShowGlow] = useState(false);

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (!containerRef.current || !glowRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    glowRef.current.style.setProperty("--x", `${x}px`);
    if (!showGlow) setShowGlow(true);
  };

  const handleMouseLeave: React.MouseEventHandler<HTMLDivElement> = () => {
    setShowGlow(false);
  };

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
