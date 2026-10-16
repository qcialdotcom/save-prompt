// wxt.config.ts

import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

// Keep the Chrome extension ID stable across development builds. This is the
// public half of the extension key and is safe to include in the manifest.
const CHROME_EXTENSION_KEY =
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAogwYsICavw9UjWvWz73X6JQ5iNjK3I6aRU3Tr9TBNoJqDKurs8hmwOE7HslGO6268FQAzQbxdiHxjYhrKYLQh2l2l0f3bw4qk1Dr5oF0i3BdrEXLTO0y8ssYhWSj8JXWIfKKXXNjcummLcxGT7vYiqCxwcAvekmI3jLJHcjr/dQQGuvoSwvNzHS6iOMRX+SeGYRk8JSd72O8Rre8VSRGcmkFMb6JpNzNc/xRge1MTSqsKJuDvpCIyS9pC+ZUbwPqgc9zTd22kcNVUmCbY5DSzdix+SpCrURAizF+eXxNchMyOZ9mxrK+v3/FEN5Z9fvcXSr2g+XpH4INYSa/gpU//wIDAQAB";

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
    ...(browser === "chrome" && { key: CHROME_EXTENSION_KEY }),
    ...(browser === "firefox" && {
      browser_specific_settings: {
        gecko: {
          id: "save-prompt@qcial.com",
          strict_min_version: "115.0",
          data_collection_permissions: {
            required: ["none"],
          },
        },
      },
    }),
  }),
});
