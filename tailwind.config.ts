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
          success: {
            50: "#ecfdf5",
            100: "#d1fae5",
            700: "#047857"
          },
          warning: {
            50: "#fffbeb",
            100: "#fef3c7",
            700: "#b45309"
          },
          danger: {
            50: "#fff1f2",
            100: "#ffe4e6",
            700: "#be123c"
          }
        }
      }
    }
  },
  plugins: []
};

export default config;
