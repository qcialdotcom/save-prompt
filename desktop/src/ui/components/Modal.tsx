// src/ui/components/Modal.tsx

import { useEffect, type ReactNode } from "react";

interface Props {
  onClose?: () => void;
  children: ReactNode;
}

export default function Modal({ onClose, children }: Props) {
  useEffect(() => {
    if (!onClose) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60">
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm p-4 transition duration-200 border shadow-lg rounded-xl bg-surface border-outline-variant shadow-shadow-primary starting:opacity-0 starting:translate-y-2"
      >
        {children}
      </div>
    </div>
  );
}
