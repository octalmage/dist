import { type CID } from 'multiformats/cid'
import type { Multiaddr } from '@multiformats/multiaddr'
import LZString from 'lz-string'

/**
 * Generate a shareable link for a file/directory CID with peer multiaddrs.
 * Uses LZ-string compression to keep URLs shorter and more shareable.
 */
export function getShareLink ({ cid, name, webrtcMaddrs }: { cid: string | CID, name?: string, webrtcMaddrs?: Multiaddr[] }): string {
  const url = new URL(`/#/${cid}`, window.location.href)

  if (webrtcMaddrs !== undefined && webrtcMaddrs.length > 0) {
    // Join multiaddrs with comma separator
    const maddrsString = webrtcMaddrs.map(addr => addr.toString()).join(',')

    // Compress using LZ-string (Base64 URL-safe encoding)
    const compressed = LZString.compressToEncodedURIComponent(maddrsString)

    // Use 'm' instead of 'maddrs' for even shorter URLs
    url.hash += `?m=${compressed}`
  }

  return url.toString()
}
