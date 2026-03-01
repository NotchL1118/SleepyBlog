"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const MESSAGES = [
  "不出户，知天下，不窥牖，见天道",
  "道祖慈悲，好汉福寿无量",
  "金丹之道，炼己为先",
  "一粒金丹一因果，我命由天不由我",
  "吃药吃药，若论出身，更不公道",
  "想走近道的人多了，才有了炼丹术。",
  "内炼成丹，外炼成法。",
  "阴阳生五行，五行孕一性，一性禀一造化，一型立一乾坤。",
  "察天地动静之机，探日月盈虚之炒，丹可成矣。",
  "丹炼废了能回炉，人，可不行。",
];

function useRotatingMessage(intervalMs: number) {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * MESSAGES.length));
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length);
    }, intervalMs);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [intervalMs]);

  return MESSAGES[index];
}

function LoadingSpinner({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div className="relative h-14 w-14" aria-hidden="true">
      <div
        className={`absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500/80 dark:border-t-blue-400/80 ${reducedMotion ? "" : "animate-spin-slow"}`}
      />
      <div
        className={`absolute inset-2 rounded-full border-2 border-transparent border-t-purple-500/70 dark:border-t-purple-400/70 ${reducedMotion ? "" : "animate-spin-slower"}`}
      />
      <div
        className={`absolute inset-4 rounded-full border-2 border-transparent border-t-cyan-500/60 dark:border-t-cyan-400/60 ${reducedMotion ? "" : "animate-spin"}`}
      />
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
    </div>
  );
}

export default function Loading() {
  const message = useRotatingMessage(3000);
  // 用户设置了 减少动画 设置，就取消转圈等动画
  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  return (
    <div
      className="flex min-h-[60vh] w-full items-center justify-center bg-gradient-to-b from-transparent to-black/0 px-6 py-16 md:min-h-[70vh]"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="正在加载页面"
    >
      <div className="flex flex-col items-center text-center">
        <div
          className={`mb-6 scale-100 transform will-change-transform ${reducedMotion ? "" : "transition-transform duration-700 ease-out"}`}
        >
          <LoadingSpinner reducedMotion={reducedMotion} />
        </div>

        <div className="relative">
          <div
            key={message}
            className={`mx-auto max-w-[28rem] text-balance text-base text-gray-600 md:text-lg dark:text-gray-300 ${reducedMotion ? "" : "transition-opacity duration-500 ease-out"}`}
          >
            {message}
          </div>
          <div
            className="pointer-events-none absolute -inset-x-10 -bottom-2 top-2 select-none opacity-40 blur-md dark:opacity-30"
            aria-hidden="true"
          >
            <div className="mx-auto h-2 w-48 rounded-full bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-cyan-400/20" />
          </div>
        </div>

        <div className="mt-8 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className={`h-full w-1/3 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 dark:from-blue-400 dark:via-purple-400 dark:to-cyan-400 ${reducedMotion ? "" : "animate-[progress_1.8s_ease-in-out_infinite]"}`}
            />
          </div>
          <span>加载中</span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(20%);
          }
          100% {
            transform: translateX(300%);
          }
        }
        .animate-spin-slow {
          animation: spin 1.2s linear infinite;
        }
        .animate-spin-slower {
          animation: spin 2.2s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
