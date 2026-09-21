import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080C14",
        surface: {
          DEFAULT: "#0F172A",
          muted: "#131C31",
          hover: "#1E293B",
          border: "#1E293B",
        },
        railway: {
          track: "#334155",
          ballast: "#1E293B",
          eng: "#3B82F6",
          sig: "#F59E0B",
          trd: "#10B981",
          fusion: "#8B5CF6",
          emergency: "#EF4444",
        },
      },
    },
  },
  plugins: [],
};

export default config;
