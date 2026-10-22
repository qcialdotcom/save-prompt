// src/configs/content.ts

import { SITE_INFO } from "./site";

export interface FeatureContent {
  icon:
    | "bookmark"
    | "lock"
    | "search"
    | "copy"
    | "clock"
    | "pencil"
    | "cloud"
    | "braces";
  title: string;
  text: string;
}

export interface StepContent {
  icon: "pencil" | "search" | "copy";
  title: string;
  text: string;
}

export interface PrivacyPoint {
  icon: "wifi-off" | "cloud" | "download";
  title: string;
  text: string;
}

export type RoadmapStatus = "Ready" | "Next" | "Planned";

export interface RoadmapItem {
  status: RoadmapStatus;
  title: string;
  text: string;
  items: string[];
}

export interface FAQItem {
  q: string;
  a: string;
}

export type ComparisonValue = boolean | "partial";

export interface ComparisonRow {
  feature: string;
  savePrompt: ComparisonValue;
  chat: ComparisonValue;
  notion: ComparisonValue;
  bookmarks: ComparisonValue;
}

export interface ComparisonValueProp {
  icon: "sparkles" | "shield" | "check";
  title: string;
  text: string;
}

export interface ContentSection {
  title: string;
  text: string;
}

export interface ComparisonContent {
  intro: string;
  whyDedicated: string;
  workflow: string;
  choosing: string;
  note: string;
  details: ContentSection[];
}

export interface GuideStep {
  icon: "bookmark" | "tags" | "search" | "copy";
  number: string;
  title: string;
  text: string;
}

export interface GuideContent {
  intro: string;
  capture: string;
  organize: string;
  retrieve: string;
  improve: string;
  habits: string[];
  advanced: ContentSection[];
}

export interface PrivacySection extends ContentSection {}

export interface PrivacyPageContent {
  intro: string;
  sections: PrivacySection[];
  checklist: string[];
  principles: PrivacySection[];
  note: string;
}

export const FEATURES: FeatureContent[] = [
  {
    icon: "bookmark",
    title: "Save prompts",
    text: "Store a prompt with a title, its content, and optional tags.",
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
    title: "Newest prompts",
    text: "Your newest saved prompts appear first in your library.",
  },
  {
    icon: "pencil",
    title: "Edit & organize",
    text: "Edit, favorite, and delete prompts whenever you need to.",
  },
  {
    icon: "cloud",
    title: "Cloud sync",
    text: "Sign in with Google to sync your prompts through Google Drive.",
  },
  {
    icon: "braces",
    title: "Export & import",
    text: "Back up your library as JSON and import it anywhere, any time.",
  },
];

export const STEPS: StepContent[] = [
  {
    icon: "pencil",
    title: "Write or paste",
    text: "Open the popup, add a title, and enter the prompt you want to save.",
  },
  {
    icon: "search",
    title: "Find it fast",
    text: "Search or pick from your recent prompts whenever you need them.",
  },
  {
    icon: "copy",
    title: "Copy and go",
    text: "Copy with one click and paste into your favourite AI tool.",
  },
];

export const PRIVACY_POINTS: PrivacyPoint[] = [
  {
    icon: "wifi-off",
    title: "Local storage by default",
    text: "Prompts are stored in your browser. No sign-up is needed for the local library.",
  },
  {
    icon: "cloud",
    title: "Cloud sync is opt-in",
    text: "Sync only happens after you sign in with Google and enable Google Drive sync.",
  },
  {
    icon: "download",
    title: "You own your data",
    text: "Export everything as JSON at any time and take it wherever you like.",
  },
];

export const PRIVACY_BADGES: string[] = [
  "No sign-up",
  "Offline-ready",
  "Export anytime",
];

export const ROADMAP: RoadmapItem[] = [
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
    status: "Ready",
    title: "Cloud sync",
    text: "Keep prompts in sync across every device.",
    items: ["Google Drive sync", "Conflict-safe merging"],
  },
  {
    status: "Next",
    title: "Desktop app",
    text: "Use prompts in any app with a global shortcut, like a multi-clipboard for prompts.",
    items: ["Electron app", "Global shortcut popup", "Windows, macOS, Linux"],
  },
];

