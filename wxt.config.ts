import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: ({ browser }) => ({
    name: "Save Prompt",
    description:
      "Save, organize, and sync your AI prompts with local storage and cloud sync.",
    permissions: ["storage", "clipboardWrite", "unlimitedStorage"],
    ...(browser === "firefox" && {
      browser_specific_settings: {
        gecko: {
          id: "save-prompt@qcial.com",
          strict_min_version: "115.0",
        },
      },
    }),
  }),
});
