import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        predicq: {
          bg: "#080B0A",
          surface: "#101512",
          elevated: "#151D18",
          border: "#25342B",
          neon: "#20E890",
          teal: "#00CBA8",
          text: "#F4F7F5",
          muted: "#93A198",
          danger: "#FF5C68",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius)",
        lg: "var(--radius-lg)",
      },
      maxWidth: {
        page: "var(--page-max)",
      },
    },
  },
  plugins: [],
} satisfies Config;
