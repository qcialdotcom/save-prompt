// src/electron/storage.ts

import { app } from "electron";
import path from "node:path";
import { readFile, writeFile, mkdir, rename, rm } from "node:fs/promises";

export type StoreFile = "settings.json" | "prompt.json" | "deleted-prompts.json";

const dir = () => app.getPath("userData");

// Return an empty object for settings and an empty array for other files.
const fallback = (file: StoreFile) => (file === "settings.json" ? {} : []);

export async function readJson(file: StoreFile): Promise<unknown> {
  const full = path.join(dir(), file);
  let text: string;

  try {
    text = await readFile(full, "utf-8");
  } catch {
    // Return default data if the file does not exist or cannot be read.
    return fallback(file);
  }

  try {
    return JSON.parse(text);
  } catch {
    // Keep a copy of invalid JSON so the data can be inspected later.
    await rename(full, `${full}.corrupt-${Date.now()}`).catch(() => {});

    return fallback(file);
  }
}

export async function writeJson(file: StoreFile, data: unknown): Promise<void> {
  const full = path.join(dir(), file);
  const tmp = `${full}.tmp`;

  // Create the storage directory if it does not exist.
  await mkdir(dir(), { recursive: true });

  try {
    // Write to a temporary file before replacing the original.
    await writeFile(tmp, JSON.stringify(data, null, 2), { mode: 0o600 });

    // Replace the original file after the temporary file is written.
    await rename(tmp, full);
  } catch (error) {
    // Remove the temporary file if writing or renaming fails.
    await rm(tmp, { force: true }).catch(() => {});
    throw error;
  }
}

let queue: Promise<unknown> = Promise.resolve();

// To prevent deadlocks run each task after the previous one to avoid overlapping operations
export function exclusive<T>(task: () => Promise<T>): Promise<T> {
  // Run each task after the previous one to prevent overlapping operations.
  const run = queue.then(task);

  // Keep the queue running even if a task fails.
  queue = run.catch(() => {});

  return run;
}
