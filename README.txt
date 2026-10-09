Nemesis Launcher landing page (GitHub Pages: 1kitikat1/shadow).
No login, registration, Firebase or account system.

Download buttons point to the latest GitHub release of 1kitikat1/Launch:
  - primary:  releases/latest/download/NemesisSetup.exe (one-click installer)
  - portable: the versioned NemesisLauncher-*.zip from the releases page

assets/app.js asks the GitHub API for the latest release and fills in the
real version tag (data-version) plus the exact asset URLs (data-download /
data-portable). Static hrefs are the fallback when the API is unavailable.
