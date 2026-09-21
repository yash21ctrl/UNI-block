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
          eng: "#3B82F6",       // Civil Engineering Blue
          sig: "#F59E0B",       // Signal & Telecom Amber
          trd: "#10B981",       // Traction Green
          fusion: "#8B5CF6",    // Integrated Fusion Purple
          emergency: "#EF4444", // Rail Fracture Red
        },
        telemetry: {
          cyan: "#06B6D4",
          amber: "#F59E0B",
          emerald: "#10B981",
          rose: "#F43F5E",
          violet: "#8B5CF6",
        },
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "radar-sweep": "spin 4s linear infinite",
        "glow-red": "glowRed 1.5s ease-in-out infinite alternate",
        "glow-cyan": "glowCyan 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glowRed: {
          "0%": { boxShadow: "0 0 5px #EF4444" },
          "100%": { boxShadow: "0 0 25px #EF4444, 0 0 40px #EF4444" },
        },
        glowCyan: {
          "0%": { boxShadow: "0 0 5px #06B6D4" },
          "100%": { boxShadow: "0 0 20px #06B6D4, 0 0 30px #06B6D4" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
