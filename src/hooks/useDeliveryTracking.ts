/**
 * useDeliveryTracking — Staff-side GPS → WebSocket hook.
 *
 * Manages the full lifecycle of a delivery staff sending their GPS location:
 *   1. Requests GPS permission
 *   2. Opens WebSocket to /ws/staff/{userId}
 *   3. Starts watchPosition — continuous GPS (not interval polling)
 *   4. Sends every GPS update over WebSocket with order context
 *   5. Handles all error states: permission denied, GPS unavailable, WS disconnect
 *   6. Cleans up everything on stop
 *
 * State machine:
 *   idle → requesting → tracking → stopped
 *                     ↘ error (permission_denied | unavailable | ws_error)
 */

import { useState, useRef, useCallback, useEffect } from 'react'

export type TrackingState =
  | 'idle'
  | 'requesting'      // Waiting for GPS permission
  | 'tracking'        // Actively sending location
  | 'stopped'         // Manually stopped or delivered
  | 'error'

export type TrackingError =
  | 'permission_denied'
  | 'position_unavailable'
  | 'timeout'
  | 'ws_disconnected'
  | 'not_assigned'
  | null

interface TrackingStatus {
  state: TrackingState
  error: TrackingError
  accuracy: number | null   // GPS accuracy in metres
  lastSent: number | null   // Unix timestamp of last successful send
  sendCount: number         // Total location updates sent this session
}

const WS_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1')
  .replace(/\/api\/v1$/, '')
  .replace(/^http/, 'ws')

