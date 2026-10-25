// src/electron/ipc.ts

import { BrowserWindow, clipboard, dialog, ipcMain, type IpcMainInvokeEvent } from "electron";
import { pathToFileURL } from "node:url";
import { z } from "zod";
import * as auth from "../lib/auth.js";
import * as prompts from "../lib/prompts.js";
import * as sync from "../lib/sync.js";

// Use the same response format for successful and failed requests.
type Reply<T> = { ok: true; data: T } | { ok: false; error: string };

// Return a readable error message without exposing unknown error details.
const toMessage = (error: unknown) => (error instanceof Error ? error.message : "Something went wrong.");

function isTrusted(event: IpcMainInvokeEvent, indexPath: string): boolean {
  // Allow requests only from the expected app page.
  const url = event.senderFrame?.url;
  return !!url && url.split(/[?#]/)[0] === pathToFileURL(indexPath).href;
}

export function registerIpc(indexPath: string): void {
  // Register a handler that validates requests and catches errors.
  function handle<A extends unknown[], R>(
    channel: string,
    schema: z.ZodType<A>,
    run: (args: A, event: IpcMainInvokeEvent) => Promise<R> | R,
  ): void {
    ipcMain.handle(channel, async (event, ...raw): Promise<Reply<R>> => {
      // Reject requests from pages outside the trusted app.
      if (!isTrusted(event, indexPath)) return { ok: false, error: "Request blocked." };

      // Check the incoming arguments before running the requested action.
      const parsed = schema.safeParse(raw);
      if (!parsed.success) return { ok: false, error: "Invalid request." };

      try {
        return { ok: true, data: await run(parsed.data, event) };
      } catch (error) {
        return { ok: false, error: toMessage(error) };
      }
    });
  }

  // Schemas for requests that need no arguments or one string ID.
  const none = z.tuple([]);
  const id = z.tuple([z.string().min(1).max(100)]);

  // Find the window that sent the request, if it still exists.
  const windowOf = (event: IpcMainInvokeEvent) => BrowserWindow.fromWebContents(event.sender) ?? undefined;

  // Search prompts using a query and an optional favorites filter.
  handle("prompts:search", z.tuple([z.string().max(500), z.boolean()]), ([query, onlyFavorites]) =>
    prompts.searchPrompts(query, onlyFavorites),
  );

  // Create a new prompt or update an existing one.
  handle("prompts:save", z.tuple([prompts.PromptInputSchema]), ([prompt]) => prompts.createOrUpdatePrompt(prompt));

  // Delete a prompt by its ID.
  handle("prompts:delete", id, ([promptId]) => prompts.deletePrompt(promptId));

  // Add or remove a prompt from favorites.
  handle("prompts:toggleFavorite", id, ([promptId]) => prompts.toggleFavorite(promptId));

  // Delete all saved prompts.
  handle("prompts:deleteAll", none, () => prompts.deleteAllPrompts());

  // Copy text to the system clipboard, with a size limit.
  handle("clipboard:write", z.tuple([z.string().max(1_000_000)]), ([text]) => clipboard.writeText(text));

  // Let the user choose where to save the exported prompts.
  handle("data:export", none, async (_args, event) => {
    const options = { title: "Export prompts", defaultPath: "prompts.json", filters: [{ name: "JSON", extensions: ["json"] }] };

    const win = windowOf(event);
    const result = win ? await dialog.showSaveDialog(win, options) : await dialog.showSaveDialog(options);

    // Stop if the user cancels or does not select a file.
    if (result.canceled || !result.filePath) return { saved: false };

    await prompts.exportToFile(result.filePath);
    return { saved: true };
  });

  // Let the user choose a JSON file and decide how to import its prompts.
  handle("data:import", z.tuple([z.enum(["merge", "replace"])]), async ([mode], event) => {
    const options = {
      title: "Import prompts",
      properties: ["openFile" as const],
      filters: [{ name: "JSON", extensions: ["json"] }],
    };

    const win = windowOf(event);
    const result = win ? await dialog.showOpenDialog(win, options) : await dialog.showOpenDialog(options);

    const file = result.filePaths[0];

    // Do nothing if the user cancels or selects no file.
    if (result.canceled || !file) return null;

    return { count: await prompts.importFromFile(file, mode) };
  });

  // Get the number of deleted prompts and check if any need syncing.
  handle("trash:info", none, async () => {
    const [deleted, settings] = await Promise.all([prompts.getDeletePrompts(), sync.getSyncSettings()]);

    return { count: deleted.length, hasUnsynced: deleted.some((d) => d.deletedAt > settings.lastSyncedAt) };
  });

  // Permanently remove all deleted prompts.
  handle("trash:empty", none, () => prompts.clearDeletePrompts());

  // Return the current Google login status and account email.
  handle("auth:status", none, async () => ({ loggedIn: await auth.isLoggedIn(), email: await auth.getAccountEmail() }));

  // Sign in with Google, enable cloud sync, and schedule it.
  handle("auth:login", none, async () => {
    await auth.login();

    await sync.saveSyncSettings({ isEnabled: true, runInBackground: true, syncIntervalInSecs: 300, lastSyncError: null });

    await sync.scheduleSync();
  });

  // Cancel an ongoing Google login.
  handle("auth:cancel", none, () => auth.cancelLogin());

  // Sign out, turn off cloud sync, and update the sync schedule.
  handle("auth:logout", none, async () => {
    await auth.logout();
    await sync.saveSyncSettings({ isEnabled: false });
    await sync.scheduleSync();
  });

  // Return the current cloud sync settings.
  handle("sync:getSettings", none, () => sync.getSyncSettings());

  // Validate settings before allowing the renderer to change them.
  const SettingsChanges = z.strictObject({
    isEnabled: z.boolean().optional(),
    runInBackground: z.boolean().optional(),
    syncIntervalInSecs: z.number().int().min(60).max(3600).optional(),
  });

  // Save updated settings and apply the new sync schedule.
  handle("sync:saveSettings", z.tuple([SettingsChanges]), async ([changes]) => {
    const settings = await sync.saveSyncSettings(changes);
    await sync.scheduleSync();
    return settings;
  });

  // Run a sync only when cloud sync is enabled.
  handle("sync:now", none, async () => {
    if (!(await sync.getSyncSettings()).isEnabled) {
      throw new Error("Cloud sync is turned off in Settings.");
    }

    await sync.syncNow();
  });

  // Reset the cloud sync data.
  handle("sync:reset", none, () => sync.resetCloud());
}

// Tell every open window when the saved prompts have changed.
export function notifyPromptsChanged(): void {
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send("prompts:changed");
  }
}