export const FAQ: FAQItem[] = [
  {
    q: `What is ${SITE_INFO.name}?`,
    a: `${SITE_INFO.name} is a free browser extension for saving, searching, editing, copying, and organizing AI prompts.`,
  },
  {
    q: "Do I need an account?",
    a: "No. Prompts are stored locally in your browser and everything works without logging in. An account is only needed if you want to sync across devices.",
  },
  {
    q: "Which browsers are supported?",
    a: `${SITE_INFO.name} is built for Google Chrome and Mozilla Firefox.`,
  },
  {
    q: "How does cloud sync work?",
    a: "When you sign in with Google and enable sync, your prompts are merged with the copy stored in Google Drive.",
  },
  {
    q: "Can I back up my prompts?",
    a: "Yes. Export your whole library as a JSON file and import it back whenever you like.",
  },
  {
    q: "Can I edit a saved prompt?",
    a: "Yes. Open a saved prompt, select Edit, and update its title, content, or tags.",
  },
  {
    q: "Can I organize prompts with tags?",
    a: "Yes. Add comma-separated tags when creating or editing a prompt. Search for a tag by starting your search with #.",
  },
  {
    q: "Can I mark prompts as favorites?",
    a: "Yes. Select the favorite button on a prompt, then use the favorites filter to show only your favorite prompts.",
  },
  {
    q: "How does prompt search work?",
    a: "Search normally to find matching titles, content, and tags. Start with @ to search titles only or # to search tags only.",
  },
  {
    q: "Can I import prompts from a JSON file?",
    a: "Yes. Import a valid JSON file and choose Merge to add or update prompts, or Replace to use only the imported prompts.",
  },
  {
    q: "Can I delete my prompts?",
    a: "Yes. Delete individual prompts from the list or use Delete all to clear the local prompt library.",
  },
  { q: "Is it free?", a: `Yes, ${SITE_INFO.name} is free to use.` },
];

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: "Save reusable prompt text",
    savePrompt: true,
    chat: "partial",
    notion: true,
    bookmarks: false,
  },
  {
    feature: "Dedicated prompt library",
    savePrompt: false,
    chat: false,
    notion: "partial",
    bookmarks: false,
  },
  {
    feature: "Save prompts from the popup",
    savePrompt: true,
    chat: false,
    notion: false,
    bookmarks: false,
  },
  {
    feature: "Search prompt content",
    savePrompt: true,
    chat: "partial",
    notion: true,
    bookmarks: "partial",
  },
  {
    feature: "Tags and organization",
    savePrompt: true,
    chat: "partial",
    notion: true,
    bookmarks: "partial",
  },
  {
    feature: "Favorite prompts",
    savePrompt: true,
    chat: "partial",
    notion: "partial",
    bookmarks: "partial",
  },
  {
    feature: "Copy prompt text directly",
    savePrompt: true,
    chat: true,
    notion: true,
    bookmarks: false,
  },
  {
    feature: "Works with multiple AI tools",
    savePrompt: true,
    chat: "partial",
    notion: true,
    bookmarks: true,
  },
  {
    feature: "Local-first storage",
    savePrompt: true,
    chat: false,
    notion: false,
    bookmarks: true,
  },
  {
    feature: "No account required",
    savePrompt: true,
    chat: false,
    notion: false,
    bookmarks: true,
  },
  {
    feature: "JSON import and export",
    savePrompt: true,
    chat: false,
    notion: "partial",
    bookmarks: false,
  },
  {
    feature: "Optional Google Drive sync",
    savePrompt: true,
    chat: false,
    notion: "partial",
    bookmarks: false,
  },
  {
    feature: "Free to use",
    savePrompt: true,
    chat: true,
    notion: true,
    bookmarks: true,
  },
];

export const COMPARISON_VALUE_PROPS: ComparisonValueProp[] = [
  {
    icon: "sparkles",
    title: "Purpose-built",
    text: "Every interaction is optimized for the way you collect, improve and reuse prompts.",
  },
  {
    icon: "shield",
    title: "Private by default",
    text: "Your library stays on your device instead of becoming another cloud account to manage.",
  },
  {
    icon: "check",
    title: "Simple to start",
    text: "Install the extension, save your first prompt and get back to your work.",
  },
];

