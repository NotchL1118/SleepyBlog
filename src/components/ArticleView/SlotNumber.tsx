"use client";

import { AnimatePresence, motion } from "motion/react";
import { memo, useMemo } from "react";

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
const DIGIT_HEIGHT = 1; // em

interface DigitWheelProps {
  digit: number;
}

const DigitWheel = memo(function DigitWheel({ digit }: DigitWheelProps) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        height: `${DIGIT_HEIGHT}em`,
        width: "0.6em",
      }}
    >
      <motion.div
        className="absolute inset-x-0"
        style={{ willChange: "transform" }}
        animate={{ y: `${-digit * DIGIT_HEIGHT}em` }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
          mass: 0.8,
        }}
      >
        {DIGITS.map((n) => (
          <div
            key={n}
            className="flex items-center justify-center text-center"
            style={{ height: `${DIGIT_HEIGHT}em`, width: "0.6em" }}
          >
            {n}
          </div>
        ))}
      </motion.div>
    </div>
  );
});

interface SlotNumberProps {
  value: number;
  suffix?: string;
}

export function SlotNumber({ value, suffix = "" }: SlotNumberProps) {
  const clampedValue = Math.min(Math.max(0, Math.round(value)), 100);

  const digits = useMemo(() => {
    if (clampedValue >= 100) {
      return [1, 0, 0];
    } else if (clampedValue >= 10) {
      return [Math.floor(clampedValue / 10), clampedValue % 10];
    } else {
      return [clampedValue];
    }
  }, [clampedValue]);

  return (
    <span
      className="inline-flex items-center tabular-nums"
      style={{ lineHeight: `${DIGIT_HEIGHT}em` }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {digits.map((digit, index) => (
          <motion.span
            key={`pos-${digits.length - index}`}
            initial={{ opacity: 0, scale: 0.8, width: 0 }}
            animate={{ opacity: 1, scale: 1, width: "0.6em" }}
            exit={{ opacity: 0, scale: 0.8, width: 0 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
          >
            <DigitWheel digit={digit} />
          </motion.span>
        ))}
      </AnimatePresence>
      {suffix && <span className="ml-px">{suffix}</span>}
    </span>
  );
}
