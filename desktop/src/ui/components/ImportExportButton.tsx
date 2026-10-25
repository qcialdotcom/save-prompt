// src/ui/components/ImportExportButton.tsx

import { useState } from "react";
import { api, errorMessage } from "../api.ts";
import type { ImportMode } from "../../shared/api.ts";
import Modal from "./Modal.tsx";

interface Props {
  onChanged: () => void;
}

type View = null | "data" | "import";

const cancelBtn =
  "w-full py-2 text-sm font-medium rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container cursor-pointer";

export default function ImportExportButton({ onChanged }: Props) {
  const [view, setView] = useState<View>(null);
  const [mode, setMode] = useState<ImportMode>("merge");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function close() {
    setView(null);
    setMode("merge");
    setError("");
    setNotice("");
  }

  async function handleExport() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { saved } = await api.exportPrompts();
      if (saved) setNotice("Prompts exported.");
    } catch (err) {
      setError(errorMessage(err, "Export failed."));
    } finally {
      setBusy(false);
    }
  }

  async function handleImport() {
    setBusy(true);
    setError("");
    try {
      const result = await api.importPrompts(mode);
      if (!result) return;
      onChanged();
      close();
    } catch (err) {
      setError(errorMessage(err, "Import failed."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setView("data")}
        aria-label="Import or export prompts"
        className="p-1.5 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container cursor-pointer"
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 4v14M3 14l4 4 4-4M17 20V6M13 10l4-4 4 4" />
        </svg>
      </button>

      {view && (
        <Modal onClose={close}>
          {view === "data" && (
            <>
              <h2 className="text-sm font-semibold text-on-surface">Import / Export</h2>
              <p className="mt-1 text-xs text-on-surface-variant">Back up your prompts to a JSON file, or load them from one.</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleExport}
                  disabled={busy}
                  className="flex-1 py-2 text-sm font-medium rounded-lg bg-primary text-on-primary hover:opacity-90 disabled:opacity-40 cursor-pointer"
                >
                  Export
                </button>
                <button
                  onClick={() => {
                    setError("");
                    setNotice("");
                    setView("import");
                  }}
                  disabled={busy}
                  className="flex-1 py-2 text-sm font-medium rounded-lg bg-primary-container text-on-primary-container hover:opacity-90 disabled:opacity-40 cursor-pointer"
                >
                  Import
                </button>
              </div>
              {notice && <p className="mt-2 text-xs text-tertiary">{notice}</p>}
              {error && (
                <p role="alert" className="mt-2 text-xs text-error">
                  {error}
                </p>
              )}
              <button onClick={close} className={`${cancelBtn} mt-3`}>
                Close
              </button>
            </>
          )}

          {view === "import" && (
            <>
              <h2 className="text-sm font-semibold text-on-surface">Import prompts</h2>

              <div className="flex gap-2 mt-3">
                {(["merge", "replace"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    aria-pressed={mode === m}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg border capitalize cursor-pointer ${
                      mode === m ? "bg-primary text-on-primary border-primary" : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
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
                  <p role="alert" className="mt-2 text-xs text-error">
                    {error}
                  </p>
                  <div className="flex flex-col items-center justify-center gap-1 mt-2 text-xs text-on-surface-variant">
                    <p>Validate Prompt Schema Json file with </p>
                    <a
                      href="https://save-prompt.qcial.com/schema"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-2 py-1 mt-1 text-xs font-medium border rounded-lg cursor-pointer text-primary hover:underline border-outline-variant"
                    >
                      Save Prompt Schema Validator
                    </a>
                  </div>
                </>
              )}

              <div className="flex gap-2 mt-3">
                <button onClick={() => setView("data")} disabled={busy} className={cancelBtn}>
                  Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={busy}
                  className="w-full py-2 text-sm font-medium rounded-lg bg-primary text-on-primary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {busy ? "Importing..." : "Choose file"}
                </button>
              </div>
            </>
          )}
        </Modal>
      )}
    </>
  );
}