export const COMPARISON_CONTENT: ComparisonContent = {
  intro:
    "Save Prompt is a browser extension for keeping reusable AI prompts in one small library. Add prompts from the extension popup, then search, edit, favorite, copy, delete, import, export, or sync them when needed.",
  whyDedicated:
    "Bookmarks save pages, while Save Prompt saves the prompt text itself. Each entry has a title, content, tags, favorite state, and timestamps. This keeps the item you want to reuse separate from the page or chat where you originally found it.",
  workflow:
    "Open the popup, choose Add new, and enter a title and prompt. Add comma-separated tags if useful. Later, search the title, content, or tags, or use @ for title-only search and # for tag search. Open a result to edit it, mark it as a favorite, copy its content, or delete it.",
  choosing:
    "Use Save Prompt when you want a focused personal library for prompt text. Use bookmarks for web pages and a general workspace for documents or collaboration. Save Prompt stores its local library in the browser and also provides JSON import and export.",
  note: "This comparison describes the features currently available in the Save Prompt extension.",
  details: [
    {
      title: "Prompt text instead of page links",
      text: "A bookmark takes you back to a page. Save Prompt stores the title and prompt content, so you can search and copy the text without reopening the original page.",
    },
    {
      title: "Simple prompt records",
      text: "Every saved prompt has a title, content, tags, favorite state, creation time, and update time. You can edit these fields from the popup instead of creating a larger document structure.",
    },
    {
      title: "Search when you need it",
      text: "The search field checks prompt titles, content, and tags. Use @title to search titles only or #tag to search tags only. Results are shown with the newest prompts first.",
    },
    {
      title: "Favorites and deletion",
      text: "Mark frequently used prompts as favorites and filter the list to show only favorites. You can delete one prompt or delete the complete local library from the popup.",
    },
    {
      title: "Copy the saved content",
      text: "The Copy action places the prompt content on the clipboard. You can then paste it into the AI tool or editor you are currently using.",
    },
    {
      title: "JSON backup and restore",
      text: "Export the local prompt list as a JSON file. Import a JSON file later using merge mode to add or update entries, or replace mode to use only the imported entries.",
    },
    {
      title: "Optional Google Drive sync",
      text: "After signing in with Google, you can sync the prompt list with a prompts.json file in Google Drive's hidden application folder. Sync downloads the cloud list, merges it with local prompts, and uploads the merged list.",
    },
  ],
};

export const GUIDE_STEPS: GuideStep[] = [
  {
    icon: "bookmark",
    number: "01",
    title: "Add a prompt",
    text: "Open the extension popup, select Add new, and enter a title and prompt. Add tags separated by commas if you want to search by tag later.",
  },
  {
    icon: "tags",
    number: "02",
    title: "Organize it",
    text: "Edit saved prompts when their content changes. Mark frequently used prompts as favorites and use the favorites filter to narrow the list.",
  },
  {
    icon: "search",
    number: "03",
    title: "Search the library",
    text: "Search titles, content, and tags. Use @ before a title search or # before a tag search.",
  },
  {
    icon: "copy",
    number: "04",
    title: "Copy the prompt",
    text: "Select Copy on a saved prompt, then paste its content wherever you are working.",
  },
];

