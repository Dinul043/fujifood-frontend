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
        fullscreenControl: true,
        streetViewControl: false,
        styles: [
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

  // Create custom marker icon
  const createMarkerIcon = (color: string, svgPath: string): any => {
    const canvas = document.createElement('canvas')
    canvas.width = 44
    canvas.height = 44
    const ctx = canvas.getContext('2d')!

    // Draw circle background
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(22, 22, 18, 0, Math.PI * 2)
    ctx.fill()

    // Draw border
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 3
    ctx.stroke()

    // Add shadow
    ctx.shadowColor = `rgba(0, 0, 0, 0.3)`
    ctx.shadowBlur = 8
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 2

    const L = getGoogleMapsAPI()
    if (!L) return null

    return {
      url: canvas.toDataURL(),
      scaledSize: new L.Size(44, 44),
      anchor: new L.Point(22, 22),
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
      const icon = {
        path: L.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#C8964B',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 3,
      }
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
      const icon = {
        path: L.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#2563EB',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 3,
      }
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

    const icon = {
      path: L.SymbolPath.CIRCLE,
      scale: 14,
      fillColor: '#16A34A',
      fillOpacity: 1,
      strokeColor: '#fff',
      strokeWeight: 3,
    }

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

  const h = isMobile ? 200 : 280

  return (
    <div style={{ borderRadius: isMobile ? 10 : 12, overflow: 'hidden', border: '1px solid #E8E4DE', marginBottom: isMobile ? 8 : 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '8px 12px' : '10px 16px', background: 'linear-gradient(135deg,#1A1A1A,#2D2D2D)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative', width: 10, height: 10 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#16A34A', opacity: 0.4, animation: 'trackPulse 1.5s ease-out infinite' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#16A34A', position: 'absolute' }} />
          </div>
          <span style={{ fontSize: isMobile ? 11 : 12, fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>LIVE TRACKING</span>
          <span style={{ fontSize: isMobile ? 10 : 11, color: '#888', marginLeft: 2 }}>#{orderNumber}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {eta && <span style={{ fontSize: isMobile ? 11 : 12, fontWeight: 700, color: '#C8964B', background: 'rgba(200,150,75,0.15)', padding: '3px 8px', borderRadius: 6 }}>{eta}</span>}
          {freshness && <span style={{ fontSize: 10, color: '#666' }}>{freshness}</span>}
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
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 16, padding: isMobile ? '6px 12px' : '8px 16px', background: '#FAFAF8', borderTop: '1px solid #F0EDE8', flexWrap: 'wrap' }}>
        {[{ color: '#C8964B', label: 'Restaurant' }, { color: '#2563EB', label: 'Delivery address' }, { color: '#16A34A', label: 'Delivery staff' }].map(item => (
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
