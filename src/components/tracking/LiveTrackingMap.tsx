'use client'

/**
 * LiveTrackingMap — Real-time delivery tracking map using Leaflet.js
 *
 * Three pins: Restaurant (gold), Customer (blue), Staff (green animated scooter)
 * Smooth animation, live ETA, freshness indicator, auto-fit bounds.
 * Leaflet CSS imported from node_modules (not CDN — avoids tracking prevention blocks).
 * Default center: Chennai, Tamil Nadu when no coords available.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import 'leaflet/dist/leaflet.css'

// ─── Types ───────────────────────────────────────────────────────
interface LatLng { lat: number; lng: number }

export interface LiveTrackingMapProps {
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
export default function LiveTrackingMap({
  orderNumber,
  restaurantLat,
  restaurantLng,
  customerLat,
  customerLng,
  staffLocation,
  isMobile = false,
}: LiveTrackingMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const staffMarkerRef = useRef<any>(null)
  const restaurantMarkerRef = useRef<any>(null)
  const customerMarkerRef = useRef<any>(null)
  const accuracyCircleRef = useRef<any>(null)
  const animFrameRef = useRef<number | null>(null)
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

  // Init map
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current || mapRef.current) return

    const init = setTimeout(() => {
      import('leaflet').then((L) => {
        if (!containerRef.current || mapRef.current) return

        // Fix webpack marker icon paths
        const proto = L.Icon.Default.prototype as any
        delete proto._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: '/leaflet/marker-icon-2x.png',
          iconUrl: '/leaflet/marker-icon.png',
          shadowUrl: '/leaflet/marker-shadow.png',
        })

        // Default: Chennai. If restaurant has coords, centre there instead.
        const center: [number, number] =
          restaurantLat && restaurantLng
            ? [restaurantLat, restaurantLng]
            : [13.0827, 80.2707]
        const zoom = restaurantLat && restaurantLng ? 14 : 11

        const map = L.map(containerRef.current!, {
          center,
          zoom,
          zoomControl: true,
          scrollWheelZoom: true,
          dragging: true,
        })

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map)

        mapRef.current = map

        // invalidateSize needed when map is inside a dynamic/hidden container
        setTimeout(() => {
          map.invalidateSize()
          setMapReady(true)
        }, 120)
      })
    }, 60)

    return () => {
      clearTimeout(init)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // fitBounds
  const fitBounds = useCallback(
    (L: any, map: any) => {
      const pts: [number, number][] = []
      if (restaurantLat && restaurantLng) pts.push([restaurantLat, restaurantLng])
      if (customerLat && customerLng) pts.push([customerLat, customerLng])
      if (staffMarkerRef.current) {
        const p = staffMarkerRef.current.getLatLng()
        pts.push([p.lat, p.lng])
      }
      if (pts.length >= 2) map.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 16 })
      else if (pts.length === 1) map.setView(pts[0], 15)
    },
    [restaurantLat, restaurantLng, customerLat, customerLng]
  )

  // Place restaurant + customer pins
  useEffect(() => {
    if (!mapReady || !mapRef.current) return
    import('leaflet').then((L) => {
      const map = mapRef.current

      if (restaurantLat && restaurantLng) {
        if (restaurantMarkerRef.current) restaurantMarkerRef.current.remove()
        restaurantMarkerRef.current = L.marker([restaurantLat, restaurantLng], {
          icon: L.divIcon({
            html: `<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#C8964B,#E0B978);border:3px solid #fff;box-shadow:0 2px 8px rgba(200,150,75,0.6);display:flex;align-items:center;justify-content:center;"><svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M11 2a9 9 0 0 1 9 9c0 6-9 13-9 13S2 17 2 11a9 9 0 0 1 9-9zm0 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg></div>`,
            className: '', iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -20],
          }),
        }).addTo(map).bindPopup('<b>Restaurant</b>', { closeButton: false })
      }

      if (customerLat && customerLng) {
        if (customerMarkerRef.current) customerMarkerRef.current.remove()
        customerMarkerRef.current = L.marker([customerLat, customerLng], {
          icon: L.divIcon({
            html: `<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#2563EB,#60A5FA);border:3px solid #fff;box-shadow:0 2px 8px rgba(37,99,235,0.5);display:flex;align-items:center;justify-content:center;"><svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg></div>`,
            className: '', iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36],
          }),
        }).addTo(map).bindPopup('<b>Delivery Address</b>', { closeButton: false })
      }

      fitBounds(L, map)
    })
  }, [mapReady, restaurantLat, restaurantLng, customerLat, customerLng, fitBounds])

  // Smooth animation
  const animateMarker = useCallback((marker: any, from: LatLng, to: LatLng, ms = 900) => {
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - t0) / ms, 1)
      const e = 1 - (1 - p) ** 3 // ease-out cubic
      marker.setLatLng([from.lat + (to.lat - from.lat) * e, from.lng + (to.lng - from.lng) * e])
      if (p < 1) animFrameRef.current = requestAnimationFrame(tick)
    }
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    animFrameRef.current = requestAnimationFrame(tick)
  }, [])

  // Staff marker updates
  useEffect(() => {
    if (!mapReady || !mapRef.current || !staffLocation) return
    import('leaflet').then((L) => {
      const map = mapRef.current
      const { lat, lng, accuracy, timestamp } = staffLocation

      setLastUpdated(timestamp ?? Date.now() / 1000)
      setFreshness('Just now')
      if (customerLat && customerLng) setEta(calcEta({ lat, lng }, { lat: customerLat, lng: customerLng }))

      const icon = L.divIcon({
        html: `<div style="position:relative;width:44px;height:44px;"><div style="position:absolute;inset:0;border-radius:50%;background:rgba(22,163,74,0.25);animation:trackPulse 1.5s ease-out infinite;"></div><div style="position:absolute;top:4px;left:4px;width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#16A34A,#4ADE80);border:3px solid #fff;box-shadow:0 2px 12px rgba(22,163,74,0.5);display:flex;align-items:center;justify-content:center;"><svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M19 7c0-1.1-.9-2-2-2h-3v2h3v2.65L13.52 14H10V9H6C3.79 9 2 10.79 2 13v3h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4.48L19 10.35V7zM7 17c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/><path d="M5 6h5v2H5zm14 7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg></div></div>`,
        className: '', iconSize: [44, 44], iconAnchor: [22, 22], popupAnchor: [0, -24],
      })

      if (staffMarkerRef.current) {
        const prev = prevStaffPos.current ?? { lat, lng }
        animateMarker(staffMarkerRef.current, prev, { lat, lng })
        staffMarkerRef.current.setIcon(icon)
      } else {
        staffMarkerRef.current = L.marker([lat, lng], { icon, zIndexOffset: 1000 })
          .addTo(map).bindPopup('<b>Delivery Staff</b>', { closeButton: false })
        fitBounds(L, map)
      }
      prevStaffPos.current = { lat, lng }

      if (accuracyCircleRef.current) accuracyCircleRef.current.remove()
      if (accuracy && accuracy > 0 && accuracy < 500) {
        accuracyCircleRef.current = L.circle([lat, lng], {
          radius: accuracy, color: '#16A34A', fillColor: '#16A34A',
          fillOpacity: 0.06, weight: 1, opacity: 0.3,
        }).addTo(map)
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffLocation, mapReady])

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

      {/* Map — always full height so Leaflet can measure the container */}
      <div style={{ position: 'relative', height: h }}>
        <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
        {!mapReady && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, background: '#F8F6F2', zIndex: 1 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid #E8E4DE', borderTopColor: '#C8964B', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ fontSize: 12, color: '#AAA' }}>Loading map...</span>
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
        .leaflet-container { font-family: inherit; }
        .leaflet-popup-content-wrapper { border-radius:10px!important; box-shadow:0 4px 16px rgba(0,0,0,.12)!important; }
        .leaflet-control-zoom { border:none!important; box-shadow:0 2px 8px rgba(0,0,0,.1)!important; }
        .leaflet-control-zoom a { border-radius:6px!important; }
        .leaflet-control-attribution { font-size:9px!important; }
      `}</style>
    </div>
  )
}
