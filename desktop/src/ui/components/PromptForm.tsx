// src/ui/components/PromptForm.tsx

import { useState } from "react";
import { api, errorMessage } from "../api.ts";
import type { Prompt } from "../../shared/api.ts";

interface Props {
  prompt?: Prompt;
  onDone: () => void;
}

const field =
  "w-full px-3 py-2 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-outline outline-none focus:border-primary";

export default function PromptForm({ prompt, onDone }: Props) {
  const [title, setTitle] = useState(prompt?.title ?? "");
  const [content, setContent] = useState(prompt?.content ?? "");
  const [tags, setTags] = useState(prompt?.tags.join(", ") ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canSave = title.trim() !== "" && content.trim() !== "" && !saving;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;

    setSaving(true);
    setError("");

    try {
      await api.savePrompt({
        id: prompt?.id ?? crypto.randomUUID(),
        title: title.trim(),
        content: content.trim(),
        tags: [
          ...new Set(
            tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
          ),
        ],
        isFavorite: prompt?.isFavorite ?? false,
      });
      onDone();
    } catch (err) {
      setError(errorMessage(err, "Could not save the prompt."));
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={(e) => e.key === "Escape" && onDone()}
      className="flex flex-col h-full gap-3 p-4 transition duration-200 starting:opacity-0 starting:translate-y-2"
    >
      <h2 className="text-base font-semibold text-on-surface">{prompt ? "Edit prompt" : "New prompt"}</h2>

      <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" maxLength={200} className={field} />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your prompt here..."
        maxLength={200000}
        className={`${field} flex-1 resize-none`}
      />

      <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma separated)" className={field} />

      {error && (
        <p role="alert" className="text-xs text-error">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onDone}
          className="flex-1 py-2 text-sm font-medium rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canSave}
          className="flex-1 py-2 text-sm font-medium rounded-lg bg-primary text-on-primary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {prompt ? "Update" : "Save"}
        </button>
      </div>
    </form>
  );
}
