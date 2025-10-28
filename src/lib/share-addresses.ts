import {
  Circuit,
  WebRTC,
  WebRTCDirect,
  WebSocketsSecure,
  WebTransport
} from '@multiformats/multiaddr-matcher'
import type { Multiaddr } from '@multiformats/multiaddr'

/**
 * Get multiaddrs that are useful for peer-to-peer connections from browsers.
 * This includes:
 * - Direct WebRTC addresses
 * - Circuit relay addresses with WebRTC Direct (for browser-to-browser signaling)
 * - Circuit relay addresses with secure transports (WSS, WebTransport)
 *
 * To keep share URLs shorter, we prioritize and limit the addresses returned:
 * 1. Prefer WebRTC Direct addresses (best for browser-to-browser)
 * 2. Fall back to secure transports (WSS, WebTransport)
 * 3. Limit to 2 addresses max to keep URLs manageable
 */
export const getWebRTCAddrs = (addrs?: Multiaddr[]): Multiaddr[] => {
  if (addrs == null) return []

  // Categorize addresses by priority
  const webrtcDirect: Multiaddr[] = []
  const circuitWebRTC: Multiaddr[] = []
  const circuitSecure: Multiaddr[] = []

  for (const addr of addrs) {
    // Direct WebRTC addresses (highest priority)
    if (WebRTC.matches(addr) && !Circuit.matches(addr)) {
      webrtcDirect.push(addr)
    }
    // Circuit relay with WebRTC Direct (high priority)
    else if (Circuit.matches(addr) && WebRTCDirect.matches(addr)) {
      circuitWebRTC.push(addr)
    }
    // Circuit relay with secure transports (medium priority)
    else if (Circuit.matches(addr) && (WebSocketsSecure.matches(addr) || WebTransport.matches(addr))) {
      circuitSecure.push(addr)
    }
  }

  // Return up to 2 addresses, preferring higher priority ones
  const result: Multiaddr[] = []

  // Take best WebRTC Direct addresses first
  result.push(...webrtcDirect.slice(0, 2))
  if (result.length >= 2) return result

  // Fill with circuit WebRTC addresses
  result.push(...circuitWebRTC.slice(0, 2 - result.length))
  if (result.length >= 2) return result

  // Fill with circuit secure addresses
  result.push(...circuitSecure.slice(0, 2 - result.length))

  return result
}
