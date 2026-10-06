# Vice Horizon

A single-player browser driving and boating game built from five explorable reference scene studies. The default experience is now the campaign. It includes 15 delivery, race and escape missions; car suspension and collision physics; third-person walking; a controllable center-console boat; pursuing patrol cars and boats; nitro, drift scoring, hidden stashes, a garage, engine upgrades, original synthesized radio, browser saves, maps and touch controls.

The districts are separate playable environments connected through the map. They approximate the supplied references, with stylized foliage and starter humanoids. This is an original browser game with a defined campaign; it does not have GTA VI's production fidelity, a continuous world between districts, multiplayer or weapon combat.

## Run

Requires Node.js 22.12+; the cloud environment uses Node 24.

```sh
npm ci --cache /tmp/vice-npm-cache --no-audit --no-fund
npm run dev -- --host 0.0.0.0 --port 5173
```

Use WebGL 2 with hardware acceleration. Models, textures, references and fonts are local. No backend, API keys or runtime asset CDN are needed. Production: `npm run build`, then `npm run preview`.

## Play

Click **Enter Leonida**. Follow the gold checkpoint gates to complete the first delivery. Open **Map** to travel or select another job. Every district has a delivery, race and escape mission. First completions award cash and XP; replaying improves the best time without duplicate money. Fifteen hidden stashes reward exploration. Use the garage for free paint changes and repairs, or buy three engine stages.

| Control | Action |
| --- | --- |
| WASD / arrows | Drive, steer or walk |
| E | Exit a stopped vehicle / enter the nearby vehicle |
| Shift | Nitro in a vehicle / run on foot |
| Space | Handbrake / jump |
| R | Recover and repair the vehicle |
| C | Cycle chase, close and wide cameras |
| Drag | Look around |
| B | Look behind |
| Q | Horn |
| M | District map and mission selection |
| G | Garage |
| Escape / P | Pause |
| Touch buttons | Steering, acceleration, reverse, boost and interaction |

Browser storage saves campaign results, cash, stashes, upgrades, paint and the last district. Pause stops mission timers. Progress belongs to the browser and origin; it does not synchronize across devices. Direct district startup: `?district=keys` or `?district=gellhorn`. Software graphics: `?quality=draft`.

## Scene studio

Open `?studio=1` for the original viewer. Keys 1–5 select the resort, waterfront towers, Gellhorn neighborhood, Keys boats and mural street. Explore enables orbit; R resets the reference camera; C opens the labeled original-reference comparison; H hides the interface; S exports the rendered PNG. The supplied screenshots are used only in Compare.

High adds ambient occlusion to shadows and reflective water; Balanced omits that extra pass; Draft reduces resolution and disables shadows and planar reflections. Motion starts paused in the studio. [SCENE_STUDIES.md](SCENE_STUDIES.md) records observations and visual differences; [ASSETS.md](ASSETS.md) provides provenance and licenses.

## Validation

```sh
npm test
npm run test:campaign-browser
npm run test:browser
```

Browser suites use Playwright and `/usr/bin/chromium`; override with `CHROMIUM_PATH`. They own and clean up separate production previews, or accept `VICE_TEST_URL`. Screenshots are saved in ignored `test-results/`. Unit tests cover mission ordering, rewards, save validation, upgrade affordability, reachable district gates, boat motion and the earlier vehicle and game systems.

## Deploy

[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) describes GitHub Pages publishing. The included workflow builds for `/GTA6browser/`; the asset manager handles that subpath. A working GitHub login, repository write access and Pages configured for GitHub Actions are required. Local builds do not publish themselves.

[docs/CLOUD_SETUP.md](docs/CLOUD_SETUP.md) describes reusable cloud startup. The earlier procedural city prototype remains available under `?mode=prototype`, with `npm run test:game-browser`. The active campaign is in `src/campaign/`; scene builders and rendering are in `src/scenes/`.
