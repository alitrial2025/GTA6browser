import './asset-base.js';
// The scene-built campaign is the default. Retain the earlier city prototype.
if (new URLSearchParams(location.search).get('mode') === 'prototype') import('./main.js');
else import('./scenes/viewer.js');
