import { LofiStation, LofiStationId } from '../types';

export const LOFI_STATIONS: Record<LofiStationId, LofiStation> = {
  study: {
    id: 'study',
    label: 'Study & Chill',
    subLabel: 'Lofi hip hop beats to study / relax to',
    youtubeId: 'TURbeWK2wwg', // Lofi Girl Study Session (Guaranteed 100% embed)
    thumbnail: '/cyan-theme-bg.jpg',
    mood: 'Relaxed focus & calm study flow',
  },
  work: {
    id: 'work',
    label: 'Deep Work',
    subLabel: 'Synthwave & Chillhop for deep flow state',
    youtubeId: '4xDzrJKXOOY', // Lofi Girl Synthwave / ChillHop Focus
    thumbnail: '/blue-theme-bg.png',
    mood: 'High concentration coding & deep productivity',
  },
  coffee: {
    id: 'coffee',
    label: 'Cozy Cafe',
    subLabel: 'Warm morning coffee jazz & chillhop',
    youtubeId: '1fueZCTYkpA', // Lofi Girl Morning Coffee Jazz (Guaranteed 100% embed)
    thumbnail: '/monochrome-theme-bg.jpg',
    mood: 'Comfortable cafe ambiance & creative energy',
  },
};

export const LOFI_STATION_LIST = Object.values(LOFI_STATIONS);
