// scripts/write-oauth-config.mjs

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

// Read values from the .env file.
function readEnvFile() {
  try {
    const values = {};

    // Read the file line by line and find valid KEY=VALUE entries.
    for (const line of readFileSync(".env", "utf-8").split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);

      if (match) {
        // Remove surrounding quotes from the value, if present.
        values[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
      }
    }

    return values;
  } catch {
    // Return an empty object if the .env file is missing or unreadable.
    return {};
  }
}

const file = readEnvFile();

// Prefer the environment variable over the value in .env.
const clientId = process.env.GOOGLE_CLIENT_ID || file.GOOGLE_CLIENT_ID || "";

// Create the output folder if it does not exist.
mkdirSync("dist-electron", { recursive: true });

if (!clientId) {
  // Allow the build to continue, but warn that Google sign-in will not work.
  console.warn("[oauth] GOOGLE_CLIENT_ID is not set. The app builds, but Google sign-in will be unavailable.");
}

// Save the client ID as formatted JSON with restricted file permissions.
writeFileSync("dist-electron/oauth.json", JSON.stringify({ clientId }, null, 2), { mode: 0o600 });
