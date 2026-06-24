import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Calm, non-clinical palette: off-white, soft green, sand, muted gold
        cream: {
          DEFAULT: "#FAF7F0",
          50: "#FDFCF9",
          100: "#FAF7F0",
          200: "#F3ECDE",
        },
        sand: {
          DEFAULT: "#E8DCC4",
          100: "#F1E9D8",
          200: "#E8DCC4",
          300: "#D9C7A3",
        },
        sage: {
          DEFAULT: "#7FA98C",
          50: "#EAF1EC",
          100: "#D6E4DB",
          200: "#A9C6B4",
          300: "#7FA98C",
          400: "#5E8C6E",
          500: "#46735690",
          600: "#3C6049",
        },
        gold: {
          DEFAULT: "#C9A86A",
          100: "#E7D6B0",
          200: "#C9A86A",
          300: "#B08F4E",
        },
        ink: {
          DEFAULT: "#3A3833",
          soft: "#5C584F",
          faint: "#8A857A",
        },
      },
      fontFamily: {
        arabic: ["var(--font-arabic)", "Tajawal", "system-ui", "sans-serif"],
        sans: ["var(--font-arabic)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.75rem",
        "3xl": "2.25rem",
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgba(58, 56, 51, 0.18)",
        card: "0 4px 20px -8px rgba(58, 56, 51, 0.12)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.85" },
          "50%": { transform: "scale(1.12)", opacity: "1" },
        },
        "dot-pulse": {
          "0%, 80%, 100%": { opacity: "0.3", transform: "translateY(0)" },
          "40%": { opacity: "1", transform: "translateY(-3px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
        "fade-in": "fade-in 0.5s ease-out both",
        breathe: "breathe 4s ease-in-out infinite",
        "dot-pulse": "dot-pulse 1.4s infinite ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
