// lib/auth.ts
// Google login for Drive sync, no client secret.
// - Chrome: uses chrome.identity.getAuthToken with the "Chrome Extension"
//   OAuth client declared in the manifest (wxt.config.ts -> oauth2.client_id).
// - Firefox: uses launchWebAuthFlow with a "Web application" OAuth client.

const SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/drive.appdata", // Hidden app folder only.
];
const KEY = "googleAuth"; // Key used to store login details locally.

// Firefox only: a Web application client ID (needs redirect URI registered).
const FIREFOX_CLIENT_ID = (import.meta.env.WXT_FIREFOX_GOOGLE_CLIENT_ID ??
  import.meta.env.WXT_GOOGLE_CLIENT_ID) as string | undefined;

interface GoogleAuth {
  accessToken: string;
  expiresAt: number;
}

// Chrome exposes getAuthToken; Firefox does not.
const hasGetAuthToken = (): boolean =>
  typeof (globalThis as any).chrome?.identity?.getAuthToken === "function";

async function getSaved(): Promise<GoogleAuth | undefined> {
  const data = await browser.storage.local.get(KEY);
  return data[KEY] as GoogleAuth | undefined;
}

async function save(accessToken: string, expiresInSec: number) {
  await browser.storage.local.set({
    [KEY]: { accessToken, expiresAt: Date.now() + expiresInSec * 1000 },
  });
}

export async function isLoggedIn(): Promise<boolean> {
  return !!(await getSaved());
}

// ---------- Chrome ----------
async function chromeToken(interactive: boolean): Promise<string> {
  const chromeApi = (globalThis as any).chrome;
  const result = await chromeApi.identity.getAuthToken({
    interactive,
    scopes: SCOPES,
  });
  const token: string | undefined =
    typeof result === "string" ? result : result?.token;
  if (!token) throw new Error("Login was cancelled.");
  return token;
}

// ---------- Firefox ----------
async function firefoxToken(interactive: boolean): Promise<string> {
  if (!FIREFOX_CLIENT_ID)
    throw new Error("Google client ID is missing in .env");

  const params = new URLSearchParams({
    client_id: FIREFOX_CLIENT_ID,
    response_type: "token",
    redirect_uri: browser.identity.getRedirectURL(),
    scope: SCOPES.join(" "),
    prompt: interactive ? "select_account" : "none",
  });

  const redirectedTo = await browser.identity.launchWebAuthFlow({
    url: `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
    interactive,
  });
  if (!redirectedTo) throw new Error("Login was cancelled.");

  const result = new URLSearchParams(new URL(redirectedTo).hash.slice(1));
  const accessToken = result.get("access_token");
  if (!accessToken) throw new Error(result.get("error") ?? "Login failed.");

  await save(accessToken, Number(result.get("expires_in") ?? 3600));
  return accessToken;
}

// Open Google login. Set interactive=false to try logging in silently.
export async function login(interactive = true): Promise<string> {
  if (hasGetAuthToken()) {
    const token = await chromeToken(interactive);
    await save(token, 50 * 60); // Chrome tokens last ~1h; renew a bit early.
    return token;
  }
  return firefoxToken(interactive);
}

// Return a valid token or renew it silently if it is about to expire.
export async function getAccessToken(): Promise<string> {
  const saved = await getSaved();
  if (!saved) throw new Error("Please sign in with Google first.");

  if (saved.expiresAt - Date.now() > 60_000) return saved.accessToken;

  try {
    // Drop Chrome's cached copy so we get a fresh token.
    if (hasGetAuthToken()) {
      await (globalThis as any).chrome.identity.removeCachedAuthToken({
        token: saved.accessToken,
      });
    }
    return await login(false);
  } catch {
    await browser.storage.local.remove(KEY);
    throw new Error("Google session expired. Please sign in again.");
  }
}

// Sign out: clear saved token and revoke it.
export async function logout(): Promise<void> {
  const saved = await getSaved();
  await browser.storage.local.remove(KEY);
  if (!saved) return;

  if (hasGetAuthToken()) {
    await (globalThis as any).chrome.identity
      .removeCachedAuthToken({ token: saved.accessToken })
      .catch(() => {});
  }
  fetch(
    `https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(saved.accessToken)}`,
    { method: "POST" },
  ).catch(() => {});
}
