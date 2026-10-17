// components/ImportExportButton.tsx

import Modal from "@/components/Modal";
import { exportToJSONFile, importFromJSONFile } from "@/lib/prompts";
import { useState } from "react";

interface Props {
  onChanged: () => void; // reload list after import
}

type View = null | "data" | "import";

// true when this page was opened as a full browser tab (for importing)
const isTab =
  new URLSearchParams(window.location.search).get("view") === "import";

const cancelBtn =
  "w-full py-2 text-sm font-medium rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container cursor-pointer";

export default function ImportExportButton({ onChanged }: Props) {
  const [view, setView] = useState<View>(isTab ? "import" : null);
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"merge" | "replace">("merge");
  const [error, setError] = useState("");

  function close() {
    // In the import tab, closing the modal closes the whole tab
    if (isTab) {
      window.close();
      return;
    }
    setView(null);
    setFile(null);
    setMode("merge");
    setError("");
  }

  async function handleExport() {
    await exportToJSONFile();
    close();
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
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
    }
  }

  return (
    <>
      <button
        onClick={() => setView("data")}
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

      {view && (
        <Modal onClose={close} fullPage={isTab}>
          {/* Import / Export choice */}
          {view === "data" && (
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
              <button onClick={close} className={`${cancelBtn} mt-2`}>
                Cancel
              </button>
            </>
          )}

          {/* Import: file selector */}
          {view === "import" && (
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

              {error && (
                <>
                  <p className="mt-2 text-xs text-error">{error} </p>
                  <div className="mt-2 text-xs text-on-surface-variant w-100 flex flex-col gap-1 justify-center items-center">
                    <p>Validate Prompt Schema Json file with </p>
                    <a
                      href="https://save-prompt.qcial.com/schema"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline cursor-pointer border border-outline-variant rounded-lg px-2 py-1 text-xs font-medium mt-1 inline-block"
                    >
                      Save Prompt Schema Validator
                    </a>
                  </div>
                </>
              )}

              <div className="flex gap-2 mt-3">
                <button
                  onClick={isTab ? close : () => setView("data")}
                  className={cancelBtn}
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
        </Modal>
      )}
    </>
  );
}
