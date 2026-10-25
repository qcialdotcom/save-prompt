// src/lib/auth.ts

import { app, shell, safeStorage } from "electron";
import http from "node:http";
import crypto from "node:crypto";
import path from "node:path";
import { readFileSync } from "node:fs";
import { readFile, writeFile, rename, rm, mkdir } from "node:fs/promises";
import { z } from "zod";

// Google permissions required for sign-in and app-specific Drive storage.
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.appdata";
const SCOPES = ["openid", "email", "profile", DRIVE_SCOPE];

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const REVOKE_URL = "https://oauth2.googleapis.com/revoke";
const USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

// Use a local server to receive Google's login response.
const PORT = 42813;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;
const LOGIN_TIMEOUT_MS = 3 * 60 * 1000; // Stop waiting after 3 minutes.
const REQUEST_TIMEOUT_MS = 15_000; // Stop network requests after 15 seconds.
const EXPIRY_MARGIN_MS = 60_000; // Treat tokens expiring within a minute as expired.

interface OAuthConfig {
  clientId: string;
}

let config: OAuthConfig | undefined;

// used to load the Google OAuth client ID from either an environment 
// variable or a bundled config file.
function getConfig(): OAuthConfig {
  // Reuse the config if it has already been loaded.
  if (config) return config;

  let clientId = process.env.GOOGLE_CLIENT_ID;

  // If the environment variable is missing, try the bundled config file.
  if (!clientId) {
    try {
      const file = JSON.parse(
        readFileSync(path.join(app.getAppPath(), "dist-electron", "oauth.json"), "utf-8"),
      ) as Partial<OAuthConfig>;
      clientId = file.clientId;
    } catch {}
  }

  if (!clientId) {
    throw new Error("Google OAuth client ID is not available.");
  }

  config = { clientId };
  return config;
}

// Check saved login data before using it.
const SessionSchema = z.object({
  accessToken: z.string(),
  expiresAt: z.number().finite(),
  scope: z.string().optional(),
  email: z.string().optional(),
});

type Session = z.infer<typeof SessionSchema>;

// Store login data in the app's user data folder.
const sessionFile = () => path.join(app.getPath("userData"), "google-auth.bin");

let memory: Session | undefined;

function canEncrypt(): boolean {
  // Do not save tokens to disk if secure storage is unavailable.
  if (!safeStorage.isEncryptionAvailable()) return false;

  // Linux's basic_text backend does not provide secure encryption.
  if (process.platform === "linux" && safeStorage.getSelectedStorageBackend?.() === "basic_text") {
    return false;
  }

  return true;
}

async function getSaved(): Promise<Session | undefined> {
  // Avoid reading and decrypting the file again during this app session.
  if (memory) return memory;

  await app.whenReady();

  let encrypted: Buffer;

  try {
    encrypted = await readFile(sessionFile());
  } catch {
    // No saved session means the user needs to sign in.
    return undefined;
  }

  try {
    // Decrypt the file and check that its contents match the expected format.
    memory = SessionSchema.parse(JSON.parse(safeStorage.decryptString(encrypted)));
    return memory;
  } catch {
    // Remove the file if its data cannot be decrypted or validated.
    await rm(sessionFile(), { force: true });
    return undefined;
  }
}

async function save(session: Session): Promise<void> {
  await app.whenReady();

  // Keep the session in memory even if secure disk storage is unavailable.
  memory = session;

  if (!canEncrypt()) {
    await rm(sessionFile(), { force: true });
    return;
  }

  await mkdir(path.dirname(sessionFile()), { recursive: true });

  // Write to a temporary file first, then replace the old file.
  const tmp = `${sessionFile()}.tmp`;
  await writeFile(tmp, safeStorage.encryptString(JSON.stringify(session)), { mode: 0o600 });
  await rename(tmp, sessionFile());
}

async function removeSaved(): Promise<void> {
  // Clear both the in-memory session and the saved file.
  memory = undefined;
  await rm(sessionFile(), { force: true });
}

export async function isLoggedIn(): Promise<boolean> {
  return !!(await getSaved());
}

export async function getAccountEmail(): Promise<string | undefined> {
  return (await getSaved())?.email;
}

// Track the current login so duplicate requests do not open multiple login flows.
let cancelActiveLogin: (() => void) | undefined;
let loginInFlight: Promise<void> | undefined;

const baseHeaders = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};

