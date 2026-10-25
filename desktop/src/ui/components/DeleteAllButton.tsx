// src/ui/components/DeleteAllButton.tsx

import { useState } from "react";
import { api, errorMessage } from "../api.ts";
import Modal from "./Modal.tsx";

interface Props {
  onChanged: () => void;
}

const CONFIRM_TEXT = "DELETE ALL PROMPT";

export default function DeleteAllButton({ onChanged }: Props) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function close() {
    setOpen(false);
    setTyped("");
    setError("");
  }

  async function handleDelete() {
    if (typed !== CONFIRM_TEXT || busy) return;

    setBusy(true);
    setError("");
    try {
      await api.deleteAllPrompts();
      close();
      onChanged();
    } catch (err) {
      setError(errorMessage(err, "Could not delete the prompts."));
    } finally {
      setBusy(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") void handleDelete();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 text-xs font-medium rounded-full border border-error text-error hover:bg-error-container cursor-pointer"
      >
        Delete all
      </button>

      {open && (
        <Modal onClose={close}>
          <h2 className="text-sm font-semibold text-error">Delete all prompts?</h2>
          <p className="mt-1 text-xs text-on-surface-variant">
            This cannot be undone. Type <span className="font-semibold text-on-surface">{CONFIRM_TEXT}</span> and press Enter, or click Delete all below.
          </p>
          <input
            autoFocus
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={CONFIRM_TEXT}
            className="w-full px-3 py-2 mt-3 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-outline outline-none focus:border-error"
          />
          {error && (
            <p role="alert" className="mt-2 text-xs text-error">
              {error}
            </p>
          )}
          <button
            onClick={handleDelete}
            disabled={busy || typed !== CONFIRM_TEXT}
            className="w-full py-2 mt-3 text-sm font-medium rounded-lg bg-error text-on-error hover:opacity-90 disabled:opacity-40 cursor-pointer"
          >
            {busy ? "Deleting..." : "Delete all"}
          </button>
          <button
            onClick={close}
            className="w-full py-2 mt-2 text-sm font-medium rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container cursor-pointer"
          >
            Cancel
          </button>
        </Modal>
      )}
    </>
  );
}
