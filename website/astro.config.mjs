import { SITE_INFO } from "@/configs/site";
import robotsTxt from "astro-robots-txt";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";

export default defineConfig({
  site: SITE_INFO.url,

  vite: {
    plugins: [tailwindcss()],
    resolve: { alias: { "@": new URL("./src", import.meta.url).pathname } },
  },

  env: {
    schema: {
      PUBLIC_FRONTEND_URL: envField.string({
        context: "client",
        access: "public",
        default: SITE_INFO.url,
      }),

      PUBLIC_SITE_NAME: envField.string({
        context: "client",
        access: "public",
        default: SITE_INFO.name,
      }),
    },
  },

  integrations: [sitemap(), robotsTxt()],
});
