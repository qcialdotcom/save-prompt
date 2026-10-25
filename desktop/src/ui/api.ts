// src/ui/api.ts

import type { Api } from "../shared/api.ts";

export const hasApi = typeof window !== "undefined" && !!window.api;

export const api = (window.api ?? ({} as Api)) as Api;

export const errorMessage = (error: unknown, fallback = "Something went wrong.") =>
  error instanceof Error && error.message ? error.message : fallback;
