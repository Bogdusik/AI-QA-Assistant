import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f3f8ff",
          100: "#e6f0ff",
          500: "#2f6feb",
          700: "#1f4cb8"
        },
        semantic: {
          success: { 50: "#ecfdf5", 100: "#d1fae5", 700: "#047857" },
          warning: { 50: "#fffbeb", 100: "#fef3c7", 700: "#b45309" },
          danger: { 50: "#fff1f2", 100: "#ffe4e6", 700: "#be123c" }
        }
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" }
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" }
        }
      },
      animation: {
        shimmer: "shimmer 1.6s ease-in-out infinite",
        "fade-up": "fade-up 0.4s ease-out both",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite"
      },
      backdropBlur: {
        xs: "2px"
      }
    }
  },
  plugins: []
};

export default config;
