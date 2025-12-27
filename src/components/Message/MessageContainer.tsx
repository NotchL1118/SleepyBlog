"use client";

import type { MessageData } from "@/utils/message-info";
import { AnimatePresence } from "motion/react";
import Toast from "./Toast";

interface MessageContainerProps {
  /** Array of active messages */
  messages: MessageData[];
  /** Close handler for individual messages */
  onClose: (key: string) => void;
  /** Pause handler for individual messages (e.g., on mouse enter) */
  onPause: (key: string) => void;
  /** Resume handler for individual messages (e.g., on mouse leave) */
  onResume: (key: string) => void;
}

/**
 * MessageContainer - Container component for managing multiple toast messages
 * Positioned at top-center of the screen with vertical stacking
 */
export default function MessageContainer({ messages, onClose, onPause, onResume }: MessageContainerProps) {
  return (
    <div
      className="pointer-events-none fixed left-0 right-0 top-0 z-[9999] flex flex-col items-center gap-2 px-4 pt-4"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {messages.map((message) => (
          <div key={message.key} className="pointer-events-auto">
            <Toast
              type={message.type}
              content={message.content}
              onClose={() => onClose(message.key)}
              onMouseEnter={() => onPause(message.key)}
              onMouseLeave={() => onResume(message.key)}
              duration={message.options.duration}
              isPaused={message.isPaused}
              className={message.options.className}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
