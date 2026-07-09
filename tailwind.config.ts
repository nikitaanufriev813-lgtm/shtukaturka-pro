import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1B2A4A", // глубокий тёмно-синий — премиум/надёжность
          light: "#2E4374",
          dark: "#0F1A30",
        },
        accent: {
          DEFAULT: "#D9A441", // тёплое золото — качество/статус
          light: "#E8C57A",
        },
        surface: {
          light: "#F7F8FA",
          dark: "#111826",
        },
        success: "#3AA76D",
        warning: "#E0A93A",
        danger: "#D9534F",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        card: "0 4px 24px rgba(15, 26, 48, 0.08)",
        cardDark: "0 4px 24px rgba(0, 0, 0, 0.4)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
