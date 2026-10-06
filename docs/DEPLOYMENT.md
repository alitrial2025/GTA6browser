# GitHub Pages

The publishing workflow is `.github/workflows/pages.yml`. It runs the locked dependency install, unit tests and production build, uploads the Pages artifact, and deploys it using GitHub's Pages action. It triggers on pushes to `main` or `work` and can also run manually.

1. Use the environment’s HTTPS Git connection or authenticate an account that can write to `alitrial2025/GTA6browser`. Git push access is separate from GitHub CLI API access.
2. Push the authored source and local assets to that repository.
3. In repository Settings → Pages, set the source to **GitHub Actions**.
4. Run **Publish Vice Horizon** and wait for both jobs to succeed.
5. Open the URL reported by the deployment job and verify game startup and local asset loading.

The intended address is `https://alitrial2025.github.io/GTA6browser/`. It is a live game link only after a successful deployment; do not report it as published while deployment is pending or unavailable.

The workflow sets `VICE_BASE_PATH=/GTA6browser/`. CSS, scripts, models, HDR environments, textures, fonts and references must resolve under that prefix. Builds for a root-domain host leave that variable unset. The app is static and needs no API keys or server-side secrets.

A browser save belongs to the site's origin. Cloud preview progress will not appear automatically on GitHub Pages. Deployment publishes the authored game, local licensed assets and the supplied reference comparisons; attribution is available through the scene studio.

The default GitHub Actions token cannot create a new Pages site in this repository. An administrator must enable the **GitHub Actions** source in Settings → Pages once; afterward the workflow can deploy with its scoped Pages token. API administration from this cloud requires `api.github.com` to be allowed. Public verification requires `alitrial2025.github.io`; adding domains to the draft does not apply them to the running machine.
