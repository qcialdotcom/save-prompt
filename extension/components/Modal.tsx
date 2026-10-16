// components/Modal.tsx

import { SITE_INFO } from "@/config/site";
import { useScrollLock } from "@/hooks/useScrollLock";
import type { ReactNode } from "react";

interface Props {
  onClose?: () => void; // click on overlay; leave empty to ignore
  fullPage?: boolean; // true when shown in a full browser tab
  children: ReactNode;
}

export default function Modal({ onClose, fullPage = false, children }: Props) {
  useScrollLock(true);

  return (
    <div
      onClick={fullPage ? undefined : onClose}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 p-4 ${
        fullPage ? "bg-surface-container-low" : "bg-inverse-surface/60"
      }`}
    >
      {fullPage && (
        <div className="flex items-center gap-3">
          <img
            src={SITE_INFO.logo.src}
            alt={SITE_INFO.logo.alt}
            className="size-9 rounded-lg"
          />
          <span className="text-xl font-semibold text-on-surface">
            {SITE_INFO.name}
          </span>
        </div>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full rounded-xl bg-surface border border-outline-variant shadow-lg shadow-shadow-primary animate-slide-in ${
          fullPage ? "max-w-md p-6" : "max-w-sm p-4"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
