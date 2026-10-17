import { z } from "zod";

export interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface DeletePrompt {
  id: string;
  deletedAt: number;
}

const KEY = "prompts";

const DELETE_KEY = "delete_prompts";

const PromptSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    tags: z.array(z.string()),
    isFavorite: z.boolean(),
    createdAt: z.number().finite(),
    updatedAt: z.number().finite(),
  })
  .strict();

// Get all prompts (newest first)
export async function getPrompts(): Promise<Prompt[]> {
  const data = await browser.storage.local.get(KEY);
  const prompts = (data[KEY] as Prompt[] | undefined) ?? [];
  return prompts.sort((a, b) => b.createdAt - a.createdAt);
}

// Get all deleted prompts (newest first)
export async function getDeletePrompts(): Promise<DeletePrompt[]> {
  const data = await browser.storage.local.get(DELETE_KEY);
  const prompts = (data[DELETE_KEY] as DeletePrompt[] | undefined) ?? [];
  return prompts.sort((a, b) => b.deletedAt - a.deletedAt);
}

// count of deleted prompts
export async function countDeletePrompts(): Promise<number> {
  const deletePrompts = await getDeletePrompts();
  return deletePrompts.length;
}

// reset all deleted prompts
export async function clearDeletePrompts(): Promise<void> {
  await browser.storage.local.set({ [DELETE_KEY]: [] });
}

// Get one prompt by id
export async function getPromptById(id: string): Promise<Prompt | undefined> {
  const prompts = await getPrompts();
  return prompts.find((p) => p.id === id);
}

// Add a new prompt, or update it if the id already exists
// You only pass: id, title, content, tags, isFavorite.
export async function createOrUpdatePrompt(
  prompt: Omit<Prompt, "createdAt" | "updatedAt">,
): Promise<void> {
  const prompts = await getPrompts();
  const existing = prompts.find((p) => p.id === prompt.id);
  const others = prompts.filter((p) => p.id !== prompt.id);
  const now = Date.now();

  const updated: Prompt = {
    ...prompt,
    createdAt: existing?.createdAt ?? now, // new: same as updatedAt, existing: keep the old one
    updatedAt: now,
  };

  await browser.storage.local.set({ [KEY]: [...others, updated] });
}

// Delete a prompt
export async function deletePrompt(id: string): Promise<void> {
  const prompts = await getPrompts();

  // add the deleted prompt to the delete_prompts list
  const deletePrompts = await getDeletePrompts();
  await browser.storage.local.set({
    [DELETE_KEY]: [...deletePrompts, { id, deletedAt: Date.now() }],
  });

  await browser.storage.local.set({
    [KEY]: prompts.filter((p) => p.id !== id),
  });
}

// Delete all prompts
export async function deleteAllPrompts(): Promise<void> {
  // add all prompts to the delete_prompts list
  const prompts = await getPrompts();
  const deletePrompts = await getDeletePrompts();
  const now = Date.now();

  const newDeletePrompts: DeletePrompt[] = prompts.map((p) => ({
    id: p.id,
    deletedAt: now,
  }));

  await browser.storage.local.set({
    [DELETE_KEY]: [...deletePrompts, ...newDeletePrompts],
  });

  // clear all prompts
  await browser.storage.local.set({ [KEY]: [] });
}

// Toggle favorite status of a prompt
export async function toggleFavorite(id: string): Promise<void> {
  const prompts = await getPrompts();
  const prompt = prompts.find((p) => p.id === id);
  if (prompt) {
    prompt.isFavorite = !prompt.isFavorite;
    await createOrUpdatePrompt(prompt);
  }
}

// Get all favorite prompts (newest first)
export async function getFavoritePrompts(): Promise<Prompt[]> {
  const prompts = await getPrompts();
  return prompts
    .filter((p) => p.isFavorite)
    .sort((a, b) => b.createdAt - a.createdAt);
}

