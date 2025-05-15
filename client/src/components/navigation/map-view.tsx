import React, { useEffect, useState, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Route } from "@/types";

interface MapViewProps {
  origin?: [number, number];
  destination?: [number, number];
  route?: Route;
  onMapLoaded?: () => void;
}

export function MapView({ origin, destination, route, onMapLoaded }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Fetch route if origin and destination are provided
  const { data: routeData } = useQuery<Route>({
    queryKey: ['/api/directions', origin, destination],
    enabled: !!origin && !!destination,
  });

  // Initialize Google Maps once we have API key
  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google || !window.google.maps) return;
    
    // Default center (New Delhi, India)
    const defaultCenter = { lat: 28.6139, lng: 77.2090 };
    
    // Calculate center based on available points
    const center = origin 
      ? { lat: origin[1], lng: origin[0] } 
      : destination 
        ? { lat: destination[1], lng: destination[0] } 
        : defaultCenter;
    
    try {
      // Create Google Map instance
      const googleMap = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 12,
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: true
      });
      
      setMap(googleMap);
      setIsMapLoaded(true);
      
      // Call onMapLoaded
      if (onMapLoaded) {
        onMapLoaded();
      }
    } catch (err) {
      console.error("Error initializing map:", err);
      setLoadError("Failed to initialize Google Maps");
    }
  }, [onMapLoaded, origin, destination]);

  // Update map markers and route when data changes
  const updateMapContent = useCallback(() => {
    if (!map || !window.google) return;
    
    // Clear existing markers and routes
    map.__markers = map.__markers || [];
    map.__polylines = map.__polylines || [];
    
    // Remove all existing markers
    map.__markers.forEach((marker: any) => marker.setMap(null));
    map.__markers = [];
    
    // Remove existing polylines
    map.__polylines.forEach((polyline: any) => polyline.setMap(null));
    map.__polylines = [];
    
    // Add origin marker
    if (origin) {
      const originMarker = new window.google.maps.Marker({
        position: { lat: origin[1], lng: origin[0] },
        map: map,
        title: "Current Location",
      });
      map.__markers.push(originMarker);
    }
    
    // Add destination marker
    if (destination) {
      const destMarker = new window.google.maps.Marker({
        position: { lat: destination[1], lng: destination[0] },
        map: map,
        title: "Destination"
      });
      map.__markers.push(destMarker);
    }
    
    // Add route if available
    const displayRoute = route || routeData;
    if (displayRoute?.geometry?.coordinates?.length) {
      try {
        // Convert coordinates to Google Maps format
        const path = displayRoute.geometry.coordinates.map(
          ([lng, lat]) => ({ lat, lng })
        );
        
        // Create polyline
        const polyline = new window.google.maps.Polyline({
          path,
          geodesic: true,
          strokeColor: "#0C2E67", // Suzuki blue
          strokeOpacity: 1.0,
          strokeWeight: 5,
          map
        });
        
        map.__polylines.push(polyline);
        
        // Fit bounds to show the entire route
        if (path.length > 1) {
          const bounds = new window.google.maps.LatLngBounds();
          path.forEach(point => bounds.extend(point));
          map.fitBounds(bounds);
        }
      } catch (err) {
        console.error("Error drawing route:", err);
      }
    }
    
    // Set appropriate view if no route
    if (!displayRoute && origin && destination) {
      try {
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend({ lat: origin[1], lng: origin[0] });
        bounds.extend({ lat: destination[1], lng: destination[0] });
        map.fitBounds(bounds);
      } catch (err) {
        console.error("Error setting map bounds:", err);
      }
    }
  }, [map, origin, destination, route, routeData]);

  // Define interface for maps config
  interface MapsConfig {
    googleMapsApiKey: string;
  }
  
  // Fetch Google Maps API key
  const { data: mapsConfig } = useQuery<MapsConfig>({
    queryKey: ['/api/config/maps'],
  });

  // Initialize the Google Maps script
  useEffect(() => {
    if (!mapsConfig?.googleMapsApiKey) return;

    // Only load the Google Maps script once
    if (!window.google || !window.google.maps) {
      // Create script element
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsConfig.googleMapsApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      // Initialize map when script loads
      script.onload = () => {
        initializeMap();
      };
      
      // Add script to document
      document.head.appendChild(script);
      
      // Clean up
      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    } else {
      // Google Maps already loaded, initialize map directly
      initializeMap();
    }
  }, [initializeMap, mapsConfig]);

  // Update map content when data or map changes
  useEffect(() => {
    if (map && window.google && isMapLoaded) {
      updateMapContent();
    }
  }, [map, updateMapContent, isMapLoaded, origin, destination, route, routeData]);

  return (
    <div className="relative h-[calc(100vh-190px)] bg-gray-200">
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 z-10">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p className="text-red-500">{loadError}</p>
          </div>
        </div>
      )}
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
