import * as THREE from 'three';

export class Batch {
  constructor(scene) { this.scene = scene; this.groups = new Map(); this.dummy = new THREE.Object3D(); }
  add(geometry, material, x, y, z, sx = 1, sy = 1, sz = 1, ry = 0, rz = 0, rx = 0) {
    // Spatially partition foliage so distant palms and forests can be culled.
    const chunk = geometry.attributes.position.count > 40 ? `:${Math.floor(x / 480)}:${Math.floor(z / 480)}` : '';
    const id = geometry.uuid + ':' + (Array.isArray(material) ? material.map(m => m.uuid).join(':') : material.uuid) + chunk;
    if (!this.groups.has(id)) this.groups.set(id, { geometry, material, matrices: [] });
    this.dummy.position.set(x, y, z); this.dummy.scale.set(sx, sy, sz); this.dummy.rotation.set(rx, ry, rz);
    this.dummy.updateMatrix(); this.groups.get(id).matrices.push(this.dummy.matrix.clone());
  }
  flush() {
    for (const { geometry, material, matrices } of this.groups.values()) {
      const mesh = new THREE.InstancedMesh(geometry, material, matrices.length);
      matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
      mesh.castShadow = true; mesh.receiveShadow = true;
      mesh.computeBoundingSphere(); this.scene.add(mesh);
    }
    this.groups.clear();
  }
  addMatrix(geometry, material, matrix) {
    const id = geometry.uuid + ':' + material.uuid;
    if (!this.groups.has(id)) this.groups.set(id, { geometry, material, matrices: [] });
    this.groups.get(id).matrices.push(matrix.clone());
  }
}

export function palmLeafGeometry() {
  const positions = [], normals = [], uvs = [], indices = [];
  const segments = 18;
  const curve = t => Math.sin(t * Math.PI * .75) * 1.1 - t * t * 2.6;
  const quad = (a, b, c, d) => { const n = positions.length / 3; for (const p of [a,b,c,d]) { positions.push(...p); normals.push(0,1,0); uvs.push(0,0); } indices.push(n,n+1,n+2,n+1,n+3,n+2); };
  for (let i = 0; i < segments; i++) {
    const t = i / segments, t1 = (i + 1) / segments, z = t * 5.5, y = curve(t);
    quad([-.025,y,z],[.025,y,z],[-.025,curve(t1),t1*5.5],[.025,curve(t1),t1*5.5]);
    if (i < 2) continue;
    const width = Math.sin(t * Math.PI) * 1.1;
    for (const side of [-1, 1]) quad([0,y,z],[0,curve(t+.025),z+.14],[side*width,y-.17-width*.2,z+.37],[side*width*.95,y-.18-width*.2,z+.45]);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); g.setIndex(indices); g.computeVertexNormals(); return g;
}
