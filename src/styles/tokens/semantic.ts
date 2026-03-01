import { primitiveColors } from "./colors";

/**
 * Semantic Color Tokens
 * Maps primitive colors to meaningful UI roles
 *
 * This abstraction layer allows:
 * 1. Consistent color usage across the app
 * 2. Easy theme switching (light/dark)
 * 3. Single source of truth for color decisions
 */
export const semanticColors = {
  // === LIGHT THEME ===
  light: {
    // Background
    background: {
      DEFAULT: primitiveColors.gray[50], // Main page background
      surface: primitiveColors.white, // Card/modal background
      elevated: primitiveColors.gray[100], // Elevated surface
      muted: primitiveColors.gray[100], // Muted background
      subtle: primitiveColors.gray[200], // Subtle background
    },

    // Foreground / Text
    foreground: {
      DEFAULT: primitiveColors.gray[900], // Primary text
      muted: primitiveColors.gray[600], // Secondary text
      subtle: primitiveColors.gray[500], // Tertiary text
      placeholder: primitiveColors.gray[400], // Placeholder text
      inverse: primitiveColors.white, // Text on dark background
    },

    // Primary (Brand)
    primary: {
      DEFAULT: primitiveColors.blue[500], // Primary actions
      hover: primitiveColors.blue[600], // Hover state
      active: primitiveColors.blue[700], // Active/pressed state
      subtle: primitiveColors.blue[50], // Subtle background
      foreground: primitiveColors.white, // Text on primary
    },

    // Accent (Secondary highlight)
    accent: {
      DEFAULT: primitiveColors.blue[400], // Accent color
      hover: primitiveColors.blue[500], // Accent hover
      subtle: primitiveColors.blue[100], // Subtle accent
    },

    // Border
    border: {
      DEFAULT: primitiveColors.gray[200], // Default border
      muted: primitiveColors.gray[100], // Subtle border
      strong: primitiveColors.gray[300], // Strong border
    },

    // Status Colors
    success: {
      DEFAULT: primitiveColors.green[500],
      subtle: `${primitiveColors.green[500]} / 0.1`, // 10% opacity
      foreground: primitiveColors.green[800],
    },
    warning: {
      DEFAULT: primitiveColors.yellow[500],
      subtle: `${primitiveColors.yellow[500]} / 0.1`,
      foreground: primitiveColors.yellow[800],
    },
    error: {
      DEFAULT: primitiveColors.red[500],
      subtle: `${primitiveColors.red[500]} / 0.1`,
      foreground: primitiveColors.red[800],
    },
    info: {
      DEFAULT: primitiveColors.blue[500],
      subtle: `${primitiveColors.blue[500]} / 0.1`,
      foreground: primitiveColors.blue[800],
    },

    // Gradient Colors (for shimmer, skeleton, etc.)
    gradient: {
      start: primitiveColors.blue[500],
      middle: primitiveColors.purple[500],
      end: primitiveColors.pink[500],
    },

    // Code Block
    code: {
      background: "250 250 250", // #fafafa
      text: primitiveColors.gray[800],
      border: primitiveColors.gray[200],
    },

    // Ring (focus outline)
    ring: {
      DEFAULT: primitiveColors.blue[500],
    },
  },

  // === DARK THEME ===
  dark: {
    background: {
      DEFAULT: primitiveColors.gray[900],
      surface: primitiveColors.gray[800],
      elevated: primitiveColors.gray[700],
      muted: primitiveColors.gray[800],
      subtle: primitiveColors.gray[700],
    },

    foreground: {
      DEFAULT: primitiveColors.gray[50],
      muted: primitiveColors.gray[400],
      subtle: primitiveColors.gray[500],
      placeholder: primitiveColors.gray[600],
      inverse: primitiveColors.gray[900],
    },

    primary: {
      DEFAULT: primitiveColors.blue[500],
      hover: primitiveColors.blue[400],
      active: primitiveColors.blue[300],
      subtle: `${primitiveColors.blue[500]} / 0.2`, // 20% opacity
      foreground: primitiveColors.white,
    },

    accent: {
      DEFAULT: primitiveColors.blue[400],
      hover: primitiveColors.blue[300],
      subtle: `${primitiveColors.blue[400]} / 0.15`,
    },

    border: {
      DEFAULT: primitiveColors.gray[700],
      muted: primitiveColors.gray[800],
      strong: primitiveColors.gray[600],
    },

    success: {
      DEFAULT: primitiveColors.green[400],
      subtle: `${primitiveColors.green[500]} / 0.2`,
      foreground: primitiveColors.green[200],
    },
    warning: {
      DEFAULT: primitiveColors.yellow[400],
      subtle: `${primitiveColors.yellow[500]} / 0.2`,
      foreground: primitiveColors.yellow[200],
    },
    error: {
      DEFAULT: primitiveColors.red[400],
      subtle: `${primitiveColors.red[500]} / 0.2`,
      foreground: primitiveColors.red[200],
    },
    info: {
      DEFAULT: primitiveColors.blue[400],
      subtle: `${primitiveColors.blue[500]} / 0.2`,
      foreground: primitiveColors.blue[200],
    },

    gradient: {
      start: primitiveColors.blue[400],
      middle: primitiveColors.purple[400],
      end: primitiveColors.pink[400],
    },

    code: {
      background: "30 30 30", // #1e1e1e
      text: primitiveColors.gray[200],
      border: primitiveColors.gray[700],
    },

    ring: {
      DEFAULT: primitiveColors.blue[400],
    },
  },
} as const;

export type SemanticColors = typeof semanticColors;
