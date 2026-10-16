// components/DeleteAllButton.tsx

import Modal from "@/components/Modal";
import { deleteAllPrompts } from "@/lib/prompts";
import { useState } from "react";

interface Props {
  onChanged: () => void; // reload list after delete
}

const CONFIRM_TEXT = "DELETE ALL PROMPT";

export default function DeleteAllButton({ onChanged }: Props) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");

  function close() {
    setOpen(false);
    setTyped("");
  }

  // Press Enter only when the text matches exactly
  async function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") close();
    if (e.key === "Enter" && typed === CONFIRM_TEXT) {
      await deleteAllPrompts();
      close();
      onChanged();
    }
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
          <h2 className="text-sm font-semibold text-error">
            Delete all prompts?
          </h2>
          <p className="mt-1 text-xs text-on-surface-variant">
            This cannot be undone. Type{" "}
            <span className="font-semibold text-on-surface">{CONFIRM_TEXT}</span>{" "}
            and press Enter.
          </p>
          <input
            autoFocus
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={CONFIRM_TEXT}
            className="w-full px-3 py-2 mt-3 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-outline outline-none focus:border-error"
          />
          <button
            onClick={close}
            className="w-full py-2 mt-3 text-sm font-medium rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container cursor-pointer"
          >
            Cancel
          </button>
        </Modal>
      )}
    </>
  );
}
