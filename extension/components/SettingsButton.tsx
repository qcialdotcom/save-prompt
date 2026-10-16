// components/SettingsButton.tsx
// Settings modal. Right now it only has the sync settings.

import { useState } from "react";
import {
  getSyncSettings,
  saveSyncSettings,
  scheduleSync,
  type SyncSettings,
} from "@/lib/sync";

const INTERVALS = [
  { secs: 300, label: "Every 5 minutes" },
  { secs: 900, label: "Every 15 minutes" },
  { secs: 1800, label: "Every 30 minutes" },
  { secs: 3600, label: "Every hour" },
];

export default function SettingsButton() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<SyncSettings | null>(null);

  async function openModal() {
    setSettings(await getSyncSettings());
    setOpen(true);
  }

  // Save a change, then restart the background timer
  async function change(changes: Partial<SyncSettings>) {
    setSettings(await saveSyncSettings(changes));
    await scheduleSync();
  }

  return (
    <>
      <button
        onClick={openModal}
        aria-label="Settings"
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
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
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
            <h2 className="text-sm font-semibold text-on-surface">Settings</h2>
            <p className="mt-3 text-xs font-semibold text-on-surface-variant">
              Sync
            </p>

            <label className="flex items-center justify-between mt-2 text-sm text-on-surface cursor-pointer">
              Cloud sync
              <input
                type="checkbox"
                checked={settings.isEnabled}
                onChange={(e) => change({ isEnabled: e.target.checked })}
                className="size-4 accent-primary cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between mt-2 text-sm text-on-surface cursor-pointer">
              Run in background
              <input
                type="checkbox"
                checked={settings.runInBackground}
                disabled={!settings.isEnabled}
                onChange={(e) => change({ runInBackground: e.target.checked })}
                className="size-4 accent-primary disabled:opacity-40 cursor-pointer"
              />
            </label>
            <p className="mt-1 text-[10px] text-outline">
              Keeps syncing even when the popup is closed.
            </p>

            <select
              value={settings.syncIntervalInSecs}
              disabled={!settings.isEnabled || !settings.runInBackground}
              onChange={(e) =>
                change({ syncIntervalInSecs: Number(e.target.value) })
              }
              className="w-full px-3 py-2 mt-2 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface outline-none focus:border-primary disabled:opacity-40"
            >
              {INTERVALS.map((i) => (
                <option key={i.secs} value={i.secs}>
                  {i.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => setOpen(false)}
              className="w-full py-2 mt-3 text-sm font-medium rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
