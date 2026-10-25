#!/usr/bin/env bash

# Usage: curl -fsSL https://raw.githubusercontent.com/qcialdotcom/save-prompt/main/desktop/download/install.sh | bash

# Stop the script if a command fails, a variable is missing, or a command in a pipeline fails.
set -euo pipefail

# GitHub repository and API URL for the latest release.
REPO="qcialdotcom/save-prompt"
API="https://api.github.com/repos/$REPO/releases/latest"

# Detect the current operating system and CPU architecture.
OS="$(uname -s)"
ARCH="$(uname -m)"

# Create a temporary folder for downloaded files and remove it when the script exits.
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Get the download URLs of all files attached to the latest GitHub release.
URLS="$(curl -fsSL "$API" | grep -o '"browser_download_url": *"[^"]*"' | cut -d'"' -f4)"

# Stop if the release does not contain any downloadable files.
[ -n "$URLS" ] || { echo "No release assets found."; exit 1; }

# Find the first download URL that matches the given pattern.
# Return an empty string if no matching file is found.
pick() {
  echo "$URLS" | grep -E "$1" | head -n1 || true
}

# Download a file and show its name and download progress.
download() {
  echo "Downloading $(basename "$1")..."
  curl -fL --progress-bar -o "$2" "$1"
}

# Choose the installation method based on the operating system.
case "$OS" in
  Linux)
    # This installer supports only 64-bit x86 Linux systems.
    [ "$ARCH" = "x86_64" ] || { echo "Only x64 Linux is supported (found $ARCH)."; exit 1; }

    # Use the Debian package if the system has the dpkg package manager.
    if command -v dpkg >/dev/null 2>&1; then
      URL="$(pick '\.deb$')"

      # Stop if the release does not contain a Debian package.
      [ -n "$URL" ] || { echo ".deb not found in release."; exit 1; }

      # Download and install the Debian package.
      download "$URL" "$TMP/save-prompt.deb"
      sudo apt-get install -y "$TMP/save-prompt.deb"

      echo "Installed. Launch 'Save Prompt' from your app menu."
    else
      # Use the AppImage format on systems without dpkg.
      URL="$(pick '\.AppImage$')"

      # Stop if the release does not contain an AppImage.
      [ -n "$URL" ] || { echo "AppImage not found in release."; exit 1; }

      # Download the AppImage into the user's local bin folder.
      mkdir -p "$HOME/.local/bin"
      download "$URL" "$HOME/.local/bin/save-prompt.AppImage"

      # Make the downloaded file executable.
      chmod +x "$HOME/.local/bin/save-prompt.AppImage"

      echo "Installed to ~/.local/bin/save-prompt.AppImage"
      echo "Run it with: ~/.local/bin/save-prompt.AppImage"
    fi
    ;;

  Darwin)
    # Choose the Apple Silicon installer for ARM-based Macs.
    if [ "$ARCH" = "arm64" ]; then
      URL="$(pick 'arm64.*\.dmg$')"
    else
      # For other Mac architectures, choose a DMG that is not for ARM.
      URL="$(echo "$URLS" | grep -E '\.dmg$' | grep -v arm64 | head -n1 || true)"
    fi

    # Stop if no suitable Mac installer was found.
    [ -n "$URL" ] || { echo ".dmg not found in release."; exit 1; }

    # Download the DMG installer.
    download "$URL" "$TMP/save-prompt.dmg"

    # Mount the DMG so its application files can be accessed.
    MNT="$(hdiutil attach -nobrowse -quiet "$TMP/save-prompt.dmg" | tail -n1 | cut -f3-)"

    # Find the application bundle inside the mounted DMG.
    APP="$(find "$MNT" -maxdepth 1 -name '*.app' | head -n1)"

    # Remove the previous installation, if one exists, and copy the new app.
    rm -rf "/Applications/$(basename "$APP")"
    cp -R "$APP" /Applications/

    # Unmount the DMG after copying the application.
    hdiutil detach -quiet "$MNT"

    # Remove extended attributes that may prevent the app from opening.
    # Ignore errors if the attributes cannot be removed.
    xattr -cr "/Applications/$(basename "$APP")" || true

    echo "Installed to /Applications. Launch it from Launchpad."
    ;;

  *)
    # Stop if the operating system is not supported by this installer.
    echo "Unsupported OS: $OS. On Windows use install.ps1."
    exit 1
    ;;
esac