// Search prompts by title or content or tags (newest first)
export async function searchPrompts(query: string): Promise<Prompt[]> {
  const prompts = await getPrompts();
  const text = query.trim();

  // Empty search -> return everything
  if (!text) return prompts;

  const { default: Fuse } = await import("fuse.js");

  if (text.startsWith("#")) {
    // Search by tag
    const tag = text.slice(1).toLowerCase();
    const fuse = new Fuse(prompts, {
      keys: ["tags"],
      threshold: 0.3, // 0 = exact match, 1 = match anything
      ignoreLocation: true, // match anywhere in the text
    });

    return fuse
      .search(tag)
      .map((result) => result.item)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  if (text.startsWith("@")) {
    // Search by title
    const title = text.slice(1).toLowerCase();

    const fuse = new Fuse(prompts, {
      keys: ["title"],
      threshold: 0.3, // 0 = exact match, 1 = match anything
      ignoreLocation: true, // match anywhere in the text
    });

    return fuse
      .search(title)
      .map((result) => result.item)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  const fuse = new Fuse(prompts, {
    keys: ["title", "content", "tags"],
    threshold: 0.3, // 0 = exact match, 1 = match anything
    ignoreLocation: true, // match anywhere in the text
  });

  return fuse
    .search(text)
    .map((result) => result.item)
    .sort((a, b) => b.createdAt - a.createdAt);
}

// Export prompts to JSON file
export async function exportToJSONFile(): Promise<void> {
  const prompts = await getPrompts();
  const json = JSON.stringify(prompts, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = "prompts.json";
    a.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Import prompts from JSON file
export async function importFromJSONFile(
  file: File,
  todo: "replace" | "merge" = "merge",
): Promise<void> {
  const text = await file.text();
  let data: unknown;

  try {
    data = JSON.parse(text);
  } catch (error) {
    const location =
      error instanceof SyntaxError
        ? error.message.match(/line (\d+) column (\d+)/i)
        : null;
    const locationMessage = location
      ? ` near line ${location[1]}, column ${location[2]}`
      : "";

    throw new Error(
      `This file contains invalid JSON${locationMessage}. Check for missing commas, quotes, or brackets or missing required fields and try again. If you are trying to import a file from another app, make sure it is in the correct format.`,
    );
  }

  // Validate every prompt; reject missing, extra, or invalid fields.
  const result = z.array(PromptSchema).safeParse(data);

  if (!result.success) {
    throw new Error(
      "Invalid JSON: every prompt must contain exactly the required fields with valid values.",
    );
  }

  const importedPrompts: Prompt[] = result.data;

  // Reject duplicate IDs in the imported file.
  const ids = new Set<string>();

  for (const prompt of importedPrompts) {
    if (ids.has(prompt.id)) {
      throw new Error(`Invalid JSON: duplicate prompt ID "${prompt.id}".`);
    }

    ids.add(prompt.id);
  }

  if (todo === "replace") {
    await browser.storage.local.set({
      [KEY]: importedPrompts,
    });
    return;
  }

  // Merge by ID; imported prompts update existing prompts.
  const existingPrompts = await getPrompts();
  const promptMap = new Map<string, Prompt>(
    existingPrompts.map((prompt) => [prompt.id, prompt]),
  );

  for (const prompt of importedPrompts) {
    const existing = promptMap.get(prompt.id);

    promptMap.set(prompt.id, {
      ...prompt,
      createdAt: existing?.createdAt ?? prompt.createdAt,
      updatedAt: existing
        ? Math.max(existing.updatedAt, prompt.updatedAt)
        : prompt.updatedAt,
    });
  }

  await browser.storage.local.set({
    [KEY]: [...promptMap.values()].sort((a, b) => b.createdAt - a.createdAt),
  });
}

// Merge prompts: new prompts replace existing prompts with the same ID.
export async function mergePrompts(prompts: Prompt[]): Promise<void> {
  const existingPrompts = await getPrompts();

  const promptMap: Map<string, Prompt> = new Map<string, Prompt>(
    existingPrompts.map((prompt) => [prompt.id, prompt]),
  );

  for (const prompt of prompts) {
    const current = promptMap.get(prompt.id);

    if (!current || prompt.updatedAt > current.updatedAt) {
      promptMap.set(prompt.id, prompt);
    }
  }

  // remove deleted prompts from the promptMap
  const deletePrompts = await getDeletePrompts();

  for (const deletePrompt of deletePrompts) {
    promptMap.delete(deletePrompt.id);
  }

  await clearDeletePrompts();

  await browser.storage.local.set({
    [KEY]: [...promptMap.values()].sort((a, b) => b.createdAt - a.createdAt),
  });
}
