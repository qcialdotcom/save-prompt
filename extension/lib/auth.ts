// lib/auth.ts
// Handle Google login for Drive sync without a client secret.
// Chrome uses its built-in token API, while Firefox opens Google's login page.

const SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/drive.appdata", // Access only this app's hidden Drive folder.
];

const KEY = "googleAuth"; // Storage key for the saved login details.

// Firefox needs a Web application OAuth client ID.
const FIREFOX_CLIENT_ID = (import.meta.env.WXT_FIREFOX_GOOGLE_CLIENT_ID ??
  import.meta.env.WXT_GOOGLE_CLIENT_ID) as string | undefined;

interface GoogleAuth {
  accessToken: string;
  expiresAt: number;
}

// Check whether the browser supports Chrome's token API.
const hasGetAuthToken = (): boolean =>
  typeof (globalThis as any).chrome?.identity?.getAuthToken === "function";

// Read the saved Google login details from browser storage.
async function getSaved(): Promise<GoogleAuth | undefined> {
  const data = await browser.storage.local.get(KEY);
  return data[KEY] as GoogleAuth | undefined;
}

// Save the token and calculate when it expires.
async function save(accessToken: string, expiresInSec: number) {
  await browser.storage.local.set({
    [KEY]: {
      accessToken,
      expiresAt: Date.now() + expiresInSec * 1000,
    },
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

  // Chrome can return the token directly or inside an object.
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

  // Open Google's login page and wait for the redirect.
  const redirectedTo = await browser.identity.launchWebAuthFlow({
    url: `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
    interactive,
  });

  if (!redirectedTo) throw new Error("Login was cancelled.");

  // Google returns the token in the URL fragment after the redirect.
  const result = new URLSearchParams(new URL(redirectedTo).hash.slice(1));
  const accessToken = result.get("access_token");

  if (!accessToken) throw new Error(result.get("error") ?? "Login failed.");

  await save(accessToken, Number(result.get("expires_in") ?? 3600));

  return accessToken;
}

// Start Google login. Set interactive to false to avoid opening a login page.
export async function login(interactive = true): Promise<string> {
  if (hasGetAuthToken()) {
    const token = await chromeToken(interactive);

    // Save a shorter expiry time so we refresh the token before it expires.
    await save(token, 50 * 60);

    return token;
  }

  return firefoxToken(interactive);
}

// Return the saved token or try to renew it before use.
export async function getAccessToken(): Promise<string> {
  const saved = await getSaved();

  if (!saved) throw new Error("Please sign in with Google first.");

  // Reuse the token if it has more than one minute left.
  if (saved.expiresAt - Date.now() > 60_000) return saved.accessToken;

  try {
    if (hasGetAuthToken()) {
      // Remove the old Chrome token so the next request gets a fresh one.
      await (globalThis as any).chrome.identity.removeCachedAuthToken({
        token: saved.accessToken,
      });
    }

    return await login(false);
  } catch {
    // Remove the expired session if silent login fails.
    await browser.storage.local.remove(KEY);
    throw new Error("Google session expired. Please sign in again.");
  }
}

// Sign out and ask Google to revoke the saved token.
export async function logout(): Promise<void> {
  const saved = await getSaved();

  await browser.storage.local.remove(KEY);

  if (!saved) return;

  if (hasGetAuthToken()) {
    // Remove the token from Chrome's cache.
    await (globalThis as any).chrome.identity
      .removeCachedAuthToken({ token: saved.accessToken })
      .catch(() => {});
  }

  // Ignore network errors because the local session is already cleared.
  fetch(
    `https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(saved.accessToken)}`,
    { method: "POST" },
  ).catch(() => {});
}
