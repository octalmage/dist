import { multiaddr } from '@multiformats/multiaddr'
import { cid } from 'is-ipfs'
import { useEffect } from 'react'
import { useHashLocation } from 'wouter/use-hash-location'
import { useFilesDispatch } from './use-files'
import LZString from 'lz-string'

/**
 * * `(?<=\/)` — Positive lookbehind to ensure that the match is preceded by / without including it in the result.
 * * `[^\/?]+` — Matches one or more characters that are not / or ?.
 * * `(?=\?|$)` — Positive lookahead to ensure that the match is followed by either a ? or the end of the string ($).
 */
const cidRegex = /(?<=\/)[^/?]+(?=\?|$)/

// Support both old format (maddrs=...) and new compressed format (m=...)
const maddrsRegex = /(?<=maddrs=)[^&]+/
const compressedMaddrsRegex = /(?<=m=)[^&]+/

export type CurrentPage = 'add' | 'download' | 'manage'
export const useCurrentPage = (): CurrentPage => {
  const [location] = useHashLocation()
  const dispatch = useFilesDispatch()
  const maybeCid = location.match(cidRegex)?.[0] ?? null
  const maddrsParam = location.match(maddrsRegex)?.[0] ?? null
  const compressedParam = location.match(compressedMaddrsRegex)?.[0] ?? null

  // Determine the page type first
  const isManagePage = location.startsWith('/manage')
  const isAddPage = location.startsWith('/add') || location === '/' || !cid(maybeCid ?? '')
  const isDownloadPage = !isManagePage && !isAddPage

  // Only dispatch fetch_start if we're on the download page with a valid CID
  useEffect(() => {
    // Only fetch if we're on the download page and have a valid CID
    if (!isDownloadPage) return
    if (maybeCid == null) return

    dispatch({ type: 'reset_files' })

    let maddrsString: string | null = null

    // Try compressed format first (new format with 'm' parameter)
    if (compressedParam != null) {
      try {
        maddrsString = LZString.decompressFromEncodedURIComponent(compressedParam)
      } catch (err) {
        console.error('Failed to decompress multiaddrs:', err)
      }
    }
    // Fall back to uncompressed format (old format with 'maddrs' parameter)
    else if (maddrsParam != null) {
      maddrsString = decodeURIComponent(maddrsParam)
    }

    // Parse multiaddrs from the string
    const decodedMaddrs = maddrsString != null ? maddrsString.split(',') : null
    const multiaddrs = decodedMaddrs != null ? decodedMaddrs.map(maddr => multiaddr(maddr)) : null

    dispatch({ type: 'fetch_start', cid: maybeCid, filename: '', providerMaddrs: multiaddrs })
  }, [maybeCid, maddrsParam, compressedParam, isDownloadPage])

  if (isManagePage) {
    return 'manage'
  }

  if (isAddPage) {
    return 'add'
  }

  return 'download'
}
