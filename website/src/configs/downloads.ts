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
  shortcutInstructions?: string[];
}

export const EXTENSION_DOWNLOADS: DownloadTarget[] = [
  {
    id: "chrome",
    name: "Chrome",
    icon: "globe",
    description: "Also works on Edge, Brave and other Chromium browsers.",
    buttonLabel: "Add to Chrome",
    href: "https://chromewebstore.google.com/detail/eiipdkicmhleciiobbbcijfjgphboocd?utm_source=save-prompt.qcial.com",
    commandLabel: "Store link",
    command: null,
  },
  {
    id: "firefox",
    name: "Firefox",
    icon: "flame",
    description: "Install from Firefox Add-ons in one click.",
    buttonLabel: "Add to Firefox",
    href: "https://addons.mozilla.org/en-US/firefox/addon/save-prompt/?utm_source=save-prompt.qcial.com",
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
    href: "https://github.com/qcialdotcom/save-prompt/releases/latest",
    commandLabel: "Install command",
    command: "irm https://powershell.save-prompt.qcial.com/install.ps1 | iex",
    shortcutInstructions: [
      "Find the application's .exe file.",
      "Right-click it -> Show more options -> Create shortcut.",
      "Move the shortcut to your Desktop if necessary.",
      "Right-click the shortcut -> Properties.",
      "Open the Shortcut tab.",
      "Click the Shortcut key field.",
      "Press your desired key combination, such as Ctrl + Alt + S.",
      "Click Apply -> OK.",
    ],
  },
  {
    id: "mac",
    name: "macOS",
    icon: "laptop",
    description: "Apple Silicon and Intel.",
    buttonLabel: "Download for macOS",
    href: "https://github.com/qcialdotcom/save-prompt/releases/latest",
    commandLabel: "Install command",
    command: "curl -fsSL https://bash.save-prompt.qcial.com/install.sh | bash",
    shortcutInstructions: [
      "Open the Shortcuts app on your Mac.",
      "Click + to create a new shortcut.",
      "Search for the Open App action.",
      "Add it and select the application you want to launch.",
      "Name the shortcut, for example, Open My App.",
      "Open the shortcut's details and choose Add Keyboard Shortcut.",
      "Press your desired key combination and save.",
      "Alternatively, open Automator and create a Quick Action.",
      "Set the workflow to receive no input in any application.",
      "Add the Launch Application action and select your app.",
      "Save it with a name such as Open My App.",
      "Go to System Settings -> Keyboard -> Keyboard Shortcuts -> Services.",
      "Find your Quick Action and assign a keyboard shortcut.",
    ],
  },
  {
    id: "linux",
    name: "Linux",
    icon: "terminal",
    description: "AppImage and package managers.",
    buttonLabel: "Download for Linux",
    href: "https://github.com/qcialdotcom/save-prompt/releases/latest",
    commandLabel: "Install command",
    command: "curl -fsSL https://bash.save-prompt.qcial.com/install.sh | bash",
    shortcutInstructions: [
      "Open Settings -> Keyboard.",
      "Find View and Customize Shortcuts.",
      "Select Custom Shortcuts.",
      "Click Add Shortcut.",
      "Enter a name, shortcut key, and command.",
    ],
  },
];
