// components/PromptList.tsx

import { useState } from "react";
import { deletePrompt, toggleFavorite, type Prompt } from "@/lib/prompts";

interface Props {
  prompts: Prompt[];
  onEdit: (prompt: Prompt) => void;
  onChanged: () => void; // reload list after delete / favorite
}

const iconBtn =
  "p-1.5 rounded-md text-on-surface-variant hover:bg-surface-container-high cursor-pointer";

export default function PromptList({ prompts, onEdit, onChanged }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleCopy(prompt: Prompt) {
    await navigator.clipboard.writeText(prompt.content);
    setCopiedId(prompt.id);
    setTimeout(() => setCopiedId(null), 1200);
  }

  async function handleFavorite(id: string) {
    await toggleFavorite(id);
    onChanged();
  }

  // Play the slide-out animation first, then delete when it ends
  async function finishDelete(id: string) {
    await deletePrompt(id);
    setDeletingId(null);
    onChanged();
  }

  if (prompts.length === 0) {
    return (
      <p className="px-4 py-10 text-sm text-center text-on-surface-variant">
        No prompts yet. Click "Add new" to save one.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2 px-4 pb-3">
      {prompts.map((p) => (
        <li
          key={p.id}
          onAnimationEnd={() => deletingId === p.id && finishDelete(p.id)}
          className={`p-3 rounded-xl border border-outline-variant bg-surface-container-low shadow-sm shadow-shadow-soft ${
            deletingId === p.id ? "animate-slide-out" : "animate-slide-in"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold truncate text-on-surface">
              {p.title}
            </h3>
            <button
              onClick={() => handleFavorite(p.id)}
              aria-label="Toggle favorite"
              className={`${iconBtn} -mt-1 -mr-1 ${p.isFavorite ? "text-window-yellow" : ""}`}
            >
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill={p.isFavorite ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              >
                <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
              </svg>
            </button>
          </div>

          <p className="mt-1 text-xs line-clamp-2 text-on-surface-variant">
            {p.content}
          </p>

          {p.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {p.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-[10px] rounded-full bg-primary-fixed text-on-primary-fixed"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1 mt-2">
            <button
              onClick={() => handleCopy(p)}
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-primary-container text-on-primary-container cursor-pointer hover:opacity-90"
            >
              {copiedId === p.id ? "Copied ✓" : "Copy"}
            </button>
            <button
              onClick={() => onEdit(p)}
              aria-label="Edit"
              className={iconBtn}
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
                <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
              </svg>
            </button>
            <button
              onClick={() => setDeletingId(p.id)}
              aria-label="Delete"
              className={`${iconBtn} hover:text-error`}
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
                <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
              </svg>
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
