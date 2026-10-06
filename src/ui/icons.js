const paths = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  play: '<path d="m9 5 11 7-11 7Z"/>',
  pin: '<path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  map: '<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2ZM9 3v16M15 5v16"/>',
  car: '<path d="m5 7 2-3h10l2 3 2 4v7H3v-7ZM3 11h18M7 18v3M17 18v3M6 14h2M16 14h2"/>',
  settings: '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
  volume: '<path d="M11 4 5 9H2v6h3l6 5ZM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  reset: '<path d="M3 10a9 9 0 1 1 1 8M3 4v6h6"/>',
  expand: '<path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"/>',
  camera: '<path d="M4 7h4l2-3h4l2 3h4v13H4Z"/><circle cx="12" cy="13" r="4"/>',
  foot: '<path d="M13 9 9 14l-5 1M13 9l4 4h4M11 14l5 7M12 9l-2 6-4 6"/><circle cx="14" cy="4" r="2"/>',
  route: '<circle cx="5" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="M5 7v6a3 3 0 0 0 3 3h8a3 3 0 0 0 0-6h-5a3 3 0 0 1 0-6h6"/>',
  star: '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.3 9.4l6-.9Z"/>',
  wind: '<path d="M3 8h12a3 3 0 1 0-3-3M2 12h17a3 3 0 1 1-3 3M4 17h6a3 3 0 1 1-3 3"/>',
};
export const icon = (name, className = '') => `<svg class="icon ${className}" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
export const logo = `<svg class="brand-symbol" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="21" r="17" fill="none" stroke="currentColor" stroke-width="1"/><path d="M6 22h32M7 26h30M10 30h24M14 34h16" stroke="currentColor" stroke-width="1.8"/><path d="M22 22V9m0 5c-6-8-12-5-13-1 6-3 10-1 13 1Zm0 0c6-8 12-5 13-1-6-3-10-1-13 1Zm0 1c-6-3-9 0-10 3 5-2 8-2 10-3Zm0 0c6-3 9 0 10 3-5-2-8-2-10-3Z" fill="currentColor"/></svg><span class="brand-word">VICE<span>HORIZON</span></span>`;
