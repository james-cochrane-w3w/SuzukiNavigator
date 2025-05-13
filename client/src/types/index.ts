// Search result types
export interface SearchResult {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number]; // [longitude, latitude]
  type: 'address' | 'poi' | 'w3w';
}

// Route types
export interface RouteStep {
  distance: number;
  duration: number;
  instruction: string;
  maneuver: string;
  name: string;
}

export interface Route {
  distance: number;
  duration: number;
  geometry: {
    type: string;
    coordinates: [number, number][];
  };
  bounds?: [[number, number], [number, number]];
  steps?: RouteStep[];
}

// Geocoding result
export interface GeocodingResult {
  id: string;
  name: string;
  place_name: string;
  center: [number, number];
}

// What3Words result
export interface W3WResult {
  words: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  language: string;
  map: string;
  nearestPlace: string;
}
