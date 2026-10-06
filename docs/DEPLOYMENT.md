# GitHub Pages

The publishing workflow is `.github/workflows/pages.yml`. It runs the locked dependency install, unit tests and production build, uploads the Pages artifact, and deploys it using GitHub's Pages action. It triggers on pushes to `main` or `work` and can also run manually.

1. Authenticate GitHub with an account that can write to `alitrial2025/GTA6browser`.
2. Push the authored source and local assets to that repository.
3. In repository Settings → Pages, set the source to **GitHub Actions**.
4. Run **Publish Vice Horizon** and wait for both jobs to succeed.
5. Open the URL reported by the deployment job and verify game startup and local asset loading.

The intended address is `https://alitrial2025.github.io/GTA6browser/`. It is a live game link only after a successful deployment; do not report it as published while deployment is pending or unavailable.

The workflow sets `VICE_BASE_PATH=/GTA6browser/`. CSS, scripts, models, HDR environments, textures, fonts and references must resolve under that prefix. Builds for a root-domain host leave that variable unset. The app is static and needs no API keys or server-side secrets.

A browser save belongs to the site's origin. Cloud preview progress will not appear automatically on GitHub Pages. Deployment publishes the authored game, local licensed assets and the supplied reference comparisons; attribution is available through the scene studio.
