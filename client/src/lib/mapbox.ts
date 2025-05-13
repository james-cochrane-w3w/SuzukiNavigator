import mapboxgl from "mapbox-gl";
import { Route } from "@/types";

// Initialize mapbox with the API key
export const initMapbox = () => {
  const apiKey = import.meta.env.VITE_MAPBOX_KEY || "";
  if (!apiKey) {
    console.error("Mapbox API key is missing. Please provide a valid API key.");
    return;
  }
  
  mapboxgl.accessToken = apiKey;
};

// Get directions between two points
export const getDirections = async (origin: [number, number], destination: [number, number]): Promise<Route | null> => {
  try {
    const response = await fetch(`/api/directions?origin=${origin.join(',')}&destination=${destination.join(',')}`);
    
    if (!response.ok) {
      throw new Error('Failed to get directions');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting directions:', error);
    return null;
  }
};

// Create a marker element
export const createMarker = (type: 'origin' | 'destination'): HTMLElement => {
  const el = document.createElement('div');
  el.className = 'marker';
  
  if (type === 'origin') {
    el.innerHTML = '<span class="material-icons text-[hsl(var(--suzuki-blue))] text-3xl">my_location</span>';
  } else {
    el.innerHTML = '<span class="material-icons text-[hsl(var(--suzuki-red))] text-3xl">place</span>';
  }
  
  return el;
};

// Add a route to the map
export const addRouteToMap = (map: mapboxgl.Map, route: Route): void => {
  // Remove existing route layer if exists
  if (map.getSource('route')) {
    map.removeLayer('route');
    map.removeSource('route');
  }
  
  // Add route to map
  map.addSource('route', {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: route.geometry
    }
  });
  
  map.addLayer({
    id: 'route',
    type: 'line',
    source: 'route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#0C2E67', // Suzuki blue
      'line-width': 8
    }
  });
};
