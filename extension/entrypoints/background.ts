// entrypoints/background.ts

import { SITE_INFO } from "@/config/site";

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === "install") {
      console.log(`${SITE_INFO.name} installed`);
    }
  });
});
