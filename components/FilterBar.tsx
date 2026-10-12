// components/FilterBar.tsx

import { useState } from "react";
import { deleteAllPrompts } from "@/lib/prompts";

interface Props {
  onlyFavorites: boolean;
  onToggleFavorites: () => void;
  onDeletedAll: () => void; // reload list after everything is deleted
}

const CONFIRM_TEXT = "DELETE ALL PROMPT";

export default function FilterBar({
  onlyFavorites,
  onToggleFavorites,
  onDeletedAll,
}: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [typed, setTyped] = useState("");

  function closeConfirm() {
    setShowConfirm(false);
    setTyped("");
  }

  // Press Enter → delete only if the text matches exactly
  async function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") closeConfirm();
    if (e.key === "Enter" && typed === CONFIRM_TEXT) {
      await deleteAllPrompts();
      closeConfirm();
      onDeletedAll();
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

        <button
          onClick={() => setShowConfirm(true)}
          className="ml-auto px-3 py-1.5 text-xs font-medium rounded-full border border-error text-error hover:bg-error-container cursor-pointer"
        >
          Delete all
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60">
          <div className="w-full p-4 rounded-xl bg-surface border border-outline-variant shadow-lg shadow-shadow-primary animate-slide-in">
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
              onKeyDown={handleKeyDown}
              placeholder={CONFIRM_TEXT}
              className="w-full px-3 py-2 mt-3 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-outline outline-none focus:border-error"
            />

            <button
              onClick={closeConfirm}
              className="w-full py-2 mt-3 text-sm font-medium rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
