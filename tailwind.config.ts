import type { Config } from "tailwindcss";
import scrollbar from "tailwind-scrollbar";
import designTokens from "./src/styles/tailwind-preset";

export default {
  // Inherit semantic colors from design tokens preset
  presets: [designTokens],

  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/ui/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // Font family configuration (outside extend to override defaults)
    fontFamily: {
      LXGW: ["LXGW WenKai GB", "sans-serif"],
    },
    extend: {
      // Additional custom extensions can be added here
      // Note: Color tokens are inherited from the preset
    },
  },
  plugins: [scrollbar({ nocompatible: true })],
  darkMode: "selector",
} satisfies Config;
