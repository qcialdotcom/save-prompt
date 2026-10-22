import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";
import { loadEnv } from "vite";

// Stable Chrome extension ID.
const CHROME_EXTENSION_KEY = loadEnv(
  process.env.NODE_ENV ?? "development",
  process.cwd(),
  "WXT_CHROME_EXTENSION_KEY",
).WXT_CHROME_EXTENSION_KEY;

// Stable Firefox extension ID.
const FIREFOX_EXTENSION_ID = loadEnv(
  process.env.NODE_ENV ?? "development",
  process.cwd(),
  "WXT_FIREFOX_EXTENSION_ID",
).WXT_FIREFOX_EXTENSION_ID;

// Load WXT-prefixed environment variables.
const env = loadEnv(
  process.env.NODE_ENV ?? "development",
  process.cwd(),
  "WXT_",
);

// Google OAuth client ID.
const GOOGLE_CLIENT_ID =
  process.env.WXT_GOOGLE_CLIENT_ID ?? env.WXT_GOOGLE_CLIENT_ID;

const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/drive.appdata",
];

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  webExt: {
    chromiumArgs: ["--no-sandbox", "--ozone-platform=x11"],
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: ({ browser }) => ({
    name: "Save Prompt",
    description:
      "Save, organize, and sync your AI prompts with local storage and cloud sync.",
    permissions: [
      "storage",
      "clipboardWrite",
      "unlimitedStorage",
      "identity",
      "alarms",
    ],
    ...(browser === "chrome" && {
      key: CHROME_EXTENSION_KEY,
      ...(GOOGLE_CLIENT_ID && {
        oauth2: {
          client_id: GOOGLE_CLIENT_ID,
          scopes: GOOGLE_SCOPES,
        },
      }),
    }),
    ...(browser === "firefox" && {
      browser_specific_settings: {
        gecko: {
          id: FIREFOX_EXTENSION_ID,
          strict_min_version: "140.0",
          data_collection_permissions: {
            required: ["none"],
          },
        },
      },
    }),
  }),
});
