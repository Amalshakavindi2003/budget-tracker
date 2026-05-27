import type { Config } from "tailwindcss";

const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#07111f",
        surface: "#0e1a2e",
        surfaceSoft: "#12233d",
        line: "rgba(148, 163, 184, 0.18)",
        accent: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        success: "#10b981",
        danger: "#ef4444",
        warning: "#f59e0b",
      },
      boxShadow: {
        glow: "0 20px 80px rgba(15, 23, 42, 0.55)",
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at top left, rgba(37, 99, 235, 0.26), transparent 28%), radial-gradient(circle at top right, rgba(14, 165, 233, 0.16), transparent 25%), linear-gradient(180deg, rgba(7, 17, 31, 0.96), rgba(7, 17, 31, 1))",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;