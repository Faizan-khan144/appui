import { useEffect, useState } from "react";

const THEME_KEY = "appui.theme.v2";
const ACCENT_KEY = "appui.accent";

export const ACCENTS = [
  { id: "iris", name: "Iris", from: "#8b5cf6", to: "#ec4899" },
  { id: "nebula", name: "Nebula", from: "#6366f1", to: "#22d3ee" },
  { id: "ember", name: "Ember", from: "#fb7185", to: "#fbbf24" },
  { id: "forest", name: "Forest", from: "#22c55e", to: "#a3e635" },
];

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof localStorage === "undefined") return "light";
    return localStorage.getItem(THEME_KEY) || "light";
  });
  const [accent, setAccent] = useState(() => {
    if (typeof localStorage === "undefined") return "iris";
    return localStorage.getItem(ACCENT_KEY) || "iris";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-accent", accent);
    localStorage.setItem(ACCENT_KEY, accent);
  }, [accent]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return { theme, accent, setAccent, toggle, setTheme };
}
