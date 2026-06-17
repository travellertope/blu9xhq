import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-manrope)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      maxWidth: {
        site: "1140px",
      },
      colors: {
        blue: {
          DEFAULT: "#2F5FE0",
          dark: "#1E3FA8",
          soft: "#EAF0FF",
        },
        navy: {
          DEFAULT: "#0E1A2E",
          soft: "#16243B",
        },
        coral: {
          DEFAULT: "#E2543D",
          soft: "#FBEAE6",
        },
        amber: "#D9A22A",
        green: "#2F9E63",
        ink: {
          DEFAULT: "#13181F",
          soft: "#5B6573",
        },
        line: "#E4E7EC",
        "bg-soft": "#F5F7FA",
      },
      borderRadius: {
        site: "14px",
      },
    },
  },
  plugins: [],
};
export default config;
