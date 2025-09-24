// File: tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // ✅ Ensure class-based dark mode is enabled
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
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: ["light", "dark"], // ✅ Enables both light and dark themes
    darkTheme: "dark", // ✅ Defines the dark theme name explicitly
    base: false, // ❌ Prevents DaisyUI from auto-applying themes
  },
};