function waitForRedirect(state: string): Promise<URLSearchParams> {
  return new Promise((resolve, reject) => {
    let settled = false;

    const server = http.createServer((req, res) => {
      const hostOk = req.headers.host === `127.0.0.1:${PORT}`;
      const url = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`);

      // Accept only GET requests sent to the expected local address.
      if (req.method !== "GET" || !hostOk) {
        res.writeHead(404, baseHeaders).end();
        return;
      }

      if (url.pathname === "/callback") {
        // Use a random nonce to allow only the script needed on this page.
        const nonce = crypto.randomBytes(16).toString("base64");

        res.writeHead(200, { ...baseHeaders, "Content-Security-Policy": `default-src 'none'; script-src 'nonce-${nonce}'` });
        res.end(
          `<!doctype html><title>Signing in…</title><p>Signing in…</p>
<script nonce="${nonce}">location.replace("/done?" + location.hash.slice(1));</script>`,
        );
        return;
      }

      if (url.pathname === "/done") {
        // Check that this response belongs to the login request we started.
        if (url.searchParams.get("state") !== state) {
          res
            .writeHead(400, { ...baseHeaders, "Content-Security-Policy": "default-src 'none'" })
            .end("<!doctype html><title>Error</title><p>Invalid login request.</p>");
          return;
        }

        const ok = url.searchParams.has("access_token");

        res.writeHead(ok ? 200 : 400, { ...baseHeaders, "Content-Security-Policy": "default-src 'none'" });
        res.end(
          ok
            ? "<!doctype html><title>Signed in</title><p>Signed in. You can close this tab and return to the app.</p>"
            : "<!doctype html><title>Login failed</title><p>Login failed. You can close this tab and try again.</p>",
        );

        // Return Google's response to the code that started the login.
        finish(() => resolve(url.searchParams));
        return;
      }

      res.writeHead(404, baseHeaders).end();
    });

    // Prevent the local server from waiting forever.
    const timer = setTimeout(() => finish(() => reject(new Error("Login timed out."))), LOGIN_TIMEOUT_MS);

    function finish(fn: () => void) {
      // Complete the login only once, even if several events happen together.
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      cancelActiveLogin = undefined;
      server.close();
      server.closeAllConnections?.();
      fn();
    }

    cancelActiveLogin = () => finish(() => reject(new Error("Login was cancelled.")));

    server.on("error", (err: NodeJS.ErrnoException) =>
      finish(() =>
        reject(
          new Error(
            err.code === "EADDRINUSE" ? `Port ${PORT} is busy. Close the other login window and try again.` : err.message,
          ),
        ),
      ),
    );

    server.listen(PORT, "127.0.0.1");
  });
}

async function runLogin(): Promise<void> {
  const { clientId } = getConfig();

  // Generate a random value to verify the login response.
  const state = crypto.randomBytes(24).toString("base64url");

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "token",
    redirect_uri: REDIRECT_URI,
    scope: SCOPES.join(" "),
    prompt: "select_account",
    state,
  });

  // Start listening before opening the browser so the response is not missed.
  const waiting = waitForRedirect(state);
  waiting.catch(() => {});

  await shell.openExternal(`${AUTH_URL}?${params}`);

  const result = await waiting;
  const accessToken = result.get("access_token");

  if (!accessToken) {
    throw new Error(result.get("error") === "access_denied" ? "Login was cancelled." : (result.get("error") ?? "Login failed."));
  }

  // Reject the login if Google Drive access was not granted.
  if (!result.get("scope")?.split(" ").includes(DRIVE_SCOPE)) {
    await revokeToken(accessToken);
    throw new Error("Google Drive permission was not granted. Sign in again and allow access to the app data.");
  }

  const session: Session = {
    accessToken,
    expiresAt: Date.now() + (Number(result.get("expires_in")) || 3600) * 1000,
    scope: result.get("scope") ?? undefined,
  };

  // Fetch the account email for display in the app.
  try {
    const res = await fetch(USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (res.ok) session.email = ((await res.json()) as { email?: string }).email;
  } catch {}

  await save(session);
}

export function login(): Promise<void> {
  // Return the existing login task if one is already running.
  loginInFlight ??= runLogin().finally(() => {
    loginInFlight = undefined;
  });
  return loginInFlight;
}

export function cancelLogin(): void {
  // Stop the active login request, if there is one.
  cancelActiveLogin?.();
}

export async function getAccessToken(): Promise<string> {
  const saved = await getSaved();

  if (!saved) throw new Error("Please sign in with Google first.");

  // Return the token only if it will remain valid for at least one more minute.
  if (saved.expiresAt - Date.now() > EXPIRY_MARGIN_MS) return saved.accessToken;

  await removeSaved();
  throw new Error("Google session expired. Please sign in again.");
}

async function revokeToken(token: string): Promise<void> {
  // Ask Google to revoke the token so it can no longer be used.
  try {
    await fetch(REVOKE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {}
}

export async function logout(): Promise<void> {
  cancelLogin();

  const saved = await getSaved();

  // Remove local login data before revoking the Google token.
  await removeSaved();

  if (saved) await revokeToken(saved.accessToken);
}
