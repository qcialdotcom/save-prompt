## Save Prompt - Chrome Extension Requirements

1. Save prompts: Save AI prompts with a title and content.
2. Local storage: Store prompts in the browser without requiring login.
3. Manage prompts: View, search, edit, copy, and delete saved prompts.
4. Recent prompts: Keep recently used prompts easily accessible.
5. Cloud sync: Allow logged-in users to sync prompts across devices using google drive later more drives.
6. Export/Import: Enable users to export prompts as JSON and import them back.
9. Simple interface: Make saving and copying prompts quick and easy.
10. Browser support: Build with WXT and React, supporting Chrome and Firefox.

```
save-prompt/
├── .git/
├── .output/
├── .wxt/
├── entrypoints/
│   ├── popup/
│   │   ├── App.tsx
│   │   ├── index.html
│   │   ├── main.tsx
│   │   └── style.css
│   ├── background.ts
│   └── content.ts
├── public/
│   ├── icon/
│   │   ├── 16.png
│   │   ├── 32.png
│   │   ├── 48.png
│   │   ├── 96.png
│   │   └── 128.png
│   ├── save-prompt.png
│   └── wxt.svg
├── components/
│   ├── PromptForm.tsx
│   ├── PromptList.tsx
│   ├── FilterBar.tsx
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── SearchBar.tsx
├── lib/
│   ├── auth.ts
│   ├── sync.ts
│   └── prompts.ts
├── config/
│   └── site.ts
├── .gitignore
├── bun.lock
├── package.json
├── README.md
├── tsconfig.json
└── wxt.config.ts
```

- `entrypoints/popup/` for the popup UI of the extension.
- `background.ts` for background scripts.
- `content.ts` for content scripts that run on web pages.
- `components/` for reusable React components.
- `lib/auth.ts` for authentication and authorization of google drive.
- `lib/sync.ts` for syncing prompts with cloud storage.
- `lib/prompts.ts` for saving, editing, deleting, and searching prompts.
- `config/site.ts` for site-specific configurations.
