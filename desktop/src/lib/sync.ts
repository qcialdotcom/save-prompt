// src/lib/sync.ts

import { z } from "zod";
import { getAccessToken, isLoggedIn } from "./auth.js";
import { clearDeletedBefore, getPrompts, mergePrompts, parsePrompts, type Prompt } from "./prompts.js";
import { exclusive, readJson, writeJson } from "../electron/storage.js";
import { INTERVALS, type SyncSettings } from "../shared/api.js";

export type { SyncSettings } from "../shared/api.js";

const FILE_NAME = "prompts.json";
const REQUEST_TIMEOUT_MS = 30_000;
const API = "https://www.googleapis.com";

const defaultSettings: SyncSettings = {
  isEnabled: false,
  lastSyncedAt: 0,
  lastSyncError: null,
  syncIntervalInSecs: 900,
  runInBackground: false,
};

// Use default values for missing or invalid settings.
const StoredSettingsSchema = z.object({
  isEnabled: z.boolean().catch(defaultSettings.isEnabled),
  lastSyncedAt: z.number().finite().catch(defaultSettings.lastSyncedAt),
  lastSyncError: z.string().nullable().catch(defaultSettings.lastSyncError),
  syncIntervalInSecs: z.number().finite().catch(defaultSettings.syncIntervalInSecs),
  runInBackground: z.boolean().catch(defaultSettings.runInBackground),
});

const validInterval = (secs: number) => INTERVALS.some((i) => i.secs === secs);

async function readSettings(): Promise<SyncSettings> {
  const stored = StoredSettingsSchema.parse(await readJson("settings.json").then((d) => (d && typeof d === "object" ? d : {})));

  // Only allow sync intervals provided by the application.
  if (!validInterval(stored.syncIntervalInSecs)) {
    stored.syncIntervalInSecs = defaultSettings.syncIntervalInSecs;
  }

  return stored;
}

export async function getSyncSettings(): Promise<SyncSettings> {
  const settings = await exclusive(readSettings);

  // Background sync requires a signed-in account.
  if (!(await isLoggedIn())) settings.isEnabled = false;

  return settings;
}

export async function saveSyncSettings(changes: Partial<SyncSettings>): Promise<SyncSettings> {
  const loggedIn = await isLoggedIn();

  const settings = await exclusive(async () => {
    // Update only the provided settings and keep the remaining values.
    const next = { ...(await readSettings()), ...changes };

    if (!loggedIn) next.isEnabled = false;

    // Replace unsupported intervals with the default interval.
    if (!validInterval(next.syncIntervalInSecs)) {
      next.syncIntervalInSecs = defaultSettings.syncIntervalInSecs;
    }

    await writeJson("settings.json", next);
    return next;
  });

  return settings;
}

let timer: NodeJS.Timeout | undefined;
let onSynced: (() => void) | undefined;

export async function scheduleSync(): Promise<void> {
  // Clear the previous timer before creating a new schedule.
  if (timer) clearInterval(timer);
  timer = undefined;

  const settings = await getSyncSettings();

  // Background sync runs only when both options are enabled.
  if (!settings.isEnabled || !settings.runInBackground) return;

  timer = setInterval(() => {
    void backgroundSync();
  }, settings.syncIntervalInSecs * 1000);

  // Allow the timer to run without keeping the application open by itself.
  timer.unref();
}

async function backgroundSync(): Promise<void> {
  const settings = await getSyncSettings();

  if (!settings.isEnabled || !settings.runInBackground) return;

  try {
    await syncNow();

    // Notify the caller after a successful background sync.
    onSynced?.();
  } catch {
    // The sync function already saves the error in the settings.
  }
}

export async function startScheduler(callback: () => void): Promise<void> {
  onSynced = callback;
  await scheduleSync();
}

export function stopScheduler(): void {
  if (timer) clearInterval(timer);
  timer = undefined;
}

async function drive(token: string, url: string, init: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };

  // JSON requests need a content type so Google can read their bodies.
  if (init.body) headers["Content-Type"] = "application/json";

  let res: Response;

  try {
    // Stop waiting if Google Drive does not respond within the time limit.
    res = await fetch(url, { ...init, headers, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  } catch {
    throw new Error("Could not reach Google Drive. Check your internet connection.");
  }

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Google session expired. Please sign in again.");
    }

    if (res.status === 403) {
      throw new Error("Google Drive access was denied (403). Sign out and sign in again.");
    }

    throw new Error(`Google Drive error (${res.status}).`);
  }

  return res;
}

async function findFile(token: string): Promise<string | null> {
  // Search the app's private Drive folder for its sync file.
  const q = encodeURIComponent(`name='${FILE_NAME}' and trashed=false`);

  const res = await drive(token, `${API}/drive/v3/files?spaces=appDataFolder&q=${q}&fields=files(id)&pageSize=1`);

  const data = (await res.json()) as { files?: { id: string }[] };

  return data.files?.[0]?.id ?? null;
}

async function downloadFile(token: string, id: string): Promise<Prompt[]> {
  const res = await drive(token, `${API}/drive/v3/files/${id}?alt=media`);

  // Validate downloaded data before using it as prompts.
  return parsePrompts(await res.json());
}

async function uploadFile(token: string, id: string | null, prompts: Prompt[]): Promise<void> {
  if (!id) {
    // Create the sync file inside Google's private app data folder.
    const res = await drive(token, `${API}/drive/v3/files`, {
      method: "POST",
      body: JSON.stringify({ name: FILE_NAME, parents: ["appDataFolder"] }),
    });

    id = ((await res.json()) as { id: string }).id;
  }

  // Replace the cloud file with the current local prompts.
  await drive(token, `${API}/upload/drive/v3/files/${id}?uploadType=media`, { method: "PATCH", body: JSON.stringify(prompts) });
}

export async function resetCloud(): Promise<void> {
  try {
    const token = await getAccessToken();
    const fileId = await findFile(token);

    // Delete the cloud file if one exists.
    if (fileId) {
      await drive(token, `${API}/drive/v3/files/${fileId}`, { method: "DELETE" });
    }

    // Reset sync status without changing the local prompts.
    await saveSyncSettings({ lastSyncedAt: 0, lastSyncError: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cloud reset failed.";

    await saveSyncSettings({ lastSyncError: message });
    throw err;
  }
}

let running: Promise<void> | undefined;

export function syncNow(): Promise<void> {
  // Reuse the current sync instead of starting another one.
  running ??= runSync().finally(() => {
    running = undefined;
  });

  return running;
}

async function runSync(): Promise<void> {
  const startedAt = Date.now();

  try {
    const token = await getAccessToken();
    const fileId = await findFile(token);

    // Merge cloud changes before uploading the combined prompt list.
    if (fileId) {
      await mergePrompts(await downloadFile(token, fileId));
    }

    await uploadFile(token, fileId, await getPrompts());

    // Clear only deletion records that existed before this sync started.
    await clearDeletedBefore(startedAt);

    await saveSyncSettings({ lastSyncedAt: Date.now(), lastSyncError: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed.";

    await saveSyncSettings({ lastSyncError: message });
    throw err;
  }
}
