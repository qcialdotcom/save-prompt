// src/ui/components/Navbar.tsx

import { useEffect, useState } from "react";
import { SITE_INFO } from "../../config/app.ts";

function readTheme(): boolean {
  try {
    return localStorage.getItem("theme") === "dark";
  } catch {
    return false;
  }
}

export default function Navbar() {
  const [dark, setDark] = useState(readTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {
    }
  }, [dark]);

  return (
    <nav className="flex items-center justify-between px-4 py-3 border-b border-outline-variant bg-surface">
      <div className="flex items-center gap-2">
        <img src={SITE_INFO.logo.src} alt={SITE_INFO.logo.alt} className="size-6 rounded" />
        <span className="font-semibold text-on-surface">{SITE_INFO.name}</span>
      </div>

      <button
        onClick={() => setDark(!dark)}
        aria-label="Toggle dark mode"
        className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer"
      >
        {dark ? (
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        ) : (
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
        )}
      </button>
    </nav>
  );
}
