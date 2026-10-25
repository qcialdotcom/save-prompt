// src/lib/prompts.ts

import { readFile, writeFile } from "node:fs/promises";
import Fuse from "fuse.js";
import { z } from "zod";
import { exclusive, readJson, writeJson } from "../electron/storage.js";
import type { DeletePrompt, ImportMode, Prompt, PromptInput } from "../shared/api.js";

export type { DeletePrompt, Prompt } from "../shared/api.js";

const MAX_IMPORT_BYTES = 30 * 1024 * 1024;

// Define the fields that every stored prompt must contain.
const promptShape = {
  id: z.string().min(1),
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
  isFavorite: z.boolean(),
  createdAt: z.number().finite(),
  updatedAt: z.number().finite(),
};

// Validate prompts loaded from local storage.
const StoredPromptSchema = z.object(promptShape);

// Imported prompts must contain exactly these fields.
const ImportPromptSchema = z.object(promptShape).strict();

// Validate user input before saving a prompt.
export const PromptInputSchema = z.object({
  id: z.string().min(1).max(100),
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().min(1).max(200_000),
  tags: z.array(z.string().trim().min(1).max(50)).max(30),
  isFavorite: z.boolean(),
});

const DeleteSchema = z.object({ id: z.string(), deletedAt: z.number().finite() });

export function parsePrompts(data: unknown): Prompt[] {
  // Ignore invalid top-level data instead of treating it as a prompt list.
  if (!Array.isArray(data)) return [];

  const result: Prompt[] = [];

  for (const item of data) {
    const parsed = StoredPromptSchema.safeParse(item);

    // Keep only prompts that match the expected structure.
    if (parsed.success) result.push(parsed.data);
  }

  return result;
}

// Sort prompts from newest to oldest.
const newestFirst = (a: Prompt, b: Prompt) => b.createdAt - a.createdAt;

async function readPrompts(): Promise<Prompt[]> {
  const data = await readJson("prompt.json");

  // Support both a direct array and an older object containing a prompts array.
  const list = Array.isArray(data) ? data : (data as { prompts?: unknown } | null)?.prompts;

  return parsePrompts(list).sort(newestFirst);
}

const writePrompts = (prompts: Prompt[]) => writeJson("prompt.json", [...prompts].sort(newestFirst));

async function readDeleted(): Promise<DeletePrompt[]> {
  const data = await readJson("deleted-prompts.json");

  if (!Array.isArray(data)) return [];

  return data.flatMap((item) => {
    const parsed = DeleteSchema.safeParse(item);

    // Skip invalid deletion records.
    return parsed.success ? [parsed.data] : [];
  });
}

const writeDeleted = (deleted: DeletePrompt[]) => writeJson("deleted-prompts.json", deleted);

function withTombstones(existing: DeletePrompt[], ids: string[], deletedAt: number): DeletePrompt[] {
  // Use a Map to keep one deletion record per prompt ID.
  const map = new Map(existing.map((d) => [d.id, d]));

  for (const id of ids) {
    map.set(id, { id, deletedAt });
  }

  return [...map.values()];
}

export const getPrompts = (): Promise<Prompt[]> => exclusive(readPrompts);

export const getDeletePrompts = (): Promise<DeletePrompt[]> =>
  exclusive(async () => (await readDeleted()).sort((a, b) => b.deletedAt - a.deletedAt));

export async function countDeletePrompts(): Promise<number> {
  return (await getDeletePrompts()).length;
}

export async function getPromptById(id: string): Promise<Prompt | undefined> {
  return (await getPrompts()).find((p) => p.id === id);
}

export async function getFavoritePrompts(): Promise<Prompt[]> {
  return (await getPrompts()).filter((p) => p.isFavorite);
}

export async function searchPrompts(query: string, onlyFavorites = false): Promise<Prompt[]> {
  const all = await getPrompts();

  // Filter favorites first so search only checks the selected prompts.
  const prompts = onlyFavorites ? all.filter((p) => p.isFavorite) : all;
  const text = query.trim();

  if (!text) return prompts;

  let keys: ("title" | "content" | "tags")[] = ["title", "content", "tags"];
  let term = text;

  // Use # to search tags only and @ to search titles only.
  if (text.startsWith("#")) {
    keys = ["tags"];
    term = text.slice(1);
  } else if (text.startsWith("@")) {
    keys = ["title"];
    term = text.slice(1);
  }

  term = term.trim().toLowerCase();

  if (!term) return prompts;

  // Fuse allows users to find prompts even when their search is not an exact match.
  const fuse = new Fuse(prompts, { keys, threshold: 0.3, ignoreLocation: true });

  return fuse
    .search(term)
    .map((result) => result.item)
    .sort(newestFirst);
}

export function createOrUpdatePrompt(prompt: PromptInput): Promise<void> {
  return exclusive(async () => {
    const prompts = await readPrompts();
    const existing = prompts.find((p) => p.id === prompt.id);
    const now = Date.now();

    // Keep the original creation time when updating an existing prompt.
    const updated: Prompt = { ...prompt, createdAt: existing?.createdAt ?? now, updatedAt: now };

    await writePrompts([...prompts.filter((p) => p.id !== prompt.id), updated]);

    const deleted = await readDeleted();

    // Remove the deletion record if this prompt has been saved again.
    if (deleted.some((d) => d.id === prompt.id)) {
      await writeDeleted(deleted.filter((d) => d.id !== prompt.id));
    }
  });
}

