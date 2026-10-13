// src/configs/downloads.ts

export type DownloadIcon =
  | "globe"
  | "flame"
  | "monitor"
  | "laptop"
  | "terminal";

export interface DownloadTarget {
  id: string;
  name: string;
  icon: DownloadIcon;
  description: string;
  buttonLabel: string;
  href: string | null;
  commandLabel: string;
  command: string | null;
}

export const EXTENSION_DOWNLOADS: DownloadTarget[] = [
  {
    id: "chrome",
    name: "Chrome",
    icon: "globe",
    description: "Also works on Edge, Brave and other Chromium browsers.",
    buttonLabel: "Add to Chrome",
    href: null, // https://chrome.google.com/webstore/...
    commandLabel: "Store link",
    command: null,
  },
  {
    id: "firefox",
    name: "Firefox",
    icon: "flame",
    description: "Install from Firefox Add-ons in one click.",
    buttonLabel: "Add to Firefox",
    href: null, // https://addons.mozilla.org/en-US/firefox/...
    commandLabel: "Store link",
    command: null,
  },
];

export const DESKTOP_DOWNLOADS: DownloadTarget[] = [
  {
    id: "windows",
    name: "Windows",
    icon: "monitor",
    description: "Windows 10 and newer.",
    buttonLabel: "Download for Windows",
    href: null,
    commandLabel: "Install command",
    command: null,
  },
  {
    id: "mac",
    name: "macOS",
    icon: "laptop",
    description: "Apple Silicon and Intel.",
    buttonLabel: "Download for macOS",
    href: null,
    commandLabel: "Install command",
    command: null,
  },
  {
    id: "linux",
    name: "Linux",
    icon: "terminal",
    description: "AppImage and package managers.",
    buttonLabel: "Download for Linux",
    href: null,
    commandLabel: "Install command",
    command: null,
  },
];