export function useDeliveryTracking(userId: number | null) {
  const [status, setStatus] = useState<TrackingStatus>({
    state: 'idle',
    error: null,
    accuracy: null,
    lastSent: null,
    sendCount: 0,
  })

  const wsRef = useRef<WebSocket | null>(null)
  const watchIdRef = useRef<number | null>(null)
  const currentOrderIdRef = useRef<number | null>(null)
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)
  const pendingLocationRef = useRef<GeolocationPosition | null>(null)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      cleanup()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cleanup = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    if (reconnectRef.current) {
      clearTimeout(reconnectRef.current)
      reconnectRef.current = null
    }
    if (wsRef.current) {
      wsRef.current.onclose = null  // prevent auto-reconnect on intentional close
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  const sendLocation = useCallback((ws: WebSocket, orderId: number, pos: GeolocationPosition) => {
    if (ws.readyState !== WebSocket.OPEN) return false
    const payload = {
      type: 'location',
      order_id: orderId,
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      timestamp: pos.timestamp / 1000, // convert to unix seconds
    }
    ws.send(JSON.stringify(payload))
    return true
  }, [])

  const openWebSocket = useCallback((orderId: number) => {
    if (!userId) return

    const wsUrl = `${WS_BASE}/ws/staff/${userId}`
    console.log('[Tracking] Opening WS →', wsUrl)
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      if (!mountedRef.current) return
      console.log('[Tracking] WS connected')
      if (pendingLocationRef.current) {
        console.log('[Tracking] Sending buffered location')
        sendLocation(ws, orderId, pendingLocationRef.current)
        pendingLocationRef.current = null
      }
    }

    ws.onmessage = (event) => {
      if (!mountedRef.current) return
      if (event.data === 'pong') return
      try {
        const msg = JSON.parse(event.data)
        console.log('[Tracking] WS received:', msg)
        if (msg.type === 'ack') {
          setStatus(prev => ({
            ...prev,
            lastSent: Date.now() / 1000,
            sendCount: prev.sendCount + 1,
          }))
        } else if (msg.type === 'error') {
          console.error('[Tracking] Server error:', msg.message)
          if (msg.message === 'Not authorised for this order') {
            setStatus(prev => ({ ...prev, state: 'error', error: 'not_assigned' }))
            cleanup()
          }
        }
      } catch {}
    }

    ws.onerror = (e) => { console.error('[Tracking] WS error', e) }

    ws.onclose = (e) => {
      console.log('[Tracking] WS closed', e.code, e.reason)
      if (!mountedRef.current) return
      setStatus(prev => {
        if (prev.state === 'tracking') {
          console.log('[Tracking] WS closed during tracking — reconnecting in 3s')
          reconnectRef.current = setTimeout(() => {
            if (mountedRef.current && currentOrderIdRef.current) {
              openWebSocket(currentOrderIdRef.current)
            }
          }, 3000)
        }
        return prev
      })
    }

    const heartbeat = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.send('ping')
    }, 25000)
    ws.addEventListener('close', () => clearInterval(heartbeat))
  }, [userId, sendLocation, cleanup])

  const startTracking = useCallback((orderId: number) => {
    if (!userId) return
    if (!navigator.geolocation) {
      setStatus(prev => ({ ...prev, state: 'error', error: 'position_unavailable' }))
      return
    }

    currentOrderIdRef.current = orderId
    setStatus(prev => ({ ...prev, state: 'requesting', error: null }))
    console.log('[Tracking] Requesting GPS permission for order', orderId)

    // Open WS immediately — it'll be ready by the time GPS kicks in
    openWebSocket(orderId)

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        if (!mountedRef.current) return

        const { latitude, longitude, accuracy } = pos.coords
        console.log(`[Tracking] GPS update → lat:${latitude.toFixed(5)} lng:${longitude.toFixed(5)} acc:${Math.round(accuracy)}m`)

        setStatus(prev => ({
          ...prev,
          state: 'tracking',
          accuracy: Math.round(accuracy),
        }))

        const ws = wsRef.current
        if (ws && ws.readyState === WebSocket.OPEN) {
          console.log('[Tracking] Sending over WS →', { order_id: orderId, lat: latitude, lng: longitude })
          sendLocation(ws, orderId, pos)
        } else {
          console.log('[Tracking] WS not ready (state:', ws?.readyState, ') — buffering location')
          // Buffer latest position — send when WS reconnects
          pendingLocationRef.current = pos
        }
      },
      (err) => {
        if (!mountedRef.current) return
        console.error('[Tracking] GPS error:', err.code, err.message)
        const errorMap: Record<number, TrackingError> = {
          1: 'permission_denied',
          2: 'position_unavailable',
          3: 'timeout',
        }
        setStatus(prev => ({
          ...prev,
          state: 'error',
          error: errorMap[err.code] ?? 'position_unavailable',
        }))
        cleanup()
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    )
  }, [userId, openWebSocket, sendLocation, cleanup])

  const stopTracking = useCallback(() => {
    cleanup()
    currentOrderIdRef.current = null
    setStatus({
      state: 'stopped',
      error: null,
      accuracy: null,
      lastSent: null,
      sendCount: 0,
    })
  }, [cleanup])

  // ── Simulation mode: sends fake GPS coords that move slowly ──
  // Used for localhost testing — walks a short route near Chennai
  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startSimulation = useCallback((orderId: number) => {
    if (!userId) return
    currentOrderIdRef.current = orderId

    // Starting point: Sholinganallur, Chennai — moves toward OMR
    const startLat = 12.9010
    const startLng = 80.2279
    let step = 0
    const totalSteps = 60 // 60 updates × 3s = 3 minutes of fake journey

    console.log('[Tracking] Starting GPS simulation for order', orderId)
    openWebSocket(orderId)

    setStatus(prev => ({ ...prev, state: 'tracking', accuracy: 15, error: null }))

    simIntervalRef.current = setInterval(() => {
      if (!mountedRef.current) return
      const ws = wsRef.current
      if (!ws || ws.readyState !== WebSocket.OPEN) return

      step++
      if (step >= totalSteps) {
        if (simIntervalRef.current) clearInterval(simIntervalRef.current)
        return
      }

      // Move ~10 metres north + slight east each step
      const lat = startLat + (step * 0.00009)
      const lng = startLng + (step * 0.00004)
      const payload = {
        type: 'location',
        order_id: orderId,
        lat,
        lng,
        accuracy: 10 + Math.random() * 5,
        timestamp: Date.now() / 1000,
      }
      console.log(`[Simulation] Step ${step} → lat:${lat.toFixed(5)} lng:${lng.toFixed(5)}`)
      ws.send(JSON.stringify(payload))

      setStatus(prev => ({
        ...prev,
        lastSent: Date.now() / 1000,
        sendCount: prev.sendCount + 1,
        accuracy: Math.round(payload.accuracy),
      }))
    }, 3000)
  }, [userId, openWebSocket])

  const stopSimulation = useCallback(() => {
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current)
      simIntervalRef.current = null
    }
    cleanup()
    currentOrderIdRef.current = null
    setStatus({ state: 'stopped', error: null, accuracy: null, lastSent: null, sendCount: 0 })
  }, [cleanup])

  return { status, startTracking, stopTracking, startSimulation, stopSimulation }
}
