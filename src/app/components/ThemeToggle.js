"use client"; // Ensure it runs on the client side

import { useTheme } from "@/context/ThemeProvider";
import { Sun, Moon } from "lucide-react"; // Install `lucide-react` for better icons

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-base-200 hover:bg-base-300 transition-all"
      aria-label="Toggle Theme"
    >
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
