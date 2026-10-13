// components/PromptForm.tsx

import { useState } from "react";
import { createOrUpdatePrompt, type Prompt } from "@/lib/prompts";

interface Props {
  prompt?: Prompt; // pass it to edit, leave empty to create
  onDone: () => void; // called after save or cancel
}

const field =
  "w-full px-3 py-2 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-outline outline-none focus:border-primary";

export default function PromptForm({ prompt, onDone }: Props) {
  const [title, setTitle] = useState(prompt?.title ?? "");
  const [content, setContent] = useState(prompt?.content ?? "");
  const [tags, setTags] = useState(prompt?.tags.join(", ") ?? "");

  const canSave = title.trim() !== "" && content.trim() !== "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;

    await createOrUpdatePrompt({
      id: prompt?.id ?? crypto.randomUUID(),
      title: title.trim(),
      content: content.trim(),
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      isFavorite: prompt?.isFavorite ?? false,
    });
    onDone();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-full gap-3 p-4 animate-slide-in"
    >
      <h2 className="text-base font-semibold text-on-surface">
        {prompt ? "Edit prompt" : "New prompt"}
      </h2>

      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className={field}
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your prompt here..."
        className={`${field} flex-1 resize-none`}
      />

      <input
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags (comma separated)"
        className={field}
      />

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
