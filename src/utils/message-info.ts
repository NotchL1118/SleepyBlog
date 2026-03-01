/**
 * Message Notification System
 *
 * A toast notification manager similar to Ant Design's Message component.
 * Uses a singleton pattern to manage multiple message notifications with queue support.
 *
 * @example
 * ```typescript
 * import { message } from "@/utils/messageInfo";
 *
 * // Basic usage
 * message.success("Operation succeeded");
 * message.error("Operation failed");
 * message.warning("Warning message");
 * message.info("Info message");
 *
 * // With custom duration
 * message.success("Saved successfully", { duration: 5000 });
 *
 * // Loading state (manual control)
 * const key = message.loading("Uploading...");
 * // Later...
 * message.update(key, { type: "success", content: "Upload complete" });
 * // Or close it
 * message.close(key);
 *
 * // Custom content with callback
 * message.info("Operation completed", {
 *   duration: 3000,
 *   onClose: () => console.log("Message closed")
 * });
 *
 * // Close all messages
 * message.closeAll();
 * ```
 *
 * @notes
 * - Messages appear at the top-center of the screen
 * - Multiple messages can be displayed simultaneously (stacked)
 * - Default auto-dismiss duration is 3 seconds
 * - Loading messages don't auto-dismiss unless manually closed
 * - Each message has a unique key for manual control
 */

import { createRoot, type Root } from "react-dom/client";
import MessageContainer from "@/components/Message/MessageContainer";
import { createElement } from "react";

/** Message types */
export type MessageType = "success" | "error" | "warning" | "info" | "loading";

/** Message configuration options */
export interface MessageOptions {
  /** Duration in milliseconds before auto-dismiss (0 = no auto-dismiss) */
  duration?: number;
  /** Callback when message is closed */
  onClose?: () => void;
  /** Custom CSS class name */
  className?: string;
}

/** Internal message data structure */
export interface MessageData {
  /** Unique message identifier */
  key: string;
  /** Message type */
  type: MessageType;
  /** Message content */
  content: string;
  /** Configuration options */
  options: MessageOptions;
  /** Auto-dismiss timer ID */
  timerId?: NodeJS.Timeout;
  /** Remaining time in milliseconds (for pause/resume) */
  remainingTime?: number;
  /** Timestamp when the timer started */
  startTime?: number;
  /** Whether the message is currently paused */
  isPaused?: boolean;
}

/** Update message options */
export interface UpdateOptions {
  type?: MessageType;
  content?: string;
  duration?: number;
}

/**
 * MessageManager - Singleton class to manage message notifications
 */
class MessageManager {
  /** Active messages queue */
  private messages: MessageData[] = [];
  /** Container DOM element */
  private container: HTMLDivElement | null = null;
  /** React root for rendering */
  private root: Root | null = null;
  /** Container ID */
  private readonly containerId = "message-container";

  /**
   * Initialize the message container
   */
  private ensureContainer(): void {
    if (this.container) return;

    // Create container if it doesn't exist
    this.container = document.createElement("div");
    this.container.id = this.containerId;
    document.body.appendChild(this.container);

    // Create React root
    this.root = createRoot(this.container);
    this.render();
  }

  /**
   * Render the message container with current messages
   */
  private render(): void {
    if (!this.root) return;

    this.root.render(
      createElement(MessageContainer, {
        messages: this.messages,
        onClose: (key) => this.close(key),
        onPause: (key) => this.pause(key),
        onResume: (key) => this.resume(key),
      })
    );
  }

