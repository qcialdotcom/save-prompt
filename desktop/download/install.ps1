# Save Prompt installer for Windows
# Usage (PowerShell): irm https://raw.githubusercontent.com/qcialdotcom/save-prompt/main/desktop/download/install.ps1 | iex

# Stop the script if any command fails.
$ErrorActionPreference = "Stop"

# Set the GitHub repository name and fetch its latest release information.
$repo = "qcialdotcom/save-prompt"
$release = Invoke-RestMethod "https://api.github.com/repos/$repo/releases/latest"

# Find the first Windows installer (.exe) attached to the latest release.
$asset = $release.assets | Where-Object { $_.name -match '\.exe$' } | Select-Object -First 1

# Stop if no Windows installer is available.
if (-not $asset) { throw "No .exe found in the latest release." }

# Create the output path using the temporary folder and installer filename.
$out = Join-Path $env:TEMP $asset.name

# Show the installer name and download it from GitHub.
Write-Host "Downloading $($asset.name)..."
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $out

# Run the downloaded installer and wait until it exits.
Write-Host "Launching installer..."
Start-Process -FilePath $out -Wait

# Delete the downloaded installer after it finishes.
# Ignore errors if the file has already been removed or cannot be deleted.
Remove-Item $out -ErrorAction SilentlyContinue