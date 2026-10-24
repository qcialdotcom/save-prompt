import { app } from "electron";
import path from "node:path";
import { readFile, writeFile, mkdir } from "node:fs/promises";

const dir = app.getPath("userData");

export async function readJson(file: "settings.json" | "prompt.json" | "deleted-prompts.json") {
  try {
    return JSON.parse(await readFile(path.join(dir, file), "utf-8"));
  } catch {
    return file === "settings.json" ? {} : [];
  }
}

export async function writeJson(file: "settings.json" | "prompt.json" | "deleted-prompts.json", data: unknown) {
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, file), JSON.stringify(data, null, 2));
}
