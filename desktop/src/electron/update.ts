// src/electron/update.ts

import { app } from "electron";
import electronUpdater from "electron-updater";
import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";

export async function checkForUpdates() {
  // Only check for updates in the packaged application.
  if (!app.isPackaged) return;

  const lastCheckFile = path.join(
    app.getPath("userData"),
    "last-update-check.txt",
  );

  // Store the date of the last check to avoid checking more than once a day.
  const today = new Date().toDateString();

  try {
    const lastCheck = await readFile(lastCheckFile, "utf8");

    // Skip the update check if it already ran today.
    if (lastCheck === today) return;
  } catch {
    // The file may not exist yet, so continue with the update check.
  }

  try {
    // Check for updates and notify the user if one is available.
    await electronUpdater.autoUpdater.checkForUpdatesAndNotify();

    // Save today's date after the check completes successfully.
    await writeFile(lastCheckFile, today);
  } catch (error) {
    console.error("Update check failed:", error);
  }
}
