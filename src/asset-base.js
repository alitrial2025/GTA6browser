import * as THREE from 'three';
export const asset=path=>import.meta.env.BASE_URL+path.replace(/^\/+/,'');
// GLTF, HDR and texture loaders all use this manager. Keep public assets local
// while supporting a repository subpath on GitHub Pages.
THREE.DefaultLoadingManager.setURLModifier(url=>url.startsWith('/')?asset(url):url);
