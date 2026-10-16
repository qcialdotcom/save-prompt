// components/SyncButton.tsx

import { useState } from "react";
import { isLoggedIn, logout } from "@/lib/auth";
import {
  getSyncSettings,
  saveSyncSettings,
  scheduleSync,
  syncNow,
  type SyncSettings,
} from "@/lib/sync";

interface Props {
  onChanged: () => void; // reload list after sync
}

export default function SyncButton({ onChanged }: Props) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<SyncSettings | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    setSettings(await getSyncSettings());
    setLoggedIn(await isLoggedIn());
  }

  function openModal() {
    setOpen(true);
    setError("");
    refresh();
  }

  async function handleSync() {
    setBusy(true);
    setError("");
    try {
      await syncNow();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed.");
    }
    await refresh();
    setBusy(false);
  }

  // Login runs in background.ts, because the popup closes when Google's window opens
  function handleLogin() {
    setBusy(true);
    setError("");
    browser.runtime.sendMessage({ type: "login" }, async (res) => {
      await refresh();
      setBusy(false);
      if (res?.error) setError(res.error);
      else handleSync();
    });
  }

  async function handleLogout() {
    await logout();
    await saveSyncSettings({ isEnabled: false });
    await scheduleSync();
    await refresh();
  }

  return (
    <>
      <button
        onClick={openModal}
        aria-label="Cloud sync"
        className="p-1.5 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container cursor-pointer"
      >
        <svg
          className="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M8 16H3v5" />
        </svg>
      </button>

      {open && settings && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm p-4 rounded-xl bg-surface border border-outline-variant shadow-lg shadow-shadow-primary animate-slide-in"
          >
            <h2 className="text-sm font-semibold text-on-surface">
              Cloud sync
            </h2>

            {!loggedIn ? (
              // Not logged in: ask for login
              <>
                <p className="mt-1 text-xs text-on-surface-variant">
                  Sign in with Google to sync your prompts with Google Drive.
                  They are stored in a hidden app folder that only this
                  extension can open.
                </p>
                <button
                  onClick={handleLogin}
                  disabled={busy}
                  className="w-full py-2 mt-3 text-sm font-medium rounded-lg bg-primary text-on-primary hover:opacity-90 disabled:opacity-40 cursor-pointer"
                >
                  {busy ? "Waiting for Google..." : "Sign in with Google"}
                </button>
              </>
            ) : (
              // Logged in: sync now
              <>
                <p className="mt-1 text-xs text-on-surface-variant">
                  Last synced:{" "}
                  {settings.lastSyncedAt
                    ? new Date(settings.lastSyncedAt).toLocaleString()
                    : "never"}
                </p>
                {!settings.isEnabled && (
                  <p className="mt-1 text-xs text-on-surface-variant">
                    Cloud sync is turned off in Settings.
                  </p>
                )}
                <button
                  onClick={handleSync}
                  disabled={busy || !settings.isEnabled}
                  className="w-full py-2 mt-3 text-sm font-medium rounded-lg bg-primary text-on-primary hover:opacity-90 disabled:opacity-40 cursor-pointer"
                >
                  {busy ? "Syncing..." : "Sync now"}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full py-2 mt-2 text-sm font-medium rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container cursor-pointer"
                >
                  Sign out
                </button>
              </>
            )}

            {(error || settings.lastSyncError) && (
              <p className="mt-2 text-xs text-error">
                {error || settings.lastSyncError}
              </p>
            )}

            <button
              onClick={() => setOpen(false)}
              className="w-full py-2 mt-2 text-sm font-medium rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
