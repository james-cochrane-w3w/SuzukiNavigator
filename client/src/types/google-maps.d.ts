declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google.maps {
  class Map {
    constructor(element: HTMLElement, options?: MapOptions);
    setCenter(latLng: LatLng | LatLngLiteral): void;
    setZoom(zoom: number): void;
    fitBounds(bounds: LatLngBounds, padding?: number): void;
    controls: {
      [index: number]: MVCArray<Node>;
    };
  }

  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }

  class LatLngBounds {
    constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral);
    extend(latLng: LatLng | LatLngLiteral): LatLngBounds;
  }

  class Marker {
    constructor(opts: MarkerOptions);
    setMap(map: Map | null): void;
  }

  class Polyline {
    constructor(opts: PolylineOptions);
    setMap(map: Map | null): void;
  }

  class MVCArray<T> {
    push(element: T): number;
  }

  const ControlPosition: {
    RIGHT_BOTTOM: number;
    TOP_RIGHT: number;
    BOTTOM_CENTER: number;
  };

  const SymbolPath: {
    CIRCLE: number;
    MARKER: number;
  };

  interface MapOptions {
    center: LatLng | LatLngLiteral;
    zoom: number;
    fullscreenControl?: boolean;
    mapTypeControl?: boolean;
    streetViewControl?: boolean;
    zoomControl?: boolean;
    zoomControlOptions?: {
      position: number;
    };
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  interface MarkerOptions {
    position: LatLng | LatLngLiteral;
    map: Map | null;
    title?: string;
    icon?: {
      path: number;
      fillColor: string;
      fillOpacity: number;
      strokeColor: string;
      strokeWeight: number;
      scale: number;
    } | string;
  }

  interface PolylineOptions {
    path: Array<LatLng | LatLngLiteral>;
    geodesic?: boolean;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
    map: Map | null;
  }
}

export {};