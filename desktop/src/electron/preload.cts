// src/electron/preload.cts

import { contextBridge, ipcRenderer } from "electron";
import type { Api } from "../shared/api.js";

type Reply = { ok: true; data: unknown } | { ok: false; error: string };

async function call(channel: string, ...args: unknown[]): Promise<never> {
  // Send a request to the main process and wait for its response.
  const reply = (await ipcRenderer.invoke(channel, ...args)) as Reply;

  // Convert failed responses into errors the frontend can catch.
  if (!reply.ok) throw new Error(reply.error);

  return reply.data as never;
}

const api: Api = {
  searchPrompts: (query, onlyFavorites) => call("prompts:search", query, onlyFavorites),
  savePrompt: (prompt) => call("prompts:save", prompt),
  deletePrompt: (id) => call("prompts:delete", id),
  toggleFavorite: (id) => call("prompts:toggleFavorite", id),
  deleteAllPrompts: () => call("prompts:deleteAll"),
  copyText: (text) => call("clipboard:write", text),

  exportPrompts: () => call("data:export"),
  importPrompts: (mode) => call("data:import", mode),

  getTrashInfo: () => call("trash:info"),
  emptyTrash: () => call("trash:empty"),

  getAuthStatus: () => call("auth:status"),
  login: () => call("auth:login"),
  cancelLogin: () => call("auth:cancel"),
  logout: () => call("auth:logout"),

  getSyncSettings: () => call("sync:getSettings"),
  saveSyncSettings: (changes) => call("sync:saveSettings", changes),
  syncNow: () => call("sync:now"),
  resetCloud: () => call("sync:reset"),

  onPromptsChanged: (callback) => {
    // Listen for prompt changes sent by the main process.
    const listener = () => callback();
    ipcRenderer.on("prompts:changed", listener);

    // Return a cleanup function so the frontend can remove the listener.
    return () => {
      ipcRenderer.removeListener("prompts:changed", listener);
    };
  },
};

// Expose only the approved API to the React frontend.
contextBridge.exposeInMainWorld("api", api);
