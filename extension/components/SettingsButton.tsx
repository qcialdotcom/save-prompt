// components/SettingsButton.tsx
// Settings modal. Right now it only has the sync settings.

import { useState } from "react";
import { isLoggedIn } from "@/lib/auth";
import {
  clearDeletePrompts,
  countDeletePrompts,
  getDeletePrompts,
} from "@/lib/prompts";
import {
  getSyncSettings,
  saveSyncSettings,
  scheduleSync,
  type SyncSettings,
} from "@/lib/sync";

const INTERVALS = [
  { secs: 60, label: "Every minute" },
  { secs: 300, label: "Every 5 minutes" },
  { secs: 900, label: "Every 15 minutes" },
  { secs: 1800, label: "Every 30 minutes" },
  { secs: 3600, label: "Every hour" },
];

type ErrorTarget = "sync" | "background";

function Toggle({
  checked,
  blocked = false,
  label,
  onChange,
}: {
  checked: boolean;
  blocked?: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-disabled={blocked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
        checked ? "bg-primary" : "bg-outline-variant"
      } ${blocked ? "opacity-40" : ""}`}
    >
      <span
        className={`inline-block size-4 rounded-full bg-on-primary shadow transition-transform ${
          checked ? "translate-x-4.5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export default function SettingsButton() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<SyncSettings | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [trashCount, setTrashCount] = useState(0);
  const [hasUnsyncedTrash, setHasUnsyncedTrash] = useState(false);
  const [showTrashConfirmation, setShowTrashConfirmation] = useState(false);
  const [error, setError] = useState<{
    target: ErrorTarget;
    message: string;
  } | null>(null);

  async function openModal() {
    const [loggedIn, nextSettings, deletedPrompts] = await Promise.all([
      isLoggedIn(),
      getSyncSettings(),
      getDeletePrompts(),
    ]);
    setSignedIn(loggedIn);
    setSettings(nextSettings);
    setTrashCount(deletedPrompts.length);
    setHasUnsyncedTrash(
      deletedPrompts.some(
        (prompt) => prompt.deletedAt > nextSettings.lastSyncedAt,
      ),
    );
    setShowTrashConfirmation(false);
    setError(null);
    setOpen(true);
  }

  function closeModal() {
    setError(null);
    setShowTrashConfirmation(false);
    setOpen(false);
  }

  // Save a change, then restart the background timer
  async function change(changes: Partial<SyncSettings>) {
    setError(null);
    setSettings(await saveSyncSettings(changes));
    await scheduleSync();
  }

  // Cloud sync needs a saved Google login.
  async function toggleSync(value: boolean) {
    if (value && !signedIn) {
      setError({ target: "sync", message: "Please log in first." });
      return;
    }
    await change({ isEnabled: value });
  }

  // Run in background needs Cloud sync to be on.
  async function toggleBackground(value: boolean) {
    if (!settings?.isEnabled) {
      setError({
        target: "background",
        message: "Please turn on Cloud sync first.",
      });
      return;
    }
    await change({ runInBackground: value });
  }

  async function emptyTrash() {
    await clearDeletePrompts();
    setTrashCount(0);
    setHasUnsyncedTrash(false);
    setShowTrashConfirmation(false);
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
          onClick={closeModal}
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

            <div className="flex items-center justify-between mt-2 text-sm text-on-surface">
              Cloud sync
              <Toggle
                label="Cloud sync"
                checked={settings.isEnabled}
                blocked={!signedIn}
                onChange={toggleSync}
              />
            </div>
            {error?.target === "sync" && (
              <p role="alert" className="mt-1 text-xs text-error">
                {error.message}
              </p>
            )}

            <div className="flex items-center justify-between mt-2 text-sm text-on-surface">
              Run in background
              <Toggle
                label="Run in background"
                checked={settings.runInBackground}
                blocked={!settings.isEnabled}
                onChange={toggleBackground}
              />
            </div>
            {error?.target === "background" && (
              <p role="alert" className="mt-1 text-xs text-error">
                {error.message}
              </p>
            )}
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

            <div className="mt-4 pt-3 border-t border-outline-variant">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-on-surface">
                  <svg
                    className="size-4 text-on-surface-variant"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
                  </svg>
                  <span>Trash</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTrashConfirmation(true)}
                  disabled={trashCount === 0}
                  className="px-2.5 py-1 text-xs font-medium rounded-md border border-error text-error hover:bg-error-container disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Empty trash
                </button>
              </div>
              <p className="mt-1 text-[10px] text-on-surface-variant">
                {trashCount} {trashCount === 1 ? "deleted prompt" : "deleted prompts"} in trash
              </p>

              {showTrashConfirmation && (
                <div className="p-3 mt-2 rounded-lg bg-error-container/40">
                  <p className="text-xs text-on-surface">
                    {hasUnsyncedTrash
                      ? "Please sync first. Emptying the trash before syncing may make deleted prompts reappear from the cloud. If you sync first, then trash will be automatically emptied."
                      : "Emptying the trash permanently removes its sync history. Deleted prompts may reappear from the cloud if they have not synced yet."}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      onClick={emptyTrash}
                      className="flex-1 py-1.5 text-xs font-medium rounded-md bg-error text-on-error hover:opacity-90 cursor-pointer"
                    >
                      Delete anyway
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTrashConfirmation(false)}
                      className="flex-1 py-1.5 text-xs font-medium rounded-md border border-outline-variant text-on-surface-variant hover:bg-surface-container cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={closeModal}
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
