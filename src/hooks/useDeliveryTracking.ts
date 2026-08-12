/**
 * useDeliveryTracking — Per-order GPS → WebSocket tracking.
 *
 * Architecture:
 *   - Module-level singleton stores active tracking sessions
 *   - Survives component remounts (desktop ↔ mobile switch)
 *   - Each order has its own independent tracking state
 *   - One shared WebSocket per userId (multiplexed by order_id in payload)
 *
 * State per order:
 *   trackingMap[order_id] = { state, accuracy, sendCount, lastSent, error }
 */

import { useState, useRef, useCallback, useEffect } from 'react'

export type TrackingState = 'idle' | 'requesting' | 'tracking' | 'stopped' | 'error'
export type TrackingError =
  | 'permission_denied'
  | 'position_unavailable'
  | 'timeout'
  | 'not_assigned'
  | null

export interface OrderTrackingStatus {
  state: TrackingState
  error: TrackingError
  accuracy: number | null
  sendCount: number
  lastSent: number | null
}

// ─── Module-level singleton ───────────────────────────────────────
// Survives React component unmount/remount (desktop ↔ mobile switch)

const WS_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1')
  .replace(/\/api\/v1$/, '')
  .replace(/^http/, 'ws')

interface TrackingSession {
  orderId: number
  watchId: number | null          // geolocation watchPosition id
  simInterval: ReturnType<typeof setInterval> | null
  reconnectTimer: ReturnType<typeof setTimeout> | null
}

// One WS per userId
let _ws: WebSocket | null = null
let _wsUserId: number | null = null
let _wsHeartbeat: ReturnType<typeof setInterval> | null = null
let _pendingLocation: GeolocationPosition | null = null

// Per-order session registry
const _sessions: Map<number, TrackingSession> = new Map()

// Listener callbacks — components subscribe to state updates
const _listeners: Set<() => void> = new Set()

// Shared tracking state — per order_id
const _trackingState: Map<number, OrderTrackingStatus> = new Map()

function notifyListeners() {
  _listeners.forEach(fn => fn())
}

function setOrderState(orderId: number, patch: Partial<OrderTrackingStatus>) {
  const prev = _trackingState.get(orderId) ?? {
    state: 'idle', error: null, accuracy: null, sendCount: 0, lastSent: null
  }
  _trackingState.set(orderId, { ...prev, ...patch })
  notifyListeners()
}

function getOrderState(orderId: number): OrderTrackingStatus {
  return _trackingState.get(orderId) ?? {
    state: 'idle', error: null, accuracy: null, sendCount: 0, lastSent: null
  }
}

// ─── WebSocket management ─────────────────────────────────────────

function ensureWebSocket(userId: number, onReady?: () => void) {
  if (_ws && _wsUserId === userId && _ws.readyState === WebSocket.OPEN) {
    onReady?.()
    return
  }
  if (_ws && _ws.readyState === WebSocket.CONNECTING) {
    // Already connecting — onReady will fire in onopen
    return
  }

  // Close stale connection
  if (_ws) {
    _ws.onclose = null
    _ws.close()
    _ws = null
  }
  if (_wsHeartbeat) { clearInterval(_wsHeartbeat); _wsHeartbeat = null }

  const url = `${WS_BASE}/ws/staff/${userId}`
  console.log('[Tracking] Opening WS →', url)
  const ws = new WebSocket(url)
  _ws = ws
  _wsUserId = userId

  ws.onopen = () => {
    console.log('[Tracking] WS connected')
    if (_pendingLocation) {
      // Find which order is actively tracking to send pending location
      _sessions.forEach((session) => {
        if (session.watchId !== null && _ws?.readyState === WebSocket.OPEN) {
          sendLocationFromPos(_pendingLocation!, session.orderId)
        }
      })
      _pendingLocation = null
    }
    _wsHeartbeat = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.send('ping')
    }, 25000)
    onReady?.()
  }

  ws.onmessage = (event) => {
    if (event.data === 'pong') return
    try {
      const msg = JSON.parse(event.data)
      console.log('[Tracking] WS received:', msg)
      if (msg.type === 'ack' && msg.order_id) {
        setOrderState(msg.order_id, {
          lastSent: Date.now() / 1000,
          sendCount: (getOrderState(msg.order_id).sendCount ?? 0) + 1,
        })
      } else if (msg.type === 'error') {
        console.error('[Tracking] Server error:', msg.message)
        if (msg.message?.includes('Not authorised')) {
          // Find which session this belongs to
          _sessions.forEach((session) => {
            setOrderState(session.orderId, { state: 'error', error: 'not_assigned' })
            cleanupSession(session.orderId)
          })
        }
      }
    } catch {}
  }

  ws.onerror = (e) => { console.error('[Tracking] WS error', e) }

  ws.onclose = (e) => {
    console.log('[Tracking] WS closed', e.code)
    if (_wsHeartbeat) { clearInterval(_wsHeartbeat); _wsHeartbeat = null }
    _ws = null
    _wsUserId = null
    // Reconnect if any session is still actively tracking
    const hasActive = [..._sessions.values()].some(s => s.watchId !== null || s.simInterval !== null)
    if (hasActive && userId) {
      console.log('[Tracking] Reconnecting in 3s...')
      setTimeout(() => ensureWebSocket(userId), 3000)
    }
  }
}

function sendRawPayload(payload: object) {
  if (_ws?.readyState === WebSocket.OPEN) {
    _ws.send(JSON.stringify(payload))
    return true
  }
  return false
}

function sendLocationFromPos(pos: GeolocationPosition, orderId: number) {
  return sendRawPayload({
    type: 'location',
    order_id: orderId,
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
    accuracy: pos.coords.accuracy,
    timestamp: pos.timestamp / 1000,
  })
}

