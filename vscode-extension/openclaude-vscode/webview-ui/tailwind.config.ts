import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        oc: {
          bg: "#090B10",
          surface: "#0F1420",
          sidebar: "#0B0F18",
          card: "#131825",
          border: "#1C2333",
          "border-active": "#2A3350",
          text: "#D6E2FF",
          "text-muted": "#B3BDD4",
          "text-dim": "#5A637B",
          accent: "#F97316",
          "accent-hover": "#FB923C",
          "accent-muted": "#F9731633",
          success: "#89DD7C",
          warning: "#F2C14E",
          error: "#FF6B6B",
          info: "#5CA9FF",
          cyan: "#66D9EF",
          purple: "#C792EA",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      borderRadius: {
        card: "14px",
        pill: "9999px",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.2s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
