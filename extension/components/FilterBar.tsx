// components/FilterBar.tsx

import SettingsButton from "@/components/SettingsButton";
import SyncButton from "@/components/SyncButton";
import { SITE_INFO } from "@/config/site";
import {
  deleteAllPrompts,
  exportToJSONFile,
  importFromJSONFile,
} from "@/lib/prompts";
import { useState } from "react";

interface Props {
  onlyFavorites: boolean;
  onToggleFavorites: () => void;
  onChanged: () => void; // reload list after delete all / import
}

type Modal = null | "delete" | "data" | "import";

const CONFIRM_TEXT = "DELETE ALL PROMPT";

// true when this page was opened as a full browser tab (for importing)
const isTab =
  new URLSearchParams(window.location.search).get("view") === "import";

const modalBtn =
  "w-full py-2 text-sm font-medium rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container cursor-pointer";

export default function FilterBar({
  onlyFavorites,
  onToggleFavorites,
  onChanged,
}: Props) {
  const [modal, setModal] = useState<Modal>(isTab ? "import" : null);
  const [typed, setTyped] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"merge" | "replace">("merge");
  const [error, setError] = useState("");

  function closeModal() {
    // In the import tab, closing the modal closes the whole tab
    if (isTab) {
      window.close();
      return;
    }
    setModal(null);
    setTyped("");
    setFile(null);
    setMode("merge");
    setError("");
  }

  // Delete all: press Enter only when the text matches exactly
  async function handleDeleteKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") closeModal();
    if (e.key === "Enter" && typed === CONFIRM_TEXT) {
      await deleteAllPrompts();
      closeModal();
      onChanged();
    }
  }

  async function handleExport() {
    await exportToJSONFile();
    closeModal();
  }

  // The popup closes when the file picker opens, so import in a full tab
  async function openImportTab() {
    await browser.tabs.create({
      url: `${browser.runtime.getURL("/popup.html")}?view=import`,
    });
    window.close();
  }

  async function handleImport() {
    if (!file) return;
    try {
      await importFromJSONFile(file, mode);
      onChanged();
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 px-4 pb-3">
        <button
          onClick={onToggleFavorites}
          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full border cursor-pointer ${
            onlyFavorites
              ? "bg-primary text-on-primary border-primary"
              : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          <svg
            className="size-3.5"
            viewBox="0 0 24 24"
            fill={onlyFavorites ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          >
            <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
          </svg>
          Favorites
        </button>

        <div className="flex items-center gap-2 ml-auto">
          {/* Cloud sync */}
          <SyncButton onChanged={onChanged} />

          {/* Import / Export (one common icon) */}
          <button
            onClick={() => setModal("data")}
            aria-label="Import or export prompts"
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
              <path d="M7 4v14M3 14l4 4 4-4M17 20V6M13 10l4-4 4 4" />
            </svg>
          </button>

          {/* Settings */}
          <SettingsButton />

          <button
            onClick={() => setModal("delete")}
            className="px-3 py-1.5 text-xs font-medium rounded-full border border-error text-error hover:bg-error-container cursor-pointer"
          >
            Delete all
          </button>
        </div>
      </div>

      {modal && (
        <div
          onClick={isTab ? undefined : closeModal}
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 p-4 ${
            isTab ? "bg-surface-container-low" : "bg-inverse-surface/60"
          }`}
        >
          {/* Logo + name, only on the full import tab */}
          {isTab && (
            <div className="flex items-center gap-3">
              <img
                src={SITE_INFO.logo.src}
                alt={SITE_INFO.logo.alt}
                className="size-9 rounded-lg"
              />
              <span className="text-xl font-semibold text-on-surface">
                {SITE_INFO.name}
              </span>
            </div>
          )}

          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full rounded-xl bg-surface border border-outline-variant shadow-lg shadow-shadow-primary animate-slide-in ${
              isTab ? "max-w-md p-6" : "max-w-sm p-4"
            }`}
          >
            {/* Delete all */}
            {modal === "delete" && (
              <>
                <h2 className="text-sm font-semibold text-error">
                  Delete all prompts?
                </h2>
                <p className="mt-1 text-xs text-on-surface-variant">
                  This cannot be undone. Type{" "}
                  <span className="font-semibold text-on-surface">
                    {CONFIRM_TEXT}
                  </span>{" "}
                  and press Enter.
                </p>
                <input
                  autoFocus
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  onKeyDown={handleDeleteKeyDown}
                  placeholder={CONFIRM_TEXT}
                  className="w-full px-3 py-2 mt-3 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-outline outline-none focus:border-error"
                />
                <button onClick={closeModal} className={`${modalBtn} mt-3`}>
                  Cancel
                </button>
              </>
            )}

            {/* Import / Export choice */}
            {modal === "data" && (
              <>
                <h2 className="text-sm font-semibold text-on-surface">
                  Import / Export
                </h2>
                <p className="mt-1 text-xs text-on-surface-variant">
                  Back up your prompts to a JSON file, or load them from one.
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleExport}
                    className="flex-1 py-2 text-sm font-medium rounded-lg bg-primary text-on-primary hover:opacity-90 cursor-pointer"
                  >
                    Export
                  </button>
                  <button
                    onClick={openImportTab}
                    className="flex-1 py-2 text-sm font-medium rounded-lg bg-primary-container text-on-primary-container hover:opacity-90 cursor-pointer"
                  >
                    Import
                  </button>
                </div>
                <p className="mt-2 text-[10px] text-outline">
                  Import opens in a new tab, because the popup closes when you
                  choose a file.
                </p>
                <button onClick={closeModal} className={`${modalBtn} mt-2`}>
                  Cancel
                </button>
              </>
            )}

            {/* Import: file selector + todo */}
            {modal === "import" && (
              <>
                <h2 className="text-sm font-semibold text-on-surface">
                  Import prompts
                </h2>

                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] ?? null);
                    setError("");
                  }}
                  className="w-full mt-3 text-xs text-on-surface-variant file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-primary-fixed file:text-on-primary-fixed file:text-xs file:font-medium file:cursor-pointer"
                />

                <div className="flex gap-2 mt-3">
                  {(["merge", "replace"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg border capitalize cursor-pointer ${
                        mode === m
                          ? "bg-primary text-on-primary border-primary"
                          : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-[10px] text-outline">
                  {mode === "merge"
                    ? "Merge: keep your current prompts and add or update the imported ones."
                    : "Replace: delete your current prompts and use only the imported ones."}
                </p>

                {error && <p className="mt-2 text-xs text-error">{error}</p>}

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={isTab ? closeModal : () => setModal("data")}
                    className={modalBtn}
                  >
                    {isTab ? "Cancel" : "Back"}
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={!file}
                    className="w-full py-2 text-sm font-medium rounded-lg bg-primary text-on-primary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Import
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
