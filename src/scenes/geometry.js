import * as THREE from 'three';

export function ellipsePoints(rx, rz, y = 0, segments = 96, phase = 0, wave = 0) {
  return Array.from({ length: segments }, (_, i) => {
    const a = i / segments * Math.PI * 2;
    const swell = 1 + wave * Math.cos(a * 2 + phase);
    return new THREE.Vector3(Math.cos(a) * rx * swell, y, Math.sin(a) * rz * swell);
  });
}

export function polygonSlab(points, depth = 1) {
  const shape = new THREE.Shape(points.map(p => new THREE.Vector2(p.x, -p.z)));
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 32 });
  geometry.rotateX(-Math.PI / 2); return geometry;
}

export function beltGeometry(outer, inner, bottom, height, caps = true) {
  const p = [], indices = [], uv = [], count = outer.length;
  for (let i = 0; i < count; i++) {
    const a = outer[i], b = inner[i];
    p.push(a.x, bottom, a.z, a.x, bottom + height, a.z, b.x, bottom, b.z, b.x, bottom + height, b.z);
    uv.push(i / count * 12, 0, i / count * 12, 1, i / count * 12, 0, i / count * 12, 1);
  }
  for (let i = 0; i < count; i++) {
    const a = i * 4, b = (i + 1) % count * 4;
    indices.push(a, a + 1, b, b, a + 1, b + 1, a + 2, b + 2, a + 3, a + 3, b + 2, b + 3);
    if (caps) indices.push(a + 1, a + 3, b + 1, b + 1, a + 3, b + 3, a, b, a + 2, a + 2, b, b + 2);
  }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geometry.setIndex(indices); geometry.computeVertexNormals(); return geometry;
}

export function ribbon(points, width, y) {
  const curve = new THREE.CatmullRomCurve3(points), positions = [], uvs = [], indices = [];
  for (let i = 0; i <= 128; i++) {
    const t = i / 128, point = curve.getPoint(t), tangent = curve.getTangent(t), normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    for (const side of [-1, 1]) { const v = point.clone().addScaledVector(normal, width * side / 2); positions.push(v.x, y, v.z); uvs.push(side === -1 ? 0 : 1, t * 20); }
    if (i < 128) { const n = i * 2; indices.push(n, n + 1, n + 2, n + 1, n + 3, n + 2); }
  }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); geometry.setIndex(indices); geometry.computeVertexNormals(); return geometry;
}
