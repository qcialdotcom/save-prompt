// src/ui/components/SyncButton.tsx

import { useEffect, useState } from "react";
import { api, errorMessage } from "../api.ts";
import type { AuthStatus, SyncSettings } from "../../shared/api.ts";
import Modal from "./Modal.tsx";

interface Props {
  onChanged: () => void;
}

const RESET_TEXT = "RESET CLOUD";

export default function SyncButton({ onChanged }: Props) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<SyncSettings | null>(null);
  const [auth, setAuth] = useState<AuthStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [resetTyped, setResetTyped] = useState("");

  async function refresh() {
    try {
      const [nextSettings, nextAuth] = await Promise.all([api.getSyncSettings(), api.getAuthStatus()]);
      setSettings(nextSettings);
      setAuth(nextAuth);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  useEffect(() => {
    let alive = true;

    Promise.all([api.getSyncSettings(), api.getAuthStatus()])
      .then(([nextSettings, nextAuth]) => {
        if (!alive) return;
        setSettings(nextSettings);
        setAuth(nextAuth);
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, []);

  function closeReset() {
    setResetOpen(false);
    setResetTyped("");
  }

  function closeModal() {
    if (busy && !auth?.loggedIn) void api.cancelLogin();
    setOpen(false);
    closeReset();
  }

  function openModal() {
    setOpen(true);
    closeReset();
    setError("");
    void refresh();
  }

  async function handleSync() {
    setBusy(true);
    setError("");
    try {
      await api.syncNow();
      onChanged();
    } catch (err) {
      setError(errorMessage(err, "Sync failed."));
    }
    await refresh();
    setBusy(false);
  }

  async function handleLogin() {
    setBusy(true);
    setError("");
    try {
      await api.login();
    } catch (err) {
      setError(errorMessage(err, "Login failed."));
      await refresh();
      setBusy(false);
      return;
    }
    await refresh();
    setBusy(false);
    await handleSync();
  }

  async function handleLogout() {
    try {
      await api.logout();
    } catch (err) {
      setError(errorMessage(err));
    }
    await refresh();
  }

  async function handleResetCloud() {
    if (resetTyped !== RESET_TEXT || busy) return;

    setBusy(true);
    setError("");
    try {
      await api.resetCloud();
      closeReset();
      await refresh();
    } catch (err) {
      setError(errorMessage(err, "Cloud reset failed."));
    } finally {
      setBusy(false);
    }
  }

  const showLoginHint = auth?.loggedIn === false;

  return (
    <>
      <button
        onClick={openModal}
        aria-label={showLoginHint ? "Sign in to cloud sync" : "Cloud sync"}
        className="p-1.5 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container cursor-pointer"
      >
        <span className="block size-4">
          {showLoginHint ? (
            <svg className="size-4 animate-pulse motion-reduce:animate-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          ) : (
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M8 16H3v5" />
            </svg>
          )}
        </span>
      </button>

      {open && settings && (
        <Modal onClose={closeModal}>
          {resetOpen ? (
            <>
              <h2 className="text-sm font-semibold text-error">Reset cloud data?</h2>
              <p className="mt-1 text-xs text-on-surface-variant">
                This deletes the prompts stored in Google Drive and cannot be undone. Your local prompts will not be affected. Type{" "}
                <span className="font-semibold text-on-surface">{RESET_TEXT}</span> and press Enter.
              </p>
              <input
                autoFocus
                value={resetTyped}
                onChange={(e) => setResetTyped(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void handleResetCloud()}
                placeholder={RESET_TEXT}
                className="w-full px-3 py-2 mt-3 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-outline outline-none focus:border-error"
              />
              {error && (
                <p role="alert" className="mt-2 text-xs text-error">
                  {error}
                </p>
              )}
              <button
                onClick={handleResetCloud}
                disabled={busy || resetTyped !== RESET_TEXT}
                className="w-full py-2 mt-3 text-sm font-medium rounded-lg bg-error text-on-error hover:opacity-90 disabled:opacity-40 cursor-pointer"
              >
                {busy ? "Resetting..." : "Reset cloud"}
              </button>
              <button
                onClick={closeReset}
                disabled={busy}
                className="w-full py-2 mt-2 text-sm font-medium rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-40 cursor-pointer"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <h2 className="text-sm font-semibold text-on-surface">Cloud sync</h2>

              {!auth?.loggedIn ? (
                <>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    Sign in with Google to sync your prompts with Google Drive.
                  </p>
                  <button
                    onClick={handleLogin}
                    disabled={busy}
                    className="w-full py-2 mt-3 text-sm font-medium rounded-lg bg-primary text-on-primary hover:opacity-90 disabled:opacity-40 cursor-pointer"
                  >
                    {busy ? "Waiting for Google..." : "Sign in with Google"}
                  </button>
                  {busy && <p className="mt-1 text-[10px] text-outline">Finish signing in in your browser, then come back here.</p>}
                </>
              ) : (
                <>
                  {auth.email && <p className="mt-1 text-xs text-on-surface-variant">Signed in as {auth.email}</p>}
                  <p className="mt-1 text-xs text-on-surface-variant">
                    Last synced: {settings.lastSyncedAt ? new Date(settings.lastSyncedAt).toLocaleString() : "never"}
                  </p>
                  {!settings.isEnabled && <p className="mt-1 text-xs text-on-surface-variant">Cloud sync is turned off in Settings.</p>}
                  <button
                    onClick={handleSync}
                    disabled={busy || !settings.isEnabled}
                    className="w-full py-2 mt-3 text-sm font-medium rounded-lg bg-primary text-on-primary hover:opacity-90 disabled:opacity-40 cursor-pointer"
                  >
                    {busy ? "Syncing..." : "Sync now"}
                  </button>
                  <button
                    onClick={handleLogout}
                    disabled={busy}
                    className="w-full py-2 mt-2 text-sm font-medium rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-40 cursor-pointer"
                  >
                    Sign out
                  </button>
                  <button
                    onClick={() => setResetOpen(true)}
                    disabled={busy}
                    className="w-full py-2 mt-2 text-sm font-medium rounded-lg border border-error text-error hover:bg-error-container disabled:opacity-40 cursor-pointer"
                  >
                    Reset cloud
                  </button>
                </>
              )}

              {(error || settings.lastSyncError) && (
                <p role="alert" className="mt-2 text-xs text-error">
                  {error || settings.lastSyncError}
                </p>
              )}

              <button
                onClick={closeModal}
                className="w-full py-2 mt-2 text-sm font-medium rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                Close
              </button>
            </>
          )}
        </Modal>
      )}
    </>
  );
}
