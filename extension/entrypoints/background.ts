// entrypoints/background.ts

import { SITE_INFO } from "@/config/site";
import { login } from "@/lib/auth";
import {
  getSyncSettings,
  saveSyncSettings,
  scheduleSync,
  SYNC_ALARM,
  syncNow,
} from "@/lib/sync";

export default defineBackground(() => {
  // Log a message when the extension is installed.
  browser.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === "install") {
      console.log(`${SITE_INFO.name} installed`);
    }
  });

  // Schedule background sync when the browser starts.
  browser.runtime.onStartup.addListener(scheduleSync);

  // Handle login requests from the popup.
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "login") return;

    // when the user clicks "Login with Google" in the popup, log them in and enable background sync.
    login()
      .then(() =>
        saveSyncSettings({
          isEnabled: true,
          runInBackground: true,
          syncIntervalInSecs: 300,
          lastSyncError: null,
        }),
      )
      .then(scheduleSync)
      .then(() => sendResponse({ ok: true }))
      .catch((err) => sendResponse({ error: err.message }));

    return true; // Keep the message channel open for the response.
  });

  // Run background sync when the scheduled alarm fires.
  browser.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name !== SYNC_ALARM) return;

    // Skip sync if it is disabled or background sync is off.
    const settings = await getSyncSettings();
    if (!settings.isEnabled || !settings.runInBackground) return;

    try {
      await syncNow();
    } catch {
      // The sync error is already saved in the settings.
    }
  });
});