export function deletePrompt(id: string): Promise<void> {
  return exclusive(async () => {
    const prompts = await readPrompts();

    // Do nothing if the prompt does not exist.
    if (!prompts.some((p) => p.id === id)) return;

    // Record the deletion so cloud sync can remove this prompt too.
    await writeDeleted(withTombstones(await readDeleted(), [id], Date.now()));

    await writePrompts(prompts.filter((p) => p.id !== id));
  });
}

export function deleteAllPrompts(): Promise<void> {
  return exclusive(async () => {
    const prompts = await readPrompts();

    // Record every deleted ID so other synced devices can remove those prompts.
    await writeDeleted(
      withTombstones(
        await readDeleted(),
        prompts.map((p) => p.id),
        Date.now(),
      ),
    );

    await writePrompts([]);
  });
}

export function toggleFavorite(id: string): Promise<void> {
  return exclusive(async () => {
    const prompts = await readPrompts();
    const prompt = prompts.find((p) => p.id === id);

    if (!prompt) return;

    // Flip the favorite status and update the modification time.
    prompt.isFavorite = !prompt.isFavorite;
    prompt.updatedAt = Date.now();

    await writePrompts(prompts);
  });
}

export function clearDeletePrompts(): Promise<void> {
  return exclusive(() => writeDeleted([]));
}

export function clearDeletedBefore(time: number): Promise<void> {
  return exclusive(async () => {
    const deleted = await readDeleted();

    // Keep deletion records newer than the given timestamp.
    const kept = deleted.filter((d) => d.deletedAt > time);

    if (kept.length !== deleted.length) {
      await writeDeleted(kept);
    }
  });
}

export function mergePrompts(cloud: Prompt[]): Promise<void> {
  return exclusive(async () => {
    const local = await readPrompts();

    // Store deletion timestamps for quick lookup by prompt ID.
    const deleted = new Map((await readDeleted()).map((d) => [d.id, d.deletedAt]));

    const map = new Map(local.map((p) => [p.id, p]));
    let changed = false;

    for (const prompt of cloud) {
      const deletedAt = deleted.get(prompt.id);

      // Do not restore a prompt deleted locally after its cloud version changed.
      if (deletedAt !== undefined && deletedAt >= prompt.updatedAt) {
        continue;
      }

      const current = map.get(prompt.id);

      // Add new prompts or keep the version with the newer update time.
      if (!current || prompt.updatedAt > current.updatedAt) {
        map.set(prompt.id, prompt);
        changed = true;
      }
    }

    // Avoid rewriting the file when the merge makes no changes.
    if (changed) await writePrompts([...map.values()]);
  });
}

export async function exportToFile(filePath: string): Promise<void> {
  const prompts = await getPrompts();

  // Export prompts as readable JSON.
  await writeFile(filePath, JSON.stringify(prompts, null, 2), "utf-8");
}

export async function importFromFile(filePath: string, mode: ImportMode = "merge"): Promise<number> {
  const buffer = await readFile(filePath);

  // Reject large files before parsing them.
  if (buffer.byteLength > MAX_IMPORT_BYTES) {
    throw new Error("This file is too large to import (limit is 10 MB).");
  }

  let data: unknown;

  try {
    data = JSON.parse(buffer.toString("utf-8"));
  } catch (error) {
    // Include the error location when the JSON parser provides it.
    const location = error instanceof SyntaxError ? error.message.match(/line (\d+) column (\d+)/i) : null;

    const locationMessage = location ? ` near line ${location[1]}, column ${location[2]}` : "";

    throw new Error(
      `This file contains invalid JSON${locationMessage}. Check for missing commas, quotes, or brackets or missing required fields and try again. If you are trying to import a file from another app, make sure it is in the correct format.`,
      { cause: error },
    );
  }

  // Validate every imported prompt before changing local data.
  const result = z.array(ImportPromptSchema).safeParse(data);

  if (!result.success) {
    throw new Error("Invalid JSON: every prompt must contain exactly the required fields with valid values.");
  }

  const imported = result.data;
  const ids = new Set<string>();

  // Reject duplicate IDs to avoid overwriting prompts unpredictably.
  for (const prompt of imported) {
    if (ids.has(prompt.id)) {
      throw new Error(`Invalid JSON: duplicate prompt ID "${prompt.id}".`);
    }

    ids.add(prompt.id);
  }

  await exclusive(async () => {
    const existing = await readPrompts();
    const now = Date.now();
    let deleted = await readDeleted();

    // Imported prompts should no longer have deletion records.
    deleted = deleted.filter((d) => !ids.has(d.id));

    if (mode === "replace") {
      // Mark local prompts missing from the import as deleted for cloud sync.
      const removed = existing.filter((p) => !ids.has(p.id)).map((p) => p.id);

      await writeDeleted(withTombstones(deleted, removed, now));
      await writePrompts(imported);

      return;
    }

    // Merge by ID so existing prompts are updated instead of duplicated.
    const map = new Map(existing.map((p) => [p.id, p]));

    for (const prompt of imported) {
      const current = map.get(prompt.id);

      map.set(prompt.id, {
        ...prompt,

        // Preserve the original creation time when updating an existing prompt.
        createdAt: current?.createdAt ?? prompt.createdAt,

        // Keep the latest update timestamp.
        updatedAt: current ? Math.max(current.updatedAt, prompt.updatedAt) : prompt.updatedAt,
      });
    }

    await writeDeleted(deleted);
    await writePrompts([...map.values()]);
  });

  return imported.length;
}
