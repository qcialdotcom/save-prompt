// src/shared/api.ts
// Shared types for communication between the Electron backend and React frontend.

export interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}

// Timestamps are added automatically when a prompt is saved.
export type PromptInput = Omit<Prompt, "createdAt" | "updatedAt">;

export interface DeletePrompt {
  id: string;
  deletedAt: number;
}

export interface SyncSettings {
  isEnabled: boolean;
  lastSyncedAt: number;
  lastSyncError: string | null;
  syncIntervalInSecs: number;
  runInBackground: boolean;
}

export interface AuthStatus {
  loggedIn: boolean;
  email?: string;
}

export interface TrashInfo {
  count: number;
  hasUnsynced: boolean;
}

export type ImportMode = "merge" | "replace";

// Available automatic sync intervals, in seconds.
export const INTERVALS = [
  { secs: 60, label: "Every minute" },
  { secs: 300, label: "Every 5 minutes" },
  { secs: 900, label: "Every 15 minutes" },
  { secs: 1800, label: "Every 30 minutes" },
  { secs: 3600, label: "Every hour" },
] as const;

export interface Api {
  // Search prompts and optionally show only favorites.
  searchPrompts(query: string, onlyFavorites: boolean): Promise<Prompt[]>;

  // Save a prompt without requiring timestamps from the frontend.
  savePrompt(prompt: PromptInput): Promise<void>;
  deletePrompt(id: string): Promise<void>;
  toggleFavorite(id: string): Promise<void>;
  deleteAllPrompts(): Promise<void>;
  copyText(text: string): Promise<void>;

  // Open a file dialog to export or import prompts.
  exportPrompts(): Promise<{ saved: boolean }>;
  importPrompts(mode: ImportMode): Promise<{ count: number } | null>;

  // Manage deleted prompts.
  getTrashInfo(): Promise<TrashInfo>;
  emptyTrash(): Promise<void>;

  // Manage account authentication.
  getAuthStatus(): Promise<AuthStatus>;
  login(): Promise<void>;
  cancelLogin(): Promise<void>;
  logout(): Promise<void>;

  // Read and update cloud sync settings.
  getSyncSettings(): Promise<SyncSettings>;
  saveSyncSettings(
    changes: Partial<Pick<SyncSettings, "isEnabled" | "runInBackground" | "syncIntervalInSecs">>,
  ): Promise<SyncSettings>;
  syncNow(): Promise<void>;
  resetCloud(): Promise<void>;

  // Subscribe to prompt changes and return a function to remove the listener.
  onPromptsChanged(callback: () => void): () => void;
}
