'use client'

/**
 * GoogleMapsTracker — Real-time delivery tracking map using Google Maps JavaScript API.
 *
 * Three markers: Restaurant (gold), Customer (blue), Staff (green animated scooter)
 * Smooth animation, live ETA, freshness indicator, auto-fit bounds.
 * Uses environment variable NEXT_PUBLIC_GOOGLE_MAPS_API_KEY for API key.
 * Default center: India (centered on Delhi) when no coords available.
 */

import { useEffect, useRef, useState, useCallback } from 'react'

// ─── Types ───────────────────────────────────────────────────────
interface LatLng { lat: number; lng: number }

// Type guard for Google Maps API
function isGoogleMapsReady(): boolean {
  return typeof window !== 'undefined' && !!(window as any).google?.maps
}

function getGoogleMapsAPI() {
  if (!isGoogleMapsReady()) return null
  return (window as any).google.maps
}

export interface GoogleMapsTrackerProps {
  orderId: number
  orderNumber: string
  restaurantLat?: number | null
  restaurantLng?: number | null
  customerLat?: number | null
  customerLng?: number | null
  staffLocation?: { lat: number; lng: number; accuracy?: number; timestamp?: number } | null
  isMobile?: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────
function haversine(a: LatLng, b: LatLng): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

function calcEta(staff: LatLng, customer: LatLng): string {
  const dist = haversine(staff, customer)
  if (dist < 0.05) return 'Arriving now'
  const mins = Math.round((dist / 25) * 60)
  if (mins < 1) return 'Less than a minute'
  return `~${mins} min${mins > 1 ? 's' : ''} away`
}

// ─── Component ───────────────────────────────────────────────────
export default function GoogleMapsTracker({
  orderNumber,
  restaurantLat,
  restaurantLng,
  customerLat,
  customerLng,
  staffLocation,
  isMobile = false,
}: GoogleMapsTrackerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null) // google.maps.Map
  const staffMarkerRef = useRef<any>(null) // google.maps.Marker
  const restaurantMarkerRef = useRef<any>(null) // google.maps.Marker
  const customerMarkerRef = useRef<any>(null) // google.maps.Marker
  const accuracyCircleRef = useRef<any>(null) // google.maps.Circle
  const staffAnimIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const prevStaffPos = useRef<LatLng | null>(null)

  const [mapReady, setMapReady] = useState(false)
  const [eta, setEta] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const [freshness, setFreshness] = useState('')

  // Freshness ticker
  useEffect(() => {
    if (!lastUpdated) return
    const id = setInterval(() => {
      const s = Math.round(Date.now() / 1000 - lastUpdated)
      setFreshness(s < 5 ? 'Just now' : s < 60 ? `${s}s ago` : `${Math.round(s / 60)}m ago`)
    }, 1000)
    return () => clearInterval(id)
  }, [lastUpdated])

