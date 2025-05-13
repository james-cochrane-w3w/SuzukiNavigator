import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import { useQuery } from "@tanstack/react-query";
import { Route } from "@/types";

interface MapViewProps {
  origin?: [number, number];
  destination?: [number, number];
  route?: Route;
  onMapLoaded?: () => void;
}

export function MapView({ origin, destination, route, onMapLoaded }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Fetch route if origin and destination are provided
  const { data: routeData } = useQuery({
    queryKey: ['/api/directions', origin, destination],
    enabled: !!origin && !!destination,
  });
  
  // Initialize map
  useEffect(() => {
    if (mapContainer.current && !map.current) {
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY || "";
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [77.2090, 28.6139], // Default center (New Delhi, India)
        zoom: 12
      });

      map.current.on('load', () => {
        setLoaded(true);
        if (onMapLoaded) onMapLoaded();
      });
    }
  }, [onMapLoaded]);

  // Add origin marker
  useEffect(() => {
    if (loaded && map.current && origin) {
      // Remove existing marker if any
      const originMarkerEl = document.getElementById('origin-marker');
      if (originMarkerEl) originMarkerEl.remove();

      // Create new marker element
      const el = document.createElement('div');
      el.className = 'marker';
      el.id = 'origin-marker';
      el.innerHTML = '<span class="material-icons text-[hsl(var(--suzuki-blue))] text-3xl drop-shadow-lg">my_location</span>';
      
      // Add marker to map
      new mapboxgl.Marker(el)
        .setLngLat([origin[0], origin[1]])
        .addTo(map.current);

      // Center map on origin
      map.current.flyTo({
        center: [origin[0], origin[1]],
        zoom: 14,
        essential: true
      });
    }
  }, [loaded, origin]);

  // Add destination marker
  useEffect(() => {
    if (loaded && map.current && destination) {
      // Remove existing marker if any
      const destMarkerEl = document.getElementById('destination-marker');
      if (destMarkerEl) destMarkerEl.remove();

      // Create new marker element
      const el = document.createElement('div');
      el.className = 'marker';
      el.id = 'destination-marker';
      el.innerHTML = '<span class="material-icons text-[hsl(var(--suzuki-red))] text-3xl drop-shadow-lg">place</span>';
      
      // Add marker to map
      new mapboxgl.Marker(el)
        .setLngLat([destination[0], destination[1]])
        .addTo(map.current);

      // If there's no origin, center map on destination
      if (!origin) {
        map.current.flyTo({
          center: [destination[0], destination[1]],
          zoom: 14,
          essential: true
        });
      }
    }
  }, [loaded, destination, origin]);

  // Draw route on map
  useEffect(() => {
    if (loaded && map.current && (route || routeData)) {
      const routeToUse = route || routeData;
      
      if (routeToUse?.geometry) {
        // Remove existing route layer if exists
        if (map.current.getSource('route')) {
          map.current.removeLayer('route');
          map.current.removeSource('route');
        }
        
        // Add route to map
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: routeToUse.geometry
          }
        });
        
        map.current.addLayer({
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

        // Fit map to route bounds
        if (routeToUse.bounds) {
          map.current.fitBounds(routeToUse.bounds, {
            padding: 50,
            duration: 1000
          });
        }
      }
    }
  }, [loaded, route, routeData]);

  return (
    <div className="relative h-[calc(100vh-190px)] bg-gray-200">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Map controls */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
        <button className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md">
          <span className="material-icons">my_location</span>
        </button>
        <button className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md">
          <span className="material-icons">add</span>
        </button>
        <button className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md">
          <span className="material-icons">remove</span>
        </button>
      </div>
    </div>
  );
}
