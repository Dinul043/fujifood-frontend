/**
 * useWebSocket — Real-time connection hook for FujiFood.
 *
 * Features:
 *   - Auto-connect with URL
 *   - Auto-reconnect on disconnect (3s delay)
 *   - Heartbeat ping every 25s to keep connection alive
 *   - JSON message parsing
 *   - Connection status tracking
 *
 * Usage:
 *   const { isConnected } = useWebSocket('ws://localhost:8000/ws/customer/123', (msg) => {
 *     if (msg.event === 'order_status_updated') { ... }
 *   })
 */
import { useEffect, useRef, useState, useCallback } from 'react'

interface WsMessage {
  event: string
  data: any
}

export function useWebSocket(
  url: string | null,
  onMessage?: (msg: WsMessage) => void
) {
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onMessageRef = useRef(onMessage)

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    if (!url) return

    let mounted = true

    const connect = () => {
      try {
        const ws = new WebSocket(url)
        wsRef.current = ws

        ws.onopen = () => {
          if (mounted) setIsConnected(true)
          // Start heartbeat
          heartbeatRef.current = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send('ping')
            }
          }, 25000)
        }

        ws.onmessage = (event) => {
          // Ignore pong responses
          if (event.data === 'pong') return
          try {
            const parsed = JSON.parse(event.data)
            if (onMessageRef.current && mounted) {
              onMessageRef.current(parsed)
            }
          } catch {
            // non-JSON message, ignore
          }
        }

        ws.onerror = () => {}

        ws.onclose = () => {
          if (mounted) {
            setIsConnected(false)
            if (heartbeatRef.current) clearInterval(heartbeatRef.current)
            // Auto-reconnect after 3s
            reconnectRef.current = setTimeout(() => {
              if (mounted) connect()
            }, 3000)
          }
        }
      } catch {
        // Retry after 3s
        reconnectRef.current = setTimeout(() => {
          if (mounted) connect()
        }, 3000)
      }
    }

    connect()

    return () => {
      mounted = false
      if (reconnectRef.current) clearTimeout(reconnectRef.current)
      if (heartbeatRef.current) clearInterval(heartbeatRef.current)
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [url])

  return { isConnected }
}
