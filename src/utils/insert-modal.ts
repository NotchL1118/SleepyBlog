"use client";
import { createElement } from "react";
import type { ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";

/**
 * Modal Manager - Dynamically insert and manage Modal components
 *
 * Usage:
 * ```tsx
 * const key = insertModal.add(<YourModal />);
 * insertModal.close(key);
 * ```
 */
class ModalManager {
  private currentKey: string | null = null;
  private currentContainer: HTMLDivElement | null = null;
  private currentRoot: ReturnType<typeof createRoot> | null = null;

  /**
   * Add and display a Modal
   * @param element React component element
   * @returns Unique key for the Modal
   */
  add(element: ReactElement): string {
    // Close old Modal if exists
    if (this.currentKey) {
      this.close(this.currentKey);
    }

    // Generate unique key
    const key = `modal-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Create container element
    const container = document.createElement("div");
    container.id = key;
    document.body.appendChild(container);

    // Render using React 18+ createRoot API
    const root = createRoot(container);

    // Wrap element with ThemeProvider to provide theme context                                                                                                            
    const wrappedElement = createElement(
      ThemeProvider,
      { attribute: "class", enableSystem: true, defaultTheme: "system" },
      element
    );

    root.render(wrappedElement);

    // Save current Modal info
    this.currentKey = key;
    this.currentContainer = container;
    this.currentRoot = root;

    return key;
  }

  /**
   * Close specified Modal
   * @param key Unique identifier of the Modal
   */
  close(key: string): void {
    // Verify key matches current Modal
    if (key !== this.currentKey || !this.currentContainer || !this.currentRoot) {
      console.warn(`[insertModal] Attempting to close non-existent Modal: ${key}`);
      return;
    }

    // Unmount React component
    this.currentRoot.unmount();

    // Remove container from DOM
    if (this.currentContainer.parentNode) {
      this.currentContainer.parentNode.removeChild(this.currentContainer);
    }

    // Clear state
    this.currentKey = null;
    this.currentContainer = null;
    this.currentRoot = null;
  }
}

// Export singleton
export const insertModal = new ModalManager();