// ─── Session cleanup ──────────────────────────────────────────────

function cleanupSession(orderId: number) {
  const session = _sessions.get(orderId)
  if (!session) return

  if (session.watchId !== null) {
    navigator.geolocation.clearWatch(session.watchId)
    session.watchId = null
  }
  if (session.simInterval !== null) {
    clearInterval(session.simInterval)
    session.simInterval = null
  }
  if (session.reconnectTimer !== null) {
    clearTimeout(session.reconnectTimer)
    session.reconnectTimer = null
  }
  _sessions.delete(orderId)
}

// ─── Public API ───────────────────────────────────────────────────

export function startTracking(userId: number, orderId: number) {
  if (!navigator.geolocation) {
    setOrderState(orderId, { state: 'error', error: 'position_unavailable' })
    return
  }
  if (_sessions.has(orderId)) cleanupSession(orderId) // clean up any stale session

  const session: TrackingSession = { orderId, watchId: null, simInterval: null, reconnectTimer: null }
  _sessions.set(orderId, session)

  setOrderState(orderId, { state: 'requesting', error: null, accuracy: null, sendCount: 0 })
  console.log('[Tracking] Requesting GPS for order', orderId)

  ensureWebSocket(userId)

  const watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const { latitude, longitude, accuracy } = pos.coords
      console.log(`[Tracking] GPS #${orderId} → lat:${latitude.toFixed(5)} lng:${longitude.toFixed(5)} ±${Math.round(accuracy)}m`)
      setOrderState(orderId, { state: 'tracking', accuracy: Math.round(accuracy) })

      if (!sendLocationFromPos(pos, orderId)) {
        _pendingLocation = pos
      }
    },
    (err) => {
      console.error('[Tracking] GPS error', err.code, err.message)
      const map: Record<number, TrackingError> = { 1: 'permission_denied', 2: 'position_unavailable', 3: 'timeout' }
      setOrderState(orderId, { state: 'error', error: map[err.code] ?? 'position_unavailable' })
      cleanupSession(orderId)
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  )

  session.watchId = watchId
}

export function stopTracking(orderId: number) {
  cleanupSession(orderId)
  setOrderState(orderId, { state: 'stopped', error: null, accuracy: null })
  console.log('[Tracking] Stopped tracking for order', orderId)
}

export function startSimulation(userId: number, orderId: number, restaurantLat?: number, restaurantLng?: number) {
  if (_sessions.has(orderId)) cleanupSession(orderId)

  const session: TrackingSession = { orderId, watchId: null, simInterval: null, reconnectTimer: null }
  _sessions.set(orderId, session)

  setOrderState(orderId, { state: 'tracking', accuracy: 10, error: null, sendCount: 0 })
  console.log('[Tracking] Starting simulation for order', orderId)

  ensureWebSocket(userId, () => {
    runSimulation(orderId, session, restaurantLat, restaurantLng)
  })

  if (_ws?.readyState === WebSocket.OPEN) {
    runSimulation(orderId, session, restaurantLat, restaurantLng)
  }
}

function runSimulation(orderId: number, session: TrackingSession, startLat?: number, startLng?: number) {
  if (session.simInterval) return
  // Start from restaurant coords if provided, otherwise default to Sholinganallur
  const lat0 = startLat ?? 12.9010
  const lng0 = startLng ?? 80.2279
  let step = 0
  console.log(`[Simulation] Starting from lat:${lat0} lng:${lng0}`)

  session.simInterval = setInterval(() => {
    if (!_sessions.has(orderId)) return
    if (!_ws || _ws.readyState !== WebSocket.OPEN) return

    step++
    if (step >= 60) { stopTracking(orderId); return }

    // Move ~10m per step in a random direction (simulates real movement)
    const lat = lat0 + step * 0.00009
    const lng = lng0 + step * 0.00004
    const accuracy = 10 + Math.random() * 5

    console.log(`[Simulation] Order#${orderId} Step${step} → lat:${lat.toFixed(5)} lng:${lng.toFixed(5)}`)
    sendRawPayload({ type: 'location', order_id: orderId, lat, lng, accuracy, timestamp: Date.now() / 1000 })
    setOrderState(orderId, {
      accuracy: Math.round(accuracy),
      lastSent: Date.now() / 1000,
      sendCount: (getOrderState(orderId).sendCount ?? 0) + 1,
    })
  }, 3000)
}

export function stopSimulation(orderId: number) {
  stopTracking(orderId)
}

// ─── React hook — subscribes to state updates ─────────────────────

export function useDeliveryTracking(userId: number | null) {
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    const listener = () => forceUpdate(n => n + 1)
    _listeners.add(listener)
    return () => { _listeners.delete(listener) }
  }, [])

  const getStatus = useCallback((orderId: number): OrderTrackingStatus => {
    return getOrderState(orderId)
  }, [])

  const isTracking = useCallback((orderId: number): boolean => {
    const s = getOrderState(orderId)
    return s.state === 'tracking' || s.state === 'requesting'
  }, [])

  return {
    getStatus,
    isTracking,
    startTracking: useCallback((orderId: number) => {
      if (userId) startTracking(userId, orderId)
    }, [userId]),
    stopTracking: useCallback((orderId: number) => stopTracking(orderId), []),
    startSimulation: useCallback((orderId: number, restaurantLat?: number, restaurantLng?: number) => {
      if (userId) startSimulation(userId, orderId, restaurantLat, restaurantLng)
    }, [userId]),
    stopSimulation: useCallback((orderId: number) => stopSimulation(orderId), []),
  }
}
