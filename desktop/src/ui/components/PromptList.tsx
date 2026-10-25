// src/ui/components/PromptList.tsx

import { useEffect, useRef, useState } from "react";
import { api, errorMessage } from "../api.ts";
import type { Prompt } from "../../shared/api.ts";

interface Props {
  prompts: Prompt[];
  isFiltered: boolean;
  onEdit: (prompt: Prompt) => void;
  onChanged: () => void;
}

const iconBtn = "p-1.5 rounded-md text-on-surface-variant hover:bg-surface-container-high cursor-pointer";

// Example: "13 Oct 2026"
function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function PromptList({ prompts, isFiltered, onEdit, onChanged }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms));
  }

  async function run(action: () => Promise<void>, fallback: string) {
    setError("");
    try {
      await action();
    } catch (err) {
      setError(errorMessage(err, fallback));
    }
  }

  const handleCopy = (prompt: Prompt) =>
    run(async () => {
      await api.copyText(prompt.content);
      setCopiedId(prompt.id);
      later(() => setCopiedId(null), 1200);
    }, "Could not copy.");

  const handleFavorite = (id: string) =>
    run(async () => {
      await api.toggleFavorite(id);
      onChanged();
    }, "Could not update favorite.");

  function handleDelete(id: string) {
    setDeletingId(id);
    later(() => {
      void run(async () => {
        await api.deletePrompt(id);
        onChanged();
      }, "Could not delete the prompt.").finally(() => setDeletingId(null));
    }, 200);
  }

  if (prompts.length === 0) {
    return (
      <p className="px-4 py-10 text-sm text-center text-on-surface-variant">
        {isFiltered ? "No prompts match your search." : 'No prompts yet. Click "Add new" to save one.'}
      </p>
    );
  }

  return (
    <>
      {error && (
        <p role="alert" className="px-4 pb-2 text-xs text-error">
          {error}
        </p>
      )}
      <ul className="flex flex-col gap-2 px-4 pb-3">
        {prompts.map((p) => (
          <li
            key={p.id}
            className={`p-3 rounded-xl border border-outline-variant bg-surface-container-low shadow-sm shadow-shadow-soft transition duration-200 starting:opacity-0 starting:translate-y-2 ${
              deletingId === p.id ? "opacity-0 translate-x-10" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold truncate text-on-surface">{p.title}</h3>
              <button
                onClick={() => handleFavorite(p.id)}
                aria-label="Toggle favorite"
                aria-pressed={p.isFavorite}
                className={`${iconBtn} -mt-1 -mr-1 ${p.isFavorite ? "text-window-yellow" : ""}`}
              >
                <svg className="size-4" viewBox="0 0 24 24" fill={p.isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                  <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
                </svg>
              </button>
            </div>

            <p className="mt-1 text-xs line-clamp-2 text-on-surface-variant">{p.content}</p>

            {p.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {p.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 text-[10px] rounded-full bg-primary-fixed text-on-primary-fixed">
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
              <button onClick={() => onEdit(p)} aria-label="Edit" className={iconBtn}>
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                </svg>
              </button>
              <button onClick={() => handleDelete(p.id)} disabled={deletingId !== null} aria-label="Delete" className={`${iconBtn} hover:text-error`}>
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
                </svg>
              </button>

              <span className="ml-auto text-[10px] text-outline">Updated {formatDate(p.updatedAt)}</span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
