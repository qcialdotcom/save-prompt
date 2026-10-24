import { app } from "electron";
import electronUpdater from "electron-updater";
import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";

export async function checkForUpdates() {
  const lastCheckFile = path.join(app.getPath("userData"), "last-update-check.txt");

  const today = new Date().toDateString();

  try {
    const lastCheck = await readFile(lastCheckFile, "utf8");

    if (lastCheck === today) return;
  } catch {
    // No previous check exists.
  }

  try {
    await electronUpdater.autoUpdater.checkForUpdatesAndNotify();
    await writeFile(lastCheckFile, today);
  } catch (error) {
    console.error("Update check failed:", error);
  }
}
