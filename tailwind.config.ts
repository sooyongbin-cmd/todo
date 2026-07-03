import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F7F5F0",
        card: "#FFFEFB",
        ink: "#1B1F1D",
        muted: "#8A8578",
        line: "#DAD5C7",
        forest: "#2F5233",
        forestDark: "#213B25",
        stamp: "#B33A3A",
        mustard: "#D4A017",
      },
      fontFamily: {
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
        sans: ["var(--font-plex-sans)", "ui-sans-serif", "system-ui"],
      },
      backgroundImage: {
        "paper-texture":
          "radial-gradient(circle at 1px 1px, rgba(27,31,29,0.05) 1px, transparent 0)",
      },
      backgroundSize: {
        "paper-grid": "22px 22px",
      },
    },
  },
  plugins: [],
};
export default config;
