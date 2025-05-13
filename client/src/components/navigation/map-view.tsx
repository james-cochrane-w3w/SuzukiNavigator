import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useQuery } from "@tanstack/react-query";
import { Route } from "@/types";

// Import Leaflet zoom control CSS
import "leaflet/dist/leaflet.css";

// Define custom icon components for markers
const createCustomIcon = (iconName: string, color: string): L.DivIcon => {
  return L.divIcon({
    className: 'custom-icon',
    html: `<span class="material-icons" style="color: ${color}; font-size: 2rem; filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.3));">${iconName}</span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24]
  });
};

// Route polyline component
function RouteLayer({ route }: { route?: Route }) {
  const map = useMap();
  
  useEffect(() => {
    if (!route || !route.geometry) return;
    
    // Clear existing route layers
    map.eachLayer((layer: L.Layer) => {
      if ((layer as any)._path && (layer as any)._path.classList.contains('route-path')) {
        map.removeLayer(layer);
      }
    });
    
    // Create polyline from route coordinates
    const coordinates = route.geometry.coordinates.map(
      ([lng, lat]) => [lat, lng] as [number, number]
    );
    
    const polyline = L.polyline(coordinates, {
      color: '#0C2E67', // Suzuki blue
      weight: 8,
      className: 'route-path'
    }).addTo(map);
    
    // Fit map to bounds if available
    if (route.bounds) {
      const sw = L.latLng(route.bounds[0][1], route.bounds[0][0]);
      const ne = L.latLng(route.bounds[1][1], route.bounds[1][0]);
      const bounds = L.latLngBounds(sw, ne);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    }
    
    return () => {
      map.removeLayer(polyline);
    };
  }, [map, route]);
  
  return null;
}

// Map recenter component
function MapController({ center }: { center?: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.flyTo([center[1], center[0]], 14);
    }
  }, [map, center]);
  
  return null;
}

// Custom controls built as a leaflet control
function MapZoomControls() {
  const map = useMap();
  
  useEffect(() => {
    // Create container for our custom control
    const controlContainer = L.DomUtil.create('div', 'custom-map-controls leaflet-control');
    controlContainer.style.position = 'absolute';
    controlContainer.style.bottom = '20px';
    controlContainer.style.right = '20px';
    controlContainer.style.zIndex = '1000';
    controlContainer.style.display = 'flex';
    controlContainer.style.flexDirection = 'column';
    controlContainer.style.gap = '8px';
    
    // Create my location button
    const locationButton = createControlButton('my_location', 'Get your current location');
    locationButton.addEventListener('click', (e) => {
      L.DomEvent.stopPropagation(e);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          map.flyTo(
            [position.coords.latitude, position.coords.longitude],
            14
          );
        },
        (err) => {
          console.error("Error getting current location:", err);
        }
      );
    });
    
    // Create zoom in button
    const zoomInButton = createControlButton('add', 'Zoom in');
    zoomInButton.addEventListener('click', (e) => {
      L.DomEvent.stopPropagation(e);
      map.zoomIn();
    });
    
    // Create zoom out button
    const zoomOutButton = createControlButton('remove', 'Zoom out');
    zoomOutButton.addEventListener('click', (e) => {
      L.DomEvent.stopPropagation(e);
      map.zoomOut();
    });
    
    // Add buttons to container
    controlContainer.appendChild(locationButton);
    controlContainer.appendChild(zoomInButton);
    controlContainer.appendChild(zoomOutButton);
    
    // Add container to the map
    document.querySelector('.leaflet-container')?.appendChild(controlContainer);
    
    // Clean up on unmount
    return () => {
      controlContainer.remove();
    };
  }, [map]);
  
  // Function to create a control button
  function createControlButton(iconName: string, title: string): HTMLDivElement {
    const button = L.DomUtil.create('div');
    button.className = 'bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md cursor-pointer';
    button.setAttribute('title', title);
    button.innerHTML = `<span class="material-icons">${iconName}</span>`;
    button.style.backgroundColor = 'white';
    button.style.width = '40px';
    button.style.height = '40px';
    button.style.borderRadius = '50%';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
    button.style.cursor = 'pointer';
    
    return button;
  }
  
  return null;
}

interface MapViewProps {
  origin?: [number, number];
  destination?: [number, number];
  route?: Route;
  onMapLoaded?: () => void;
}

export function MapView({ origin, destination, route, onMapLoaded }: MapViewProps) {
  // Ensure markers update when props change
  const [key, setKey] = useState(0);
  
  // Fetch route if origin and destination are provided
  const { data: routeData } = useQuery<Route>({
    queryKey: ['/api/directions', origin, destination],
    enabled: !!origin && !!destination,
  });
  
  // Update key when origin or destination changes to force re-render
  useEffect(() => {
    setKey(prev => prev + 1);
  }, [origin, destination]);
  
  // Call onMapLoaded when the map is ready
  useEffect(() => {
    if (onMapLoaded) {
      onMapLoaded();
    }
  }, [onMapLoaded]);
  
  const originIcon = createCustomIcon('my_location', 'hsl(217, 84%, 22%)'); // Suzuki blue
  const destinationIcon = createCustomIcon('place', 'hsl(0, 84%, 45%)'); // Suzuki red
  
  // Default center (New Delhi, India)
  const defaultCenter: [number, number] = [28.6139, 77.2090];
  
  // Calculate center based on available points
  const center = origin ? [origin[1], origin[0]] as [number, number] :
               destination ? [destination[1], destination[0]] as [number, number] :
               defaultCenter;
  
  return (
    <div className="relative h-[calc(100vh-190px)] bg-gray-200">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        key={key}
        zoomControl={true}
      >
        {/* Base map tiles */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Controller to handle map view changes */}
        {(origin || destination) && <MapController center={origin || destination} />}
        
        {/* Origin marker */}
        {origin && (
          <Marker 
            position={[origin[1], origin[0]]} 
            icon={originIcon as unknown as L.Icon}
          >
            <Popup>Current Location</Popup>
          </Marker>
        )}
        
        {/* Destination marker */}
        {destination && (
          <Marker 
            position={[destination[1], destination[0]]} 
            icon={destinationIcon as unknown as L.Icon}
          >
            <Popup>Destination</Popup>
          </Marker>
        )}
        
        {/* Route polyline */}
        {(route || routeData) && <RouteLayer route={route || (routeData as Route | undefined)} />}
        {/* Using Leaflet's built-in zoom control */}
      </MapContainer>
    </div>
  );
}
