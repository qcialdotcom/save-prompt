// src/ui/components/Footer.tsx

import { SITE_INFO } from "../../config/app.ts";

export default function Footer() {
  return (
    <footer className="px-4 py-2 text-xs text-center border-t border-outline-variant bg-surface text-on-surface-variant">
      <p>
        Copyright &copy; {new Date().getFullYear()} <span className="font-bold">{SITE_INFO.name}</span> by{" "}
        <a href={SITE_INFO.parent.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
          <span className="font-extrabold">{SITE_INFO.parent.name}</span>
        </a>
      </p>
      <p>All Rights Reserved</p>
    </footer>
  );
}
