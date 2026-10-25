// src/electron/main.ts

import { app, BrowserWindow, session, shell } from "electron";
import path from "node:path";
import { registerIpc, notifyPromptsChanged } from "./ipc.js";
import { startScheduler, stopScheduler } from "../lib/sync.js";
import { checkForUpdates } from "./update.js";

const indexPath = path.join(app.getAppPath(), "dist-react", "index.html");

function openExternal(url: string): void {
  // Open only HTTPS links in the user's default browser.
  try {
    if (new URL(url).protocol === "https:") void shell.openExternal(url);
  } catch {}
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 400,
    height: 500,
    resizable: false,
    maximizable: false,
    minimizable: true,
    fullscreenable: false,
    autoHideMenuBar: true,
    frame: true,
    show: false,
    title: "Save Prompt",
    webPreferences: {
      // Load the preload script that safely connects the UI to Electron.
      preload: path.join(import.meta.dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      devTools: !app.isPackaged,
      spellcheck: false,
    },
  });

  win.removeMenu();

  // Show the window after its page is ready to avoid a blank screen.
  win.once("ready-to-show", () => win.show());

  void win.loadFile(indexPath);
};

// Allow only one app instance at a time.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  // Focus the existing window when the user opens the app again.
  app.on("second-instance", () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (!win) return;

    if (win.isMinimized()) win.restore();
    win.focus();
  });

  app.on("web-contents-created", (_event, contents) => {
    // Open new-window links externally instead of creating Electron windows.
    contents.setWindowOpenHandler(({ url }) => {
      openExternal(url);
      return { action: "deny" };
    });

    // Prevent the app page from navigating to another website.
    contents.on("will-navigate", (event, url) => {
      event.preventDefault();
      openExternal(url);
    });

    // Block webviews because the app does not need them.
    contents.on("will-attach-webview", (event) => event.preventDefault());
  });

  app.whenReady().then(async () => {
    app.setAppUserModelId("com.qcial.saveprompt");

    // Deny website permission requests and permission checks.
    session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
    session.defaultSession.setPermissionCheckHandler(() => false);

    // Register UI actions and create the main application window.
    registerIpc(indexPath);
    createWindow();

    // Start background syncing and check for app updates.
    await startScheduler(notifyPromptsChanged);
    void checkForUpdates();

    // Recreate the window if the app is activated without one.
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  // Keep the app running on macOS when all windows are closed.
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });

  // Stop the background sync scheduler before the app exits.
  app.on("before-quit", stopScheduler);
}