export const GUIDE_CONTENT: GuideContent = {
  intro:
    "Save Prompt keeps prompt text in a searchable browser library. Add prompts from the popup, organize them with tags and favorites, and copy them when you need to reuse them.",
  capture:
    "Select Add new in the popup. A prompt needs a title and content before it can be saved. Tags are optional and are entered as a comma-separated list. Use a title that makes the prompt easy to recognize later.",
  organize:
    "Use tags for broad categories such as writing, research, debugging, or planning. Mark prompts that you use often as favorites. The favorites filter shows only prompts with the favorite flag enabled.",
  retrieve:
    "Use the search field to look through titles, prompt content, and tags. Start a query with @ to search only titles or with # to search only tags. Selecting Copy places the saved content on your clipboard.",
  improve:
    "Select Edit on a saved prompt to change its title, content, or tags. Use Export to download the library as JSON before making larger changes. Import supports either merging imported prompts with the current library or replacing the current library.",
  habits: [
    "Use a clear title for every prompt.",
    "Keep tags short and consistent.",
    "Favorite prompts you use regularly.",
    "Edit a prompt when its content changes.",
    "Export a JSON backup when you need a copy of the library.",
  ],
  advanced: [
    {
      title: "Use tags for retrieval",
      text: "Tags are stored with each prompt and included in normal search. They can also be searched directly by starting the query with #.",
    },
    {
      title: "Search titles directly",
      text: "Start a search with @ when you know part of the prompt title and do not want to search its content or tags.",
    },
    {
      title: "Keep a local backup",
      text: "Export creates a prompts.json file containing the local prompt records. Store that file somewhere safe if the prompts are important.",
    },
    {
      title: "Choose an import mode",
      text: "Merge keeps current prompts and adds or updates imported prompts by ID. Replace clears the current list and uses only the valid prompts in the selected JSON file.",
    },
    {
      title: "Create a valid JSON file",
      text: "If you create a prompts.json file yourself, use the exact object structure required by the extension. The JSON schema page lists the required fields, accepted types, and common validation errors before you import the file.",
    },
    {
      title: "Use sync only when needed",
      text: "Google Drive sync is optional. Sign in with Google from the sync control, then run a sync or enable background sync in the sync settings.",
    },
    {
      title: "Remove prompts you no longer need",
      text: "Use the delete action on an individual prompt, or use Delete all to clear the local prompt list.",
    },
  ],
};

export const PRIVACY_PAGE_CONTENT: PrivacyPageContent = {
  intro:
    "Save Prompt stores prompts in the browser by default. We do not collect, share, or sell your prompt data. The local library does not require an account. Google Drive sync is a separate, optional feature that requires signing in with Google.",
  sections: [
    {
      title: "Browser storage",
      text: "Saved prompts are kept in the extension's local browser storage. Saving, editing, searching, favoriting, copying, and deleting prompts use that local library.",
    },
    {
      title: "No account for local use",
      text: "You can create and manage local prompts without signing in. Google sign-in is only used for the optional Google Drive sync workflow.",
    },
    {
      title: "Google Drive sync",
      text: "When sync is used, the extension accesses a prompts.json file in Google Drive's hidden application folder. The sync flow downloads the cloud prompts, merges them with local prompts, and uploads the merged list. Google Drive's own privacy policy and terms apply to data stored there.",
    },
    {
      title: "JSON files",
      text: "Export downloads the local prompt list as JSON. Imported files are validated before they are merged or used to replace the current local list.",
    },
    {
      title: "No collection, sharing, or sale",
      text: "Save Prompt does not collect your prompt data, share it with third parties, or sell it. If you choose Google Drive sync, the synced copy is handled through your Google account and is subject to Google's policies.",
    },
    {
      title: "Delete controls",
      text: "You can delete individual prompts or clear the complete local prompt list. Exported JSON files and any synced copy are separate copies that you should manage yourself.",
    },
  ] as PrivacySection[],
  checklist: [
    "Local prompt storage is the default.",
    "No account is required for local prompts.",
    "Google Drive sync requires Google sign-in.",
    "JSON export creates a portable copy.",
    "Save Prompt does not collect, share, or sell prompt data.",
    "Individual and delete-all controls are available.",
  ],
  principles: [
    {
      title: "Local by default",
      text: "The core prompt list is stored locally in the browser. Local use does not require Google sign-in.",
    },
    {
      title: "Sync is optional",
      text: "Cloud sync is not required for the local library. It is available through Google Drive after sign-in and can be disabled from the sync controls.",
    },
    {
      title: "Copies need care",
      text: "A browser profile, exported JSON file, or Google Drive copy can contain the prompt text you saved. Protect those locations and avoid saving sensitive information unless you understand the risks.",
    },
    {
      title: "Use the available controls",
      text: "The extension provides local search, JSON export and import, individual deletion, delete all, and optional Google Drive sync. Use these controls to manage the prompt copies you create.",
    },
    {
      title: "Review prompt content",
      text: "Prompts may contain private or sensitive text. Review the content before saving, exporting, importing, or syncing it.",
    },
  ],
  note: "This page describes the current storage and data controls implemented in the extension.",
};
