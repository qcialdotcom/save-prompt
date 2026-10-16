// hooks/useScrollLock.ts

import { useEffect } from "react";

let locks = 0;

function apply() {
  const root = document.documentElement;
  if (locks > 0) {
    root.dataset.scrollLocked = "true";
    document.body.style.overflow = "hidden";
  } else {
    delete root.dataset.scrollLocked;
    document.body.style.overflow = "";
  }
}

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    locks++;
    apply();
    return () => {
      locks--;
      apply();
    };
  }, [active]);
}
