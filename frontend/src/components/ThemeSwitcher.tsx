"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Sparkles } from "lucide-react";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      // Check system pref
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (systemDark) {
        setTheme("dark");
        document.documentElement.classList.add("dark");
      } else {
        setTheme("light");
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (!mounted) {
    return (
      <div className="h-7 w-28 animate-pulse rounded-full bg-zinc-200/50 dark:bg-zinc-800/50" />
    );
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border-custom bg-card-custom p-0.5 shadow-2xs transition-all duration-300">
      <button
        onClick={() => {
          if (theme !== "light") toggleTheme();
        }}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold tracking-wider transition-all duration-300 cursor-pointer ${
          theme === "light"
            ? "bg-accent-bg-custom text-accent-custom shadow-3xs"
            : "text-foreground/55 hover:text-foreground"
        }`}
        title="Old Book Light Theme"
      >
        <Sun className="h-3.5 w-3.5" />
        <span>Old Book</span>
      </button>

      <button
        onClick={() => {
          if (theme !== "dark") toggleTheme();
        }}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold tracking-wider transition-all duration-300 cursor-pointer ${
          theme === "dark"
            ? "bg-zinc-800 text-white shadow-3xs dark:bg-zinc-700"
            : "text-foreground/55 hover:text-foreground"
        }`}
        title="Sanctuary Dark Theme"
      >
        <Moon className="h-3.5 w-3.5" />
        <span>Midnight</span>
      </button>
    </div>
  );
}
