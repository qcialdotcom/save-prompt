# Save Prompt Desktop

The desktop app is an Electron client for saving, organizing, searching, and
syncing AI prompts. Prompts are stored locally on the computer and can
optionally be synchronized across devices with Google Drive.

## Requirements

- Node.js 20 or newer
- A Google OAuth client ID if Google sign-in and cloud sync are needed

## Development setup

From the repository root:

```bash
cd desktop
npm install
```

To enable Google sign-in during development, copy the example environment file
and set the OAuth client ID:

```bash
cp .env.example .env
```

Then replace the placeholder value in `.env`:

```dotenv
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
```

The client ID is optional for local prompt management. Without it, the app
builds and runs, but Google sign-in and cloud sync are unavailable.

Start the desktop app in development mode:

```bash
npm run dev
```

`npm run dev` builds the React and Electron bundles before opening the app.

## Available commands

| Command         | Description                                                 |
| --------------- | ----------------------------------------------------------- |
| `npm run dev`   | Build and launch the Electron app in development mode.      |
| `npm run build` | Type-check and build the React and Electron bundles.        |
| `npm run lint`  | Run ESLint.                                                 |
| `npm run dist`  | Build and create platform installers with Electron Builder. |

## Features

- Create, edit, search, favorite, copy, and delete prompts.
- Import and export prompts as JSON files.
- Keep deleted prompts in the trash until they are permanently removed.
- Sign in with Google and sync prompts to Google Drive's private app data
  storage.
- Configure manual or background sync and choose an interval from one minute
  to one hour.
- Receive application updates through the packaged application.

## Data and sync

Local prompts and settings are managed by the Electron process. Cloud sync is
opt-in and requires signing in with Google. When enabled, the app merges local
and cloud prompts before uploading the combined collection to a private
`prompts.json` file in Google Drive's app data folder.

Use the app's Settings panel to enable cloud sync, configure background sync,
sign out, or reset the cloud copy. Resetting the cloud copy does not delete
local prompts.
