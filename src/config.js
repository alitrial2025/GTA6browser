export const WORLD = {
  seed: 60126,
  cell: 160,
  road: 26,
  minX: -1120,
  terrainMinX: -2600,
  maxX: 650,
  minZ: -1440,
  maxZ: 1440,
  exploreMaxZ: 3620,
  beachX: 650,
  oceanX: 755,
  spawn: { x: 480, y: 1.2, z: 70, heading: Math.PI },
};

export const DISTRICTS = [
  { name: 'Ocean Drive', x: 480, z: 0, color: '#eaae91', description: 'Pastel hotels. Palm-lined roads. Endless blue.' },
  { name: 'Downtown', x: -160, z: -320, color: '#79cbd0', description: 'Glass towers and streets that never sleep.' },
  { name: 'Little Havana', x: -640, z: 160, color: '#ecc37d', description: 'Sun-washed stucco and neighborhood rhythm.' },
  { name: 'Marina Bay', x: 320, z: 960, color: '#a9bddc', description: 'Yachts, waterfront views, and open roads.' },
  { name: 'North Shore', x: 480, z: -1120, color: '#aacfae', description: 'A quieter stretch of the Atlantic coast.' },
  { name: 'The Outskirts', x: -960, z: 960, color: '#c5aa91', description: 'Industrial blocks beyond the bright lights.' },
  { name: 'Grassrivers', x: -1760, z: 640, color: '#94b88c', description: 'Wetland trails, weathered cabins, and wild country.' },
  { name: 'The Keys', x: 610, z: 2700, color: '#7dcac1', description: 'Island villages connected by the ocean causeway.' },
];

export const ROUTES = [
  { id: 'coast', title: 'THE COASTAL RUN', subtitle: 'Take the long way home.', x: 480, z: -1120, reward: 1200, distance: '1.2 KM', district: 'NORTH SHORE' },
  { id: 'downtown', title: 'CITY AFTER HOURS', subtitle: 'A special delivery to the skyline.', x: -160, z: -320, reward: 1800, distance: '0.9 KM', district: 'DOWNTOWN' },
  { id: 'marina', title: 'SOUTHBOUND', subtitle: 'Meet your contact at the marina.', x: 320, z: 1120, reward: 2200, distance: '1.3 KM', district: 'MARINA BAY' },
  { id: 'keys', title: 'OVERSEAS', subtitle: 'Cross the causeway. Find the island hideaway.', x: 610, z: 2700, reward: 3500, distance: '3.0 KM', district: 'THE KEYS' },
];

export const VEHICLE_SPECS = [
  { name: 'SUNRISE GT', class: 'SPORT COUPE', color: '#e9a37b', mass: 1200, power: 4200, topSpeed: 57, handling: 1, price: 'Your ride' },
  { name: 'NIGHTFALL', class: 'GRAND TOURER', color: '#2f5464', mass: 1450, power: 5000, topSpeed: 64, handling: 0.9, price: 'Available' },
  { name: 'PALMETTO', class: 'STREET CLASSIC', color: '#bbd8bc', mass: 1550, power: 3600, topSpeed: 46, handling: 1.1, price: 'Available' },
];

export const DEFAULT_SETTINGS = { quality: 'high', time: 'noon', volume: 0.35, traffic: true, camera: 'chase', weather: 'clear' };

export const SCENES = [
  { name: 'The Keys', detail: 'THE OVERSEAS CAUSEWAY', camera: [1200,155,3330], target: [620,15,2170] },
  { name: 'Roadside Keys', detail: 'LIFE ON THE ISLANDS', camera: [623,2.6,2748], target: [730,3.8,2692] },
  { name: 'The Rusty Anchor', detail: 'COLD DRINKS. OCEAN AIR.', camera: [714,2.4,2728], target: [739,4.7,2675] },
  { name: 'Coral Cove', detail: 'ANOTHER WORLD BELOW', camera: [1014,-6,2720], target: [1010,-7,2697], underwater: true },
  { name: 'Marina Bay', detail: 'MEET AT THE WATERFRONT', camera: [835,6,1170], target: [900,2,1170] },
  { name: 'Palm Vista', detail: 'BETWEEN THE CITY AND THE SEA', camera: [450,30,190], target: [581,10,60] },
];
