// src/electron/update.ts

import { app, dialog } from "electron";
import electronUpdater from "electron-updater";
import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";

const { autoUpdater } = electronUpdater;

export async function checkForUpdates() {
  // Only check for updates in the packaged application.
  if (!app.isPackaged) return;

  const lastCheckFile = path.join(app.getPath("userData"), "last-update-check.txt");

  // Store the date of the last check to avoid checking more than once a day.
  const today = new Date().toDateString();

  try {
    const lastCheck = await readFile(lastCheckFile, "utf8");

    // Skip the update check if it already ran today.
    if (lastCheck === today) return;
  } catch {
    // The file may not exist yet, so continue with the update check.
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("error", (err) => console.error("Updater error:", err));

  // Offer to restart once the update has finished downloading.
  autoUpdater.on("update-downloaded", async (info) => {
    const { response } = await dialog.showMessageBox({
      type: "info",
      buttons: ["Restart now", "Later"],
      defaultId: 0,
      cancelId: 1,
      title: "Update ready",
      message: `Version ${info.version} has been downloaded.`,
      detail: "Restart to apply the update. It will also install when you quit.",
    });
    if (response === 0) autoUpdater.quitAndInstall();
  });

  try {
    const result = await autoUpdater.checkForUpdates();

    // Save today's date only after the check succeeded.
    if (result) await writeFile(lastCheckFile, today);
  } catch (error) {
    console.error("Update check failed:", error);
  }
}
