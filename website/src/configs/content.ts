// src/configs/content.ts

import { SITE_INFO } from "./site";

export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Privacy", href: "#privacy" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "FAQ", href: "#faq" },
];

export const FEATURES = [
  {
    icon: "bookmark",
    title: "Save in one click",
    text: "Store any AI prompt with a title and its content. Fast enough to use mid-conversation.",
  },
  {
    icon: "lock",
    title: "Local-first storage",
    text: "Prompts live in your browser. No account, no login, no waiting.",
  },
  {
    icon: "search",
    title: "Instant search",
    text: "Find the right prompt by title or content as you type.",
  },
  {
    icon: "copy",
    title: "Copy in a tap",
    text: "One click copies a prompt, ready to paste into ChatGPT, Claude, Gemini and more.",
  },
  {
    icon: "clock",
    title: "Recent prompts",
    text: "Your most recently used prompts stay at the top, always within reach.",
  },
  {
    icon: "pencil",
    title: "Edit & organize",
    text: "View, edit and delete prompts any time to keep your library tidy.",
  },
  {
    icon: "cloud",
    title: "Cloud sync",
    text: "Sign in to sync across devices with Google Drive. More drives are planned.",
  },
  {
    icon: "braces",
    title: "Export & import",
    text: "Back up your library as JSON and import it anywhere, any time.",
  },
];

export const STEPS = [
  {
    title: "Write or paste",
    text: "Open the popup, add a title and paste the prompt that worked.",
  },
  {
    title: "Find it fast",
    text: "Search or pick from your recent prompts whenever you need them.",
  },
  {
    title: "Copy and go",
    text: "Copy with one click and paste into your favourite AI tool.",
  },
];

export const PRIVACY_POINTS = [
  "Works fully offline with browser storage - no sign-up needed.",
  "Cloud sync is opt-in and only used when you sign in to Google Drive or other storage providers.",
  "You own your data: export everything as JSON at any time.",
];

export const ROADMAP = [
  {
    status: "Ready",
    title: "Browser extension",
    text: "Chrome and Firefox, built with WXT and React.",
    items: [
      "Save, edit, delete",
      "Search and recent prompts",
      "JSON export / import",
    ],
  },
  {
    status: "Next",
    title: "Cloud sync",
    text: "Keep prompts in sync across every device.",
    items: ["Google Drive sync", "More drives later", "Conflict-safe merging"],
  },
  {
    status: "Planned",
    title: "Desktop app",
    text: "Use prompts in any app with a global shortcut, like a multi-clipboard for prompts.",
    items: ["Electron app", "Global shortcut popup", "Windows, macOS, Linux"],
  },
];

export const FAQ = [
  {
    q: `What is ${SITE_INFO.name}?`,
    a: `${SITE_INFO.name} is a free browser extension that lets you save, search, edit, copy and sync the AI prompts you use most, so you never have to rewrite a great prompt again.`,
  },
  {
    q: "Do I need an account?",
    a: "No. Prompts are stored locally in your browser and everything works without logging in. An account is only needed if you want to sync across devices.",
  },
  {
    q: "Which browsers are supported?",
    a: `${SITE_INFO.name} is built for Google Chrome and Mozilla Firefox, with other Chromium-based browsers likely to work as well. Support for Other browsers is planned.`,
  },
  {
    q: "How does cloud sync work?",
    a: "When you sign in, your prompts can be synced through Google Drive or Other devices so they follow you across devices. Support for more storage providers is planned.",
  },
  {
    q: "Can I back up my prompts?",
    a: "Yes. Export your whole library as a JSON file and import it back whenever you like.",
  },
  {
    q: "Will there be a desktop app?",
    a: "Yes. A desktop app is planned so you can open your prompt library from any app using a global keyboard shortcut - similar to the Windows clipboard history.",
  },
  { q: "Is it free?", a: `Yes, ${SITE_INFO.name} is free to use.` },
];
