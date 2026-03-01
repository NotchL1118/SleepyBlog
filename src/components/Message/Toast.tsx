"use client";

import type { MessageType } from "@/utils/message-info";
import { AlertCircle, AlertTriangle, CheckCircle, Info, Loader2, X } from "lucide-react";
import { motion } from "motion/react";

interface ToastProps {
  /** Message type */
  type: MessageType;
  /** Message content */
  content: string;
  /** Close handler */
  onClose: () => void;
  /** Mouse enter handler (for pausing) */
  onMouseEnter?: () => void;
  /** Mouse leave handler (for resuming) */
  onMouseLeave?: () => void;
  /** Duration in milliseconds for auto-dismiss */
  duration?: number;
  /** Whether the timer is currently paused */
  isPaused?: boolean;
  /** Custom CSS class */
  className?: string;
}

/** Icon and color configuration for each message type */
const messageConfig = {
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-800",
    textColor: "text-green-800 dark:text-green-200",
    iconColor: "text-green-600 dark:text-green-400",
    progressColor: "bg-green-500",
  },
  error: {
    icon: AlertCircle,
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800",
    textColor: "text-red-800 dark:text-red-200",
    iconColor: "text-red-600 dark:text-red-400",
    progressColor: "bg-red-500",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    textColor: "text-yellow-800 dark:text-yellow-200",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    progressColor: "bg-yellow-500",
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    textColor: "text-blue-800 dark:text-blue-200",
    iconColor: "text-blue-600 dark:text-blue-400",
    progressColor: "bg-blue-500",
  },
  loading: {
    icon: Loader2,
    bgColor: "bg-gray-50 dark:bg-gray-800",
    borderColor: "border-gray-200 dark:border-gray-700",
    textColor: "text-gray-800 dark:text-gray-200",
    iconColor: "text-gray-600 dark:text-gray-400",
    progressColor: "bg-gray-500",
  },
};

/**
 * Toast - Individual message notification component
 */
export default function Toast({
  type,
  content,
  onClose,
  onMouseEnter,
  onMouseLeave,
  duration,
  isPaused = false,
  className = "",
}: ToastProps) {
  const config = messageConfig[type];
  const Icon = config.icon;
  const showProgress = duration && duration > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{
        layout: { duration: 0.2 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 },
        y: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
      }}
      className={`relative flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm ${config.bgColor} ${config.borderColor} ${className} overflow-hidden`}
      role="alert"
      aria-live="polite"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 ${config.iconColor}`}>
        {type === "loading" ? <Icon className="h-5 w-5 animate-spin" /> : <Icon className="h-5 w-5" />}
      </div>

      {/* Content */}
      <div className={`flex-1 text-sm font-medium ${config.textColor}`}>{content}</div>

      {/* Close button */}
      <button
        onClick={onClose}
        className={`flex-shrink-0 rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10 ${config.iconColor} `}
        aria-label="关闭消息"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Progress bar */}
      {showProgress && (
        <div className="absolute bottom-0 left-0 right-0 h-[3px]">
          <div
            className={`h-full ${config.progressColor} origin-left`}
            style={{
              animation: `toast-progress ${duration}ms linear forwards`,
              animationPlayState: isPaused ? "paused" : "running",
            }}
          />
        </div>
      )}

      {/* Keyframes style */}
      {showProgress && (
        <style jsx>{`
          @keyframes toast-progress {
            from {
              transform: scaleX(1);
            }
            to {
              transform: scaleX(0);
            }
          }
        `}</style>
      )}
    </motion.div>
  );
}
