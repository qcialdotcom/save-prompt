// lib/sync.ts
// Sync prompts with Google Drive: download -> merge -> upload.

import { getAccessToken, isLoggedIn } from "@/lib/auth";
import { getPrompts, mergePrompts, type Prompt } from "@/lib/prompts";

// Settings used to control cloud sync.
export interface SyncSettings {
  isEnabled: boolean;
  lastSyncedAt: number;
  lastSyncError: string | null;
  syncIntervalInSecs: number;
  runInBackground: boolean; // Keep syncing when the popup is closed.
}

const SETTINGS_KEY = "syncSettings";
const FILE_NAME = "prompts.json";
export const SYNC_ALARM = "save-prompt-sync";

// Default settings for new users.
const defaultSettings: SyncSettings = {
  isEnabled: false,
  lastSyncedAt: 0,
  lastSyncError: null,
  syncIntervalInSecs: 900, // 15 minutes.
  runInBackground: false,
};

// ================================
// Settings
// ================================

// Get saved settings, using defaults for missing values.
// Sync is always off when the user has no saved Google login.
export async function getSyncSettings(): Promise<SyncSettings> {
  const data = await browser.storage.local.get(SETTINGS_KEY);
  const settings: SyncSettings = {
    ...defaultSettings,
    ...(data[SETTINGS_KEY] as Partial<SyncSettings>),
  };
  if (!(await isLoggedIn())) settings.isEnabled = false;
  return settings;
}

// Save changed settings while keeping the existing values.
// Refuse to turn on sync when there is no saved Google login.
export async function saveSyncSettings(
  changes: Partial<SyncSettings>,
): Promise<SyncSettings> {
  if (changes.isEnabled && !(await isLoggedIn())) {
    changes = { ...changes, isEnabled: false };
  }
  const settings = { ...(await getSyncSettings()), ...changes };
  await browser.storage.local.set({ [SETTINGS_KEY]: settings });
  return settings;
}

// Start or stop the background sync timer.
export async function scheduleSync(): Promise<void> {
  const settings = await getSyncSettings();
  await browser.alarms.clear(SYNC_ALARM);

  // Schedule sync only when both options are enabled.
  if (settings.isEnabled && settings.runInBackground) {
    browser.alarms.create(SYNC_ALARM, {
      periodInMinutes: Math.max(settings.syncIntervalInSecs / 60, 1),
    });
  }
}

// ================================
// Google Drive helpers
// ================================

const API = "https://www.googleapis.com";

// Send a request to Google Drive and handle errors.
async function drive(token: string, url: string, init: RequestInit = {}) {
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (init.body) headers["Content-Type"] = "application/json";

  const res = await fetch(url, { ...init, headers });
  if (!res.ok) throw new Error(`Google Drive error (${res.status}).`);
  return res;
}

// Find prompts.json in the hidden app folder.
// Return its file ID, or null if it does not exist.
async function findFile(token: string): Promise<string | null> {
  const q = encodeURIComponent(`name='${FILE_NAME}'`);
  const res = await drive(
    token,
    `${API}/drive/v3/files?spaces=appDataFolder&q=${q}&fields=files(id)`,
  );
  const data = await res.json();
  return data.files?.[0]?.id ?? null;
}

// Download prompts from Google Drive.
async function downloadFile(token: string, id: string): Promise<Prompt[]> {
  const res = await drive(token, `${API}/drive/v3/files/${id}?alt=media`);
  const data: unknown = await res.json();
  if (!Array.isArray(data)) return [];

  // Keep only items that look like valid prompts.
  return data.filter(
    (p) => p && typeof p.id === "string" && typeof p.updatedAt === "number",
  );
}

// Upload prompts to Google Drive, creating the file if needed.
async function uploadFile(
  token: string,
  id: string | null,
  prompts: Prompt[],
): Promise<void> {
  // First sync: create prompts.json in the hidden app folder.
  if (!id) {
    const res = await drive(token, `${API}/drive/v3/files`, {
      method: "POST",
      body: JSON.stringify({ name: FILE_NAME, parents: ["appDataFolder"] }),
    });
    id = (await res.json()).id as string;
  }

  // Replace the file content with the latest prompts.
  await drive(token, `${API}/upload/drive/v3/files/${id}?uploadType=media`, {
    method: "PATCH",
    body: JSON.stringify(prompts),
  });
}

// Delete the prompts file from the hidden app folder without changing local prompts.
export async function resetCloud(): Promise<void> {
  try {
    const token = await getAccessToken();
    const fileId = await findFile(token);

    if (fileId) {
      await drive(token, `${API}/drive/v3/files/${fileId}`, {
        method: "DELETE",
      });
    }

    await saveSyncSettings({ lastSyncedAt: 0, lastSyncError: null });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Cloud reset failed.";
    await saveSyncSettings({ lastSyncError: message });
    throw err;
  }
}

// ================================
// Main sync
// ================================

// 1. Download cloud prompts.
// 2. Merge them with local prompts.
// 3. Upload the merged prompts.
export async function syncNow(): Promise<void> {
  try {
    const token = await getAccessToken();
    const fileId = await findFile(token);

    if (fileId) {
      const cloudPrompts = await downloadFile(token, fileId);
      await mergePrompts(cloudPrompts);
    }

    await uploadFile(token, fileId, await getPrompts());

    // Save the sync time and clear any previous error.
    await saveSyncSettings({ lastSyncedAt: Date.now(), lastSyncError: null });
  } catch (err) {
    // Save the error so the UI can show it to the user.
    const message = err instanceof Error ? err.message : "Sync failed.";
    await saveSyncSettings({ lastSyncError: message });
    throw err;
  }
}
