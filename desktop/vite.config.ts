// vite.config.ts

import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";

// Add a Content Security Policy meta tag to the HTML during the build.
const csp: Plugin = {
  name: "inject-csp",
  apply: "build",

  // Insert the security policy at the beginning of the HTML <head>.
  transformIndexHtml: () => [
    {
      tag: "meta",
      attrs: {
        "http-equiv": "Content-Security-Policy",
        // Allow only local resources and block external connections.
        content:
          "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'",
      },
      injectTo: "head-prepend",
    },
  ],
};

export default defineConfig({
  plugins: [tailwindcss(), react(), csp],

  // Use relative paths so the build works from different locations.
  base: "./",

  build: {
    // Save the production build in the dist-react directory.
    outDir: "dist-react",
  },
});
