import type { Config } from "tailwindcss";

/**
 * Tailwind CSS Preset for Design Tokens
 *
 * This preset extends Tailwind with semantic color classes that use CSS variables.
 * CSS variables are defined in globals.css and switch automatically based on theme.
 *
 * Usage in tailwind.config.ts:
 * import designTokens from "./src/styles/tailwind-preset";
 * export default { presets: [designTokens], ... }
 *
 * Usage in components:
 * <div className="bg-background text-foreground">
 * <button className="bg-primary hover:bg-primary-hover text-primary-foreground">
 */
const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        // Background colors
        background: {
          DEFAULT: "rgb(var(--color-background) / <alpha-value>)",
          surface: "rgb(var(--color-background-surface) / <alpha-value>)",
          elevated: "rgb(var(--color-background-elevated) / <alpha-value>)",
          muted: "rgb(var(--color-background-muted) / <alpha-value>)",
          subtle: "rgb(var(--color-background-subtle) / <alpha-value>)",
        },

        // Foreground / Text colors
        foreground: {
          DEFAULT: "rgb(var(--color-foreground) / <alpha-value>)",
          muted: "rgb(var(--color-foreground-muted) / <alpha-value>)",
          subtle: "rgb(var(--color-foreground-subtle) / <alpha-value>)",
          placeholder: "rgb(var(--color-foreground-placeholder) / <alpha-value>)",
          inverse: "rgb(var(--color-foreground-inverse) / <alpha-value>)",
        },

        // Primary brand colors
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          hover: "rgb(var(--color-primary-hover) / <alpha-value>)",
          active: "rgb(var(--color-primary-active) / <alpha-value>)",
          // Note: subtle contains built-in alpha in dark theme, don't use <alpha-value>
          subtle: "rgb(var(--color-primary-subtle))",
          foreground: "rgb(var(--color-primary-foreground) / <alpha-value>)",
        },

        // Accent colors
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          hover: "rgb(var(--color-accent-hover) / <alpha-value>)",
          // Note: subtle contains built-in alpha in dark theme, don't use <alpha-value>
          subtle: "rgb(var(--color-accent-subtle))",
        },

        // Border colors
        border: {
          DEFAULT: "rgb(var(--color-border) / <alpha-value>)",
          muted: "rgb(var(--color-border-muted) / <alpha-value>)",
          strong: "rgb(var(--color-border-strong) / <alpha-value>)",
        },

        // Status colors
        success: {
          DEFAULT: "rgb(var(--color-success) / <alpha-value>)",
          subtle: "rgb(var(--color-success-subtle))",
          foreground: "rgb(var(--color-success-foreground) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--color-warning) / <alpha-value>)",
          subtle: "rgb(var(--color-warning-subtle))",
          foreground: "rgb(var(--color-warning-foreground) / <alpha-value>)",
        },
        error: {
          DEFAULT: "rgb(var(--color-error) / <alpha-value>)",
          subtle: "rgb(var(--color-error-subtle))",
          foreground: "rgb(var(--color-error-foreground) / <alpha-value>)",
        },
        info: {
          DEFAULT: "rgb(var(--color-info) / <alpha-value>)",
          subtle: "rgb(var(--color-info-subtle))",
          foreground: "rgb(var(--color-info-foreground) / <alpha-value>)",
        },

        // Code block colors
        code: {
          background: "rgb(var(--color-code-background) / <alpha-value>)",
          text: "rgb(var(--color-code-text) / <alpha-value>)",
          border: "rgb(var(--color-code-border) / <alpha-value>)",
        },

        // Ring (focus outline)
        ring: {
          DEFAULT: "rgb(var(--color-ring) / <alpha-value>)",
        },
      },

      // Custom border color utilities
      borderColor: {
        DEFAULT: "rgb(var(--color-border) / <alpha-value>)",
      },

      // Custom ring color
      ringColor: {
        DEFAULT: "rgb(var(--color-ring) / <alpha-value>)",
      },

      // Gradient utilities using CSS variables
      backgroundImage: {
        "gradient-primary":
          "linear-gradient(to right, rgb(var(--color-gradient-start)), rgb(var(--color-gradient-middle)), rgb(var(--color-gradient-end)))",
        "gradient-shimmer":
          "linear-gradient(90deg, transparent 0%, rgb(var(--color-foreground-inverse) / 0.4) 20%, rgb(var(--color-primary) / 0.1) 50%, rgb(var(--color-foreground-inverse) / 0.4) 80%, transparent 100%)",
      },
    },
  },
};

export default preset;
