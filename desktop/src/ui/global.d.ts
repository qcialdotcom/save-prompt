// src/ui/global.d.ts
import type { Api } from "../shared/api.ts";

declare global {
  interface Window {
    api?: Api;
  }
}

export {};