  /**
   * Generate a unique key for a message
   */
  private generateKey(): string {
    return `message-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Add a new message to the queue
   */
  private add(type: MessageType, content: string, options: MessageOptions = {}): string {
    this.ensureContainer();

    const key = this.generateKey();
    const defaultDuration = type === "loading" ? 0 : 3000; // Loading doesn't auto-dismiss
    const duration = options.duration !== undefined ? options.duration : defaultDuration;

    const messageData: MessageData = {
      key,
      type,
      content,
      options: { ...options, duration },
      remainingTime: duration,
      startTime: duration > 0 ? Date.now() : undefined,
      isPaused: false,
    };

    // Set up auto-dismiss timer if duration > 0
    if (duration > 0) {
      messageData.timerId = setTimeout(() => {
        this.close(key);
      }, duration);
    }

    // Add to queue
    this.messages.push(messageData);
    this.render();

    return key;
  }

  /**
   * Update an existing message
   */
  update(key: string, options: UpdateOptions): void {
    const message = this.messages.find((msg) => msg.key === key);
    if (!message) return;

    // Clear existing timer
    if (message.timerId) {
      clearTimeout(message.timerId);
      message.timerId = undefined;
    }

    // Update properties
    if (options.type !== undefined) {
      message.type = options.type;
    }
    if (options.content !== undefined) {
      message.content = options.content;
    }

    // Set new timer if duration is specified
    const duration = options.duration !== undefined ? options.duration : message.options.duration;
    if (duration && duration > 0) {
      message.timerId = setTimeout(() => {
        this.close(key);
      }, duration);
    }

    this.render();
  }

  /**
   * Close a specific message
   */
  close(key: string): void {
    const index = this.messages.findIndex((msg) => msg.key === key);
    if (index === -1) return;

    const message = this.messages[index];

    // Clear timer
    if (message.timerId) {
      clearTimeout(message.timerId);
    }

    // Call onClose callback
    message.options.onClose?.();

    // Remove from queue
    this.messages.splice(index, 1);

    // Re-render
    this.render();

    // Clean up container if no messages left
    if (this.messages.length === 0) {
      this.destroy();
    }
  }

  /**
   * Close all messages
   */
  closeAll(): void {
    // Clear all timers and call callbacks
    this.messages.forEach((message) => {
      if (message.timerId) {
        clearTimeout(message.timerId);
      }
      message.options.onClose?.();
    });

    // Clear queue
    this.messages = [];

    // Clean up
    this.destroy();
  }

  /**
   * Pause a message's auto-dismiss timer (e.g., when mouse hovers over it)
   */
  pause(key: string): void {
    const message = this.messages.find((msg) => msg.key === key);
    if (!message) return;

    // Clear existing timer (could be dismiss timer or resume delay timer)
    if (message.timerId) {
      clearTimeout(message.timerId);
      message.timerId = undefined;
    }

    // If already paused, no need to recalculate remaining time
    if (message.isPaused) return;

    // Calculate remaining time
    if (message.startTime && message.options.duration) {
      const elapsed = Date.now() - message.startTime;
      message.remainingTime = Math.max(0, message.options.duration - elapsed);
    }

    message.isPaused = true;
    this.render();
  }

  /**
   * Resume a message's auto-dismiss timer (e.g., when mouse leaves it)
   * @param delay - Delay in milliseconds before resuming (default: 500ms)
   */
  resume(key: string, delay: number = 500): void {
    const message = this.messages.find((msg) => msg.key === key);
    if (!message || !message.isPaused) return;

    // Delay before resuming the timer
    message.timerId = setTimeout(() => {
      const msg = this.messages.find((m) => m.key === key);
      if (!msg || !msg.isPaused) return;

      msg.isPaused = false;

      // Set new timer with remaining time
      if (msg.remainingTime && msg.remainingTime > 0) {
        msg.startTime = Date.now();
        msg.timerId = setTimeout(() => {
          this.close(key);
        }, msg.remainingTime);
      }

      this.render();
    }, delay);
  }

  /**
   * Destroy the container
   */
  private destroy(): void {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }

    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
      this.container = null;
    }
  }

  /**
   * Show a success message
   */
  success(content: string, options?: MessageOptions): string {
    return this.add("success", content, options);
  }

  /**
   * Show an error message
   */
  error(content: string, options?: MessageOptions): string {
    return this.add("error", content, options);
  }

  /**
   * Show a warning message
   */
  warning(content: string, options?: MessageOptions): string {
    return this.add("warning", content, options);
  }

  /**
   * Show an info message
   */
  info(content: string, options?: MessageOptions): string {
    return this.add("info", content, options);
  }

  /**
   * Show a loading message
   */
  loading(content: string, options?: MessageOptions): string {
    return this.add("loading", content, options);
  }
}

// Export singleton instance
export const message = new MessageManager();
