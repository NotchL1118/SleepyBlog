import { ReactNode } from "react";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowFrom?: string;
  glowTo?: string;
}

export default function GlowCard({
  children,
  className = "",
  glowFrom = "indigo-500",
  glowTo = "purple-600",
}: GlowCardProps) {
  return (
    <div className={`group relative ${className} h-fit`}>
      <div
        className={`absolute -inset-0.5 rounded-xl bg-gradient-to-r from-${glowFrom} to-${glowTo} opacity-0 blur transition-all duration-300 group-hover:opacity-20`}
      ></div>
      <div className="relative rounded-xl border border-gray-200 bg-white/90 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/90 dark:shadow-xl">
        {children}
      </div>
    </div>
  );
}