  // Load Google Maps API and init map
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current || mapRef.current) return

    let cancelled = false

    const ensureScript = (apiKey: string) => {
      return new Promise<void>((resolve, reject) => {
        if (isGoogleMapsReady()) {
          resolve()
          return
        }

        const existingScript = document.getElementById('fuji-google-maps-script') as HTMLScriptElement | null
        if (existingScript) {
          existingScript.addEventListener('load', () => resolve(), { once: true })
          existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Maps API')), { once: true })
          return
        }

        const script = document.createElement('script')
        script.id = 'fuji-google-maps-script'
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=maps`
        script.async = true
        script.defer = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Failed to load Google Maps API'))
        document.head.appendChild(script)
      })
    }

    const initializeMap = () => {
      if (!containerRef.current || !isGoogleMapsReady()) return

      const L = getGoogleMapsAPI()
      if (!L || mapRef.current) return

      const center = {
        lat: restaurantLat && restaurantLng ? restaurantLat : 28.7041,
        lng: restaurantLat && restaurantLng ? restaurantLng : 77.1025,
      }
      const zoom = restaurantLat && restaurantLng ? 14 : 5

      const map = new L.Map(containerRef.current, {
        center,
        zoom,
        mapTypeControl: true,
        mapTypeControlOptions: { style: 1, position: 2 },
        fullscreenControl: true,
        zoomControl: false,
        streetViewControl: false,
        mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID?.trim() || undefined,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#f4f1ec' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#6f6a62' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#f4f1ec' }, { weight: 2 }] },
          { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#d8d0c5' }] },
          { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#e9efe8' }] },
          { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eee9df' }] },
          { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#857b6d' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#fffdf9' }] },
          { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#ded7cc' }] },
          { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#e7dfd2' }] },
          { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#e4ded4' }] },
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      })

      mapRef.current = map
      setMapReady(true)
    }

    const init = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim()
        if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
          console.warn('Google Maps API key missing. Tracking map is disabled until NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set in .env.local.')
          setMapReady(false)
          return
        }

        await ensureScript(apiKey)
        if (!cancelled) initializeMap()
      } catch (error) {
        console.error('Error initializing map:', error)
      }
    }

    init()

    return () => {
      cancelled = true
      if (staffAnimIntervalRef.current) clearInterval(staffAnimIntervalRef.current)
      if (mapRef.current) {
        mapRef.current = null
      }
    }
  }, [restaurantLat, restaurantLng])

  // Fit bounds to show all markers
  const fitBounds = useCallback(() => {
    if (!mapRef.current || !isGoogleMapsReady()) return

    const L = getGoogleMapsAPI()
    if (!L) return

    const bounds = new L.LatLngBounds()
    let hasMarkers = false

    if (restaurantLat && restaurantLng) {
      bounds.extend({ lat: restaurantLat, lng: restaurantLng })
      hasMarkers = true
    }
    if (customerLat && customerLng) {
      bounds.extend({ lat: customerLat, lng: customerLng })
      hasMarkers = true
    }
    if (staffMarkerRef.current) {
      const pos = staffMarkerRef.current.getPosition()
      if (pos) {
        bounds.extend(pos)
        hasMarkers = true
      }
    }

    if (hasMarkers) {
      mapRef.current.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 })
      // Don't zoom in too much
      const listener = L.event.addListener(mapRef.current, 'zoom_changed', () => {
        const zoomLevel = mapRef.current!.getZoom()
        if (zoomLevel && zoomLevel > 16) {
          mapRef.current!.setZoom(16)
        }
        L.event.removeListener(listener)
      })
    }
  }, [restaurantLat, restaurantLng, customerLat, customerLng])

  // Crisp SVG markers stay sharp on high-density screens.
  const createMarkerIcon = (color: string, glyph: string, size = 42): any => {
    const L = getGoogleMapsAPI()
    if (!L) return null

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 3}" fill="${color}" stroke="#fff" stroke-width="3"/>${glyph}</svg>`
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      scaledSize: new L.Size(size, size),
      anchor: new L.Point(size / 2, size / 2),
      origin: new L.Point(0, 0),
    }
  }

  // Place restaurant + customer markers
  useEffect(() => {
    if (!mapReady || !mapRef.current || !isGoogleMapsReady()) return

    const L = getGoogleMapsAPI()
    if (!L || !mapRef.current) return

    // Restaurant marker
    if (restaurantLat && restaurantLng) {
      if (restaurantMarkerRef.current) restaurantMarkerRef.current.setMap(null)
      const icon = createMarkerIcon('#B98235', '<path d="M21 12.2a5.1 5.1 0 1 0-10.2 0c0 4.2 5.1 8.8 5.1 8.8s5.1-4.6 5.1-8.8Z" fill="none" stroke="#fff" stroke-width="2"/><circle cx="15.9" cy="12.2" r="1.8" fill="#fff"/>')
      restaurantMarkerRef.current = new L.Marker({
        position: { lat: restaurantLat, lng: restaurantLng },
        map: mapRef.current,
        title: 'Restaurant',
        icon: icon,
      })
      restaurantMarkerRef.current.addListener('click', () => {
        const infoWindow = new L.InfoWindow({
          content: '<div style="padding:4px;"><b>Restaurant</b></div>',
        })
        infoWindow.open(mapRef.current, restaurantMarkerRef.current)
      })
    }

    // Customer marker
    if (customerLat && customerLng) {
      if (customerMarkerRef.current) customerMarkerRef.current.setMap(null)
      const icon = createMarkerIcon('#2563EB', '<path d="M21 12.2a5.1 5.1 0 1 0-10.2 0c0 4.2 5.1 8.8 5.1 8.8s5.1-4.6 5.1-8.8Z" fill="none" stroke="#fff" stroke-width="2"/><circle cx="15.9" cy="12.2" r="1.8" fill="#fff"/>')
      customerMarkerRef.current = new L.Marker({
        position: { lat: customerLat, lng: customerLng },
        map: mapRef.current,
        title: 'Delivery Address',
        icon: icon,
      })
      customerMarkerRef.current.addListener('click', () => {
        const infoWindow = new L.InfoWindow({
          content: '<div style="padding:4px;"><b>Delivery Address</b></div>',
        })
        infoWindow.open(mapRef.current, customerMarkerRef.current)
      })
    }

    fitBounds()
  }, [mapReady, restaurantLat, restaurantLng, customerLat, customerLng, fitBounds])

  // Smooth animation for staff marker
  const animateMarker = useCallback((marker: any, from: LatLng, to: LatLng, duration = 900) => {
    if (!isGoogleMapsReady()) return

    const startTime = Date.now()
    const startLat = from.lat
    const startLng = from.lng
    const endLat = to.lat
    const endLng = to.lng

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)

      const newLat = startLat + (endLat - startLat) * eased
      const newLng = startLng + (endLng - startLng) * eased

      marker.setPosition({ lat: newLat, lng: newLng })

      if (progress < 1) {
        staffAnimIntervalRef.current = requestAnimationFrame(animate) as any
      }
    }

    if (staffAnimIntervalRef.current) {
      cancelAnimationFrame(staffAnimIntervalRef.current as any)
    }
    animate()
  }, [])

  // Staff marker updates
  useEffect(() => {
    if (!mapReady || !mapRef.current || !staffLocation || !isGoogleMapsReady()) return

    const L = getGoogleMapsAPI()
    if (!L || !mapRef.current) return

    const { lat, lng, accuracy, timestamp } = staffLocation

    setLastUpdated(timestamp ?? Math.floor(Date.now() / 1000))
    setFreshness('Just now')
    if (customerLat && customerLng) setEta(calcEta({ lat, lng }, { lat: customerLat, lng: customerLng }))

    const icon = createMarkerIcon('#159447', '<path d="M11 16.5h10M12 16.5l1.3-5.5h5.5l2.2 5.5M14 11V8.7h4.4l2.2 2.3M14.8 18.7a1.7 1.7 0 1 1-3.4 0 1.7 1.7 0 0 1 3.4 0Zm8 0a1.7 1.7 0 1 1-3.4 0 1.7 1.7 0 0 1 3.4 0Z" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>', 52)

    if (staffMarkerRef.current) {
      const prev = prevStaffPos.current ?? { lat, lng }
      animateMarker(staffMarkerRef.current, prev, { lat, lng })
      staffMarkerRef.current.setIcon(icon)
    } else {
      staffMarkerRef.current = new L.Marker({
        position: { lat, lng },
        map: mapRef.current,
        title: 'Delivery Staff',
        icon: icon,
        zIndex: 1000,
      })
      staffMarkerRef.current.addListener('click', () => {
        const infoWindow = new L.InfoWindow({
          content: '<div style="padding:4px;"><b>Delivery Staff</b></div>',
        })
        infoWindow.open(mapRef.current, staffMarkerRef.current)
      })
      fitBounds()
    }
    prevStaffPos.current = { lat, lng }

    // Accuracy circle
    if (accuracyCircleRef.current) accuracyCircleRef.current.setMap(null)
    if (accuracy && accuracy > 0 && accuracy < 500) {
      accuracyCircleRef.current = new L.Circle({
        center: { lat, lng },
        radius: accuracy,
        map: mapRef.current,
        fillColor: '#16A34A',
        fillOpacity: 0.06,
        strokeColor: '#16A34A',
        strokeWeight: 1,
        strokeOpacity: 0.3,
      })
    }
  }, [staffLocation, mapReady, customerLat, customerLng, animateMarker, fitBounds])

  const h = isMobile ? 250 : 360

  return (
    <div style={{ borderRadius: isMobile ? 16 : 20, overflow: 'hidden', border: '1px solid #E6E0D7', marginBottom: isMobile ? 12 : 16, boxShadow: '0 14px 36px rgba(44, 36, 25, 0.12)', background: '#fff' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '11px 14px' : '14px 18px', background: 'linear-gradient(135deg,#171717,#30302D)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative', width: 10, height: 10 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#16A34A', opacity: 0.4, animation: 'trackPulse 1.5s ease-out infinite' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#16A34A', position: 'absolute' }} />
          </div>
          <span style={{ fontSize: isMobile ? 10 : 11, fontWeight: 700, color: '#fff', letterSpacing: 1 }}>LIVE DELIVERY</span>
          <span style={{ fontSize: isMobile ? 10 : 11, color: '#A9A29A', marginLeft: 2 }}>#{orderNumber}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {eta && <span style={{ fontSize: isMobile ? 10 : 11, fontWeight: 700, color: '#F5D59B', background: 'rgba(200,150,75,0.18)', padding: '5px 9px', borderRadius: 999 }}>{eta}</span>}
          {freshness && <span style={{ fontSize: 10, color: '#AAA' }}>{freshness}</span>}
        </div>
      </div>

      {/* Map container */}
      <div style={{ position: 'relative', height: h }}>
        <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
        {!mapReady && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, background: '#F8F6F2', zIndex: 1, padding: 16, textAlign: 'center' }}>
            {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.trim() !== 'your_google_maps_api_key_here' ? (
              <>
                <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid #E8E4DE', borderTopColor: '#C8964B', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ fontSize: 12, color: '#666', fontWeight: 600 }}>Loading map…</span>
              </>
            ) : (
              <>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#7A5A1A' }}>Map unavailable</div>
                <span style={{ fontSize: 12, color: '#666', maxWidth: 260 }}>Add a valid Google Maps key to NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local to enable live tracking.</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 16, padding: isMobile ? '10px 14px' : '12px 18px', background: '#FFFDF9', borderTop: '1px solid #F0EDE8', flexWrap: 'wrap' }}>
        {[{ color: '#B98235', label: 'Restaurant' }, { color: '#2563EB', label: 'Current location' }, { color: '#159447', label: 'Delivery partner' }].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
            <span style={{ fontSize: 10, color: '#888' }}>{item.label}</span>
          </div>
        ))}
        {!staffLocation && <span style={{ fontSize: 10, color: '#BBB', marginLeft: 'auto' }}>Waiting for staff location...</span>}
      </div>

      <style>{`
        @keyframes trackPulse { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(2.5);opacity:0} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}
