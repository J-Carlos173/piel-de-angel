"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";

export default function ThemeProvider() {
  const dark = useThemeStore((s) => s.dark);

  useEffect(() => {
    const html = document.documentElement;
    if (dark) {
      html.setAttribute("data-theme", "dark");
    } else {
      html.removeAttribute("data-theme");
    }
  }, [dark]);

  useEffect(() => {
    const stored = localStorage.getItem("pieldeangel_theme");
    if (!stored) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) useThemeStore.setState({ dark: true });
    }
  }, []);

  return null;
}
