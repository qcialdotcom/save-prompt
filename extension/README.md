# Save Prompt browser extension

Save Prompt is a WXT + React browser extension for saving, organizing, searching,
and importing AI prompts. The extension stores prompts in the browser's local
extension storage.

## Prerequisites

Install the following before building the extension:

- Node.js 18 or newer
- bun
- Google Chrome, Chromium, or Mozilla Firefox for testing

The commands below use **bun**. If you use Bun, replace `bun install` with
`bun install` and `bun run <script>` with `bun run <script>`.

## 1. Get the source code

From a terminal, clone the repository and enter the extension directory:

```bash
git clone https://github.com/qcialdotcom/save-prompt.git
cd save-prompt/extension
```

If you already have the repository, only the second command is needed:

```bash
cd /path/to/save-prompt/extension
```

## 2. Install dependencies

Install the exact dependency versions recorded in the lockfile:

```bash
bun install
```

WXT prepares its generated type files during installation. If the generated
files are missing or out of date, run:

```bash
bunx wxt prepare
```

## 3. Check the source

Run the TypeScript compiler without emitting JavaScript:

```bash
bun run compile
```

Fix any reported errors before creating a production build.

## 4. Run the extension in development mode

For Chrome or Chromium:

```bash
bun run dev
```

For Firefox:

```bash
bun run dev:firefox
```

WXT starts a development build and watches the source files. Keep this
terminal running while developing. After making changes, reload the extension
from the browser's extensions page if the browser does not reload it
automatically.

## 5. Create a production build

Build the Chrome/Chromium version:

```bash
bun run build
```

Build the Firefox version:

```bash
bun run build:firefox
```

Build output is written under `extension/.output/`. The generated directory
name includes the target browser and manifest version, for example
`.output/chrome-mv3/` or `.output/firefox-mv2/`.

## 6. Load and use the built extension

### Chrome or Chromium

1. Run `bun run build`.
2. Open `chrome://extensions` (or the equivalent extensions page in your
   Chromium-based browser).
3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Select the generated Chrome directory:
   `extension/.output/chrome-mv3/`.
6. Pin **Save Prompt** to the browser toolbar.
7. Click the extension icon to open the popup, then create or manage prompts.

When the source changes, run `bun run build` again and click the extension's
**Reload** button on the extensions page.

### Firefox

1. Run `bun run build:firefox`.
2. Open `about:debugging#/runtime/this-firefox`.
3. Click **This Firefox**.
4. Click **Load Temporary Add-on...**.
5. Select `manifest.json` inside
   `extension/.output/firefox-mv2/`.
6. Click the Save Prompt extension icon to use it.

Temporary Firefox add-ons are removed when Firefox closes. Run the Firefox
build and load the new `manifest.json` again after source changes.

## 7. Create distributable ZIP files

Create a Chrome/Chromium ZIP:

```bash
bun run zip
```

Create a Firefox ZIP:

```bash
bun run zip:firefox
```

The ZIP files are generated under `extension/.output/`. These archives can be
uploaded to the appropriate browser extension store or shared for testing.

## Available commands

Run these commands from the `extension/` directory:

| Command                 | Purpose                                     |
| ----------------------- | ------------------------------------------- |
| `bun run dev`           | Start the Chrome/Chromium development build |
| `bun run dev:firefox`   | Start the Firefox development build         |
| `bun run build`         | Create a production Chrome/Chromium build   |
| `bun run build:firefox` | Create a production Firefox build           |
| `bun run compile`       | Type-check the TypeScript source            |
| `bun run zip`           | Package the Chrome/Chromium build as a ZIP  |
| `bun run zip:firefox`   | Package the Firefox build as a ZIP          |

## Project layout

- `components/` - Reusable React UI components
- `entrypoints/popup/` - Extension popup entry point
- `entrypoints/background.ts` - Background service worker
- `entrypoints/content.ts` - Content script
- `lib/prompts.ts` - Prompt storage and data operations
- `wxt.config.ts` - WXT, Vite, and browser manifest configuration
- `public/` - Static assets
- `.output/` - Generated builds and ZIP files; do not edit manually

## Troubleshooting

### The build cannot find generated WXT files

Run:

```bash
bunx wxt prepare
bun run compile
```

### The browser does not show the latest code

Make sure the development process is still running, or rebuild with
`bun run build`. Then reload the unpacked extension from the browser's
extensions page. Do not load the repository root; load the generated browser
directory under `.output/`.

### Start over with generated files

Stop any running WXT process, remove only the generated output, reinstall
dependencies, and build again:

```bash
rm -rf .output .wxt node_modules
bun install
bun run build
```
