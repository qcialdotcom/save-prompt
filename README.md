# Save Prompt

Save Prompt helps you save, organize, search, and sync AI prompts in your
browser.

This repository contains:

- [`extension/`](./extension/) - the WXT and React browser extension.
- [`desktop/`](./desktop/) - the Electron desktop application for local
  prompt management and optional Google Drive sync.
- [`website/`](./website/) - the Astro website for Save Prompt.

## Getting started

### Browser extension

```bash
cd extension
bun install
bun run dev
```

See the [extension README](./extension/README.md) for browser setup, production
builds, and packaging commands.

### Desktop app

```bash
cd desktop
npm install
npm run dev
```

See the [desktop README](./desktop/README.md) for environment configuration,
available commands, desktop features, and packaging instructions.

### Website

```bash
cd website
npm install
npm run dev
```

The website is available at `http://localhost:4321`.

## License

This project is available under the [Personal and Internal Business Use
License](./LICENSE.md).
