// lib/auth.ts
// Handles Google login for Drive sync without a client secret.
// Access tokens last about 1 hour and can be renewed silently.

// Public Google OAuth client ID from the .env file.
const CLIENT_ID = import.meta.env.WXT_GOOGLE_CLIENT_ID as string | undefined;
const SCOPE = "https://www.googleapis.com/auth/drive.appdata"; // Access only the app's hidden Drive folder.
const KEY = "googleAuth"; // Key used to store login details locally.

interface GoogleAuth {
  accessToken: string;
  expiresAt: number;
}

// Read saved Google login details from browser storage.
async function getSaved(): Promise<GoogleAuth | undefined> {
  const data = await browser.storage.local.get(KEY);
  return data[KEY] as GoogleAuth | undefined;
}

// Check whether Google login details are saved.
export async function isLoggedIn(): Promise<boolean> {
  return !!(await getSaved());
}

// Open Google login. Set interactive=false to try logging in silently.
export async function login(interactive = true): Promise<string> {
  if (!CLIENT_ID) throw new Error("WXT_GOOGLE_CLIENT_ID is missing in .env");

  // Build the Google OAuth login URL.
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "token",
    redirect_uri: browser.identity.getRedirectURL(),
    scope: SCOPE,
  });
  if (!interactive) params.set("prompt", "none");

  // Open Google login and wait for the redirect.
  const redirectedTo = await browser.identity.launchWebAuthFlow({
    url: `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
    interactive,
  });
  if (!redirectedTo) throw new Error("Login was cancelled.");

  // Read the access token from the redirect URL.
  const result = new URLSearchParams(new URL(redirectedTo).hash.slice(1));
  const accessToken = result.get("access_token");
  if (!accessToken) throw new Error(result.get("error") ?? "Login failed.");

  // Save the token and its expiry time.
  const expiresIn = Number(result.get("expires_in") ?? 3600);
  await browser.storage.local.set({
    [KEY]: { accessToken, expiresAt: Date.now() + expiresIn * 1000 },
  });
  return accessToken;
}

// Return a valid token or renew it silently if it is about to expire.
export async function getAccessToken(): Promise<string> {
  const saved = await getSaved();
  if (!saved) throw new Error("Please sign in with Google first.");

  // Reuse the token if it has more than 1 minute left.
  if (saved.expiresAt - Date.now() > 60_000) return saved.accessToken;

  try {
    return await login(false);
  } catch {
    // Remove expired login details if silent renewal fails.
    await browser.storage.local.remove(KEY);
    throw new Error("Google session expired. Please sign in again.");
  }
}

// Sign out by removing the saved token and requesting its revocation.
export async function logout(): Promise<void> {
  const saved = await getSaved();
  await browser.storage.local.remove(KEY);

  if (saved) {
    // Ignore network errors because local sign-out is already complete.
    fetch(`https://oauth2.googleapis.com/revoke?token=${saved.accessToken}`, {
      method: "POST",
    }).catch(() => {});
  }
}
