/**
 * Global Google Maps type declarations
 * Supplements @types/google.maps for runtime Google Maps API
 */

declare global {
  interface Window {
    google?: {
      maps: typeof google.maps
    }
  }

  namespace google {
    namespace maps {
      class Map {
        constructor(element: HTMLElement, options?: MapOptions)
        fitBounds(bounds: LatLngBounds, padding?: number | Padding): void
        getZoom(): number | undefined
        setZoom(zoom: number): void
        setView(center: LatLngLiteral, zoom: number): void
        invalidateSize(): void
        remove(): void
      }

      class Marker {
        constructor(options?: MarkerOptions)
        setPosition(position: LatLngLiteral | LatLng): void
        getPosition(): LatLng | undefined
        setIcon(icon: string | Icon | Symbol): void
        setMap(map: Map | null): void
        addListener(eventName: string, callback: () => void): void
      }

      class LatLngBounds {
        extend(point: LatLng | LatLngLiteral): void
      }

      class Circle {
        constructor(options?: CircleOptions)
        setMap(map: Map | null): void
      }

      class InfoWindow {
        constructor(options?: InfoWindowOptions)
        open(map?: Map, anchor?: Marker): void
      }

      interface LatLngLiteral {
        lat: number
        lng: number
      }

      class LatLng {
        constructor(lat: number, lng: number)
      }

      interface MapOptions {
        center?: LatLngLiteral | LatLng
        zoom?: number
        mapTypeControl?: boolean
        mapTypeControlOptions?: { style?: number; position?: number }
        fullscreenControl?: boolean
        zoomControl?: boolean
        streetViewControl?: boolean
        mapId?: string
        styles?: MapTypeStyle[]
      }

      interface MarkerOptions {
        position?: LatLngLiteral | LatLng
        map?: Map
        title?: string
        icon?: string | Icon | Symbol
        zIndex?: number
      }

      interface CircleOptions {
        center?: LatLngLiteral | LatLng
        radius?: number
        map?: Map
        fillColor?: string
        fillOpacity?: number
        strokeColor?: string
        strokeWeight?: number
        strokeOpacity?: number
      }

      interface InfoWindowOptions {
        content?: string | HTMLElement
      }

      interface MapTypeStyle {
        featureType?: string
        elementType?: string
        stylers?: Array<{ [key: string]: any }>
      }

      interface Padding {
        top: number
        right: number
        bottom: number
        left: number
      }

      interface Icon {
        url?: string
        scaledSize?: Size
        anchor?: Point
        origin?: Point
      }

      interface Symbol {
        path?: SymbolPath | string
        scale?: number
        fillColor?: string
        fillOpacity?: number
        strokeColor?: string
        strokeWeight?: number
      }

      enum SymbolPath {
        CIRCLE = 0,
      }

      class Size {
        constructor(width: number, height: number)
      }

      class Point {
        constructor(x: number, y: number)
      }

      namespace event {
        function addListener(
          instance: any,
          eventName: string,
          handler: () => void
        ): void
        function removeListener(listener: any): void
      }
    }
  }
}

export {}
