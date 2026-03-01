"use client";

import { motion } from "motion/react";
import { SlotNumber } from "../SlotNumber";

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
}

export function ProgressRing({ progress, size = 48, strokeWidth = 4 }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* 背景圆环 */}
      <svg className="absolute" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
      </svg>

      {/* 进度圆环 */}
      <svg className="absolute -rotate-90" width={size} height={size}>
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        />
      </svg>

      {/* 百分比数字 - 使用 SlotNumber */}
      <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-300">
        <SlotNumber value={progress} suffix="%" />
      </div>
    </div>
  );
}
