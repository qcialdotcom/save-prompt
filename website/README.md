# Save Prompt website

The Save Prompt website is a static site built with
[Astro](https://astro.build/). It contains the product landing page, feature
overview, guide, comparison page, privacy page, and download information.

## Development

The website requires Node.js `22.12` or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:4321` to view the site.

## Commands

| Command             | Description                           |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Start the local development server.   |
| `npm run build`     | Build the production site in `dist/`. |
| `npm run preview`   | Preview the production build locally. |
| `npm run astro ...` | Run an Astro CLI command.             |

## Project structure

- `src/pages/` - website routes.
- `src/components/` - reusable Astro components.
- `src/configs/` - site, content, route, and SEO configuration.
- `src/assets/` - images and other imported assets.

The root [README](../README.md) describes the repository and browser
extension.

## License

This project is available under the [Personal and Internal Business Use
License](../LICENSE.md).
