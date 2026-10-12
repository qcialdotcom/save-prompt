// lib/prompts.ts

import Fuse from "fuse.js";

export interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
  isCloudSynced: boolean;
}

const KEY = "prompts";

// Get all prompts (newest first)
export async function getPrompts(): Promise<Prompt[]> {
  const data = await browser.storage.local.get(KEY);
  const prompts = (data[KEY] as Prompt[] | undefined) ?? [];
  return prompts.sort((a, b) => b.createdAt - a.createdAt);
}

// Get one prompt by id
export async function getPromptById(id: string): Promise<Prompt | undefined> {
  const prompts = await getPrompts();
  return prompts.find((p) => p.id === id);
}

// Add a new prompt, or update it if the id already exists
// If the prompt is updated or created, set isCloudSynced to false
// You only pass: id, title, content, tags, isFavorite.
export async function createOrUpdatePrompt(
  prompt: Omit<Prompt, "createdAt" | "updatedAt" | "isCloudSynced">,
) {
  const prompts = await getPrompts();
  const existing = prompts.find((p) => p.id === prompt.id);
  const others = prompts.filter((p) => p.id !== prompt.id);
  const now = Date.now();

  const updated: Prompt = {
    ...prompt,
    createdAt: existing?.createdAt ?? now, // new: same as updatedAt, existing: keep the old one
    updatedAt: now,
    isCloudSynced: false,
  };

  await browser.storage.local.set({ [KEY]: [...others, updated] });
}

// Delete a prompt
export async function deletePrompt(id: string) {
  const prompts = await getPrompts();
  await browser.storage.local.set({
    [KEY]: prompts.filter((p) => p.id !== id),
  });
}

// Delete all prompts
export async function deleteAllPrompts() {
  await browser.storage.local.set({ [KEY]: [] });
}

// Toggle favorite status of a prompt
export async function toggleFavorite(id: string) {
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

  // Empty search → return everything
  if (!text) return prompts;

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
