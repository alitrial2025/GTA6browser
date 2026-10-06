# Cloud setup

The checkout is `/workspace/GTA6browser`. Node 24, npm, Python and system Chromium are available in the current cloud environment. The repository initially had no commits; all authored application files are currently local work. No API credentials or runtime CDN are needed.

Install repeatably with `bash scripts/cloud-install.sh`. This runs the locked dependency install, core tests and production build. npm's cache is placed in `/tmp/vice-npm-cache` because the default home cache is not writable here. The required npm registry is covered by the existing package-manager network preset; no additional domains or secrets are required.

To start, use the existing checkout and run `npm run dev -- --host 0.0.0.0 --port 5173 --strictPort`. Keep that process alive in an execution session. If the port is occupied, first check whether the existing server belongs to this task and is healthy. Do not terminate unrelated processes. Check HTTP readiness, then validate gameplay with `npm run test:campaign-browser` and the studio with `npm run test:browser` (the runner owns and cleans up a separate production preview on port 5175). The default view is the scene-built campaign; `?studio=1` opens the scene studio; `?scene=10` chooses the waterfront; `?scene=PG06`, `?scene=LK05`, and `?scene=VC09` select the three additional studies. Keys 1–5 select all five scenes. The earlier prototype is retained behind `?mode=prototype`.

The Playwright suite uses `/usr/bin/chromium`. If it is missing on a different machine, provide `CHROMIUM_PATH` or install a compatible browser separately. All GLBs, HDR files, surface textures, fonts, reference screenshots and licenses are served from `public/`.

The install script and start instructions are saved as environment configuration drafts after verification. Saving a draft does not run it, apply it or publish the environment. Review and save the changes in environment settings, then publish the environment to activate the configuration and workspace snapshot. Fresh-task restoration has not been independently verified.
