// lib/prompts.ts

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
export async function saveOrUpdatePrompt(prompt: Prompt) {
  const prompts = await getPrompts();
  const others = prompts.filter((p) => p.id !== prompt.id);
  await browser.storage.local.set({ [KEY]: [...others, prompt] });
}

// Delete a prompt
export async function deletePrompt(id: string) {
  const prompts = await getPrompts();
  await browser.storage.local.set({
    [KEY]: prompts.filter((p) => p.id !== id),
  });
}
