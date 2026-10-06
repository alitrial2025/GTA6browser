#!/usr/bin/env bash
set -euo pipefail
cd /workspace/GTA6browser
node --input-type=module -e 'const [major,minor]=process.versions.node.split(".").map(Number); if(major<22||(major===22&&minor<12))throw new Error("Node.js 22.12+ is required");'
npm ci --cache "${VICE_NPM_CACHE:-/tmp/vice-npm-cache}" --no-audit --no-fund
npm test
npm run build
