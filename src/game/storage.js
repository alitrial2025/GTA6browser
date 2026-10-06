import { DEFAULT_SETTINGS } from '../config.js';

const KEY = 'vice-horizon-save-v1';
export function loadSave() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || '{}');
    const settings = { ...DEFAULT_SETTINGS };
    if (data.settings && typeof data.settings === 'object') {
      for (const [key, values] of Object.entries({ quality: ['high', 'balanced', 'low'], time: ['golden', 'noon', 'night'], camera: ['chase', 'hood', 'orbit'], weather: ['clear', 'rain'] })) {
        if (values.includes(data.settings[key])) settings[key] = data.settings[key];
      }
      if (typeof data.settings.volume === 'number') settings.volume = Math.max(0, Math.min(1, data.settings.volume));
      if (typeof data.settings.traffic === 'boolean') settings.traffic = data.settings.traffic;
    }
    const missions = {};
    for (const [key, fallback] of Object.entries({ cash: 1250, completed: 0, routeIndex: 0 })) {
      const value = data.missions?.[key]; missions[key] = Number.isSafeInteger(value) && value >= 0 ? value : fallback;
    }
    return { settings, missions };
  } catch { return { settings: { ...DEFAULT_SETTINGS }, missions: {} }; }
}
export function saveGame(settings, missions) {
  try { localStorage.setItem(KEY, JSON.stringify({ settings, missions: missions.save() })); } catch { /* Private browsing and quota limits must not break play. */ }
}
