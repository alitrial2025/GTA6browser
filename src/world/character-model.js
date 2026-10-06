import * as THREE from 'three';

const skinColors = ['#bd8967', '#936347', '#d6a282', '#785441', '#e2ba98'];
const shirtColors = ['#cf9a86', '#e8dab2', '#709b9a', '#a1b7c4', '#d5b664', '#e9e3d4'];
export function createCharacter(index = 0, player = false) {
  const group = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: skinColors[index % skinColors.length], roughness: .85 });
  const shirt = new THREE.MeshStandardMaterial({ color: player ? '#e6c5a3' : shirtColors[index % shirtColors.length], roughness: .9 });
  const pants = new THREE.MeshStandardMaterial({ color: player ? '#405c65' : ['#54626b', '#bbb099', '#48555a'][index % 3], roughness: 1 });
  const hair = new THREE.MeshStandardMaterial({ color: '#342b26', roughness: 1 });
  const shoes = new THREE.MeshStandardMaterial({ color: '#e3dfd1', roughness: .9 });
  const add = (g, m, x, y, z, parent = group) => { const mesh = new THREE.Mesh(g, m); mesh.position.set(x, y, z); mesh.castShadow = true; parent.add(mesh); return mesh; };
  add(new THREE.CapsuleGeometry(.23, .34, 3, 8), shirt, 0, 1.13, 0);
  add(new THREE.CapsuleGeometry(.16, .14, 3, 10), skin, 0, 1.67, 0);
  const hairMesh = add(new THREE.SphereGeometry(.177, 10, 7, 0, Math.PI * 2, 0, Math.PI * .59), hair, 0, 1.75, -.013); hairMesh.scale.set(1, 1, 1.02);
  add(new THREE.SphereGeometry(.039, 6, 4), skin, 0, 1.68, .154);
  const limbs = [];
  for (const side of [-1, 1]) {
    const arm = new THREE.Group(); arm.position.set(side * .29, 1.36, 0); group.add(arm);
    add(new THREE.CapsuleGeometry(.072, .16, 3, 6), shirt, 0, -.10, 0, arm);
    add(new THREE.CapsuleGeometry(.054, .26, 3, 6), skin, 0, -.36, 0, arm);
    const leg = new THREE.Group(); leg.position.set(side * .12, .91, 0); group.add(leg);
    add(new THREE.CapsuleGeometry(.087, .61, 3, 6), pants, 0, -.37, 0, leg);
    add(new THREE.BoxGeometry(.15, .11, .3), shoes, 0, -.81, .06, leg);
    limbs.push({ arm, leg, side });
  }
  group.userData.animate = (time, speed) => {
    const stride = Math.sin(time * (speed > 3 ? 11 : 7)) * Math.min(speed * .24, .72);
    limbs.forEach(({ arm, leg, side }) => { arm.rotation.x = stride * side; leg.rotation.x = -stride * side; });
  };
  return group;
}
