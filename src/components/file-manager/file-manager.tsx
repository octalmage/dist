import React, { useEffect, useState } from 'react'
import { useHelia } from '../../hooks/use-helia'
import { useFilesDispatch } from '../../hooks/use-files'
import { getShareLink } from '../file/utils/get-share-link'
import { getWebRTCAddrs } from '../../lib/share-addresses'
import { ShareAllFiles } from '../share-all-files/share-all-files.jsx'
import type { CID } from 'multiformats/cid'

interface MFSFile {
  name: string // The actual filename from inside the directory
  dirName: string // The directory name in MFS root
  cid: CID // The file's CID (not the directory CID)
  dirCid: CID // The directory CID (used for sharing)
  size: number | bigint
}

export const FileManager: React.FC = () => {
  const { mfs, nodeInfo, unixfs } = useHelia()
  const dispatch = useFilesDispatch()
  const [files, setFiles] = useState<MFSFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<Set<string>>(new Set())
  const [editLinks, setEditLinks] = useState<Record<string, string>>({})

  const loadFiles = async (): Promise<void> => {
    if (mfs == null) return

    try {
      setLoading(true)
      setError(null)
      const fileList: MFSFile[] = []

      // List directories in root
      for await (const dirEntry of mfs.ls('/')) {
        // Each entry is a directory wrapping a file
        // Look inside to get the actual file
        if (dirEntry.type === 'directory') {
          try {
            // List files inside the directory
            for await (const fileEntry of mfs.ls(`/${dirEntry.name}`)) {
              if (fileEntry.type !== 'directory') {
                fileList.push({
                  name: fileEntry.name, // Actual filename
                  dirName: dirEntry.name, // Directory name
                  cid: fileEntry.cid, // File CID
                  dirCid: dirEntry.cid, // Directory CID (for sharing)
                  size: fileEntry.size ?? 0
                })
              }
            }
          } catch (err) {
            console.error(`Error reading directory ${dirEntry.name}:`, err)
          }
        }
      }

      setFiles(fileList)
    } catch (err: any) {
      setError(err.message ?? 'Failed to load files')
      console.error('Error loading MFS files:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadFiles()
  }, [mfs])

  const handleDelete = async (dirName: string, filename: string): Promise<void> => {
    if (mfs == null) return

    try {
      setDeleting(prev => new Set(prev).add(filename))
      // Delete the directory (which contains the file)
      // First delete the file, then the directory
      await mfs.rm(`/${dirName}/${filename}`)
      await mfs.rm(`/${dirName}`)

      // Reload the file list
      await loadFiles()

      // Reset the share link since files changed
      dispatch({ type: 'publish_reset_dir' })
    } catch (err: any) {
      setError(err.message ?? `Failed to delete ${filename}`)
      console.error('Error deleting file:', err)
    } finally {
      setDeleting(prev => {
        const next = new Set(prev)
        next.delete(filename)
        return next
      })
    }
  }

  const handleClearAll = async (): Promise<void> => {
    if (mfs == null) return
    if (!confirm('Are you sure you want to clear all files? This cannot be undone.')) {
      return
    }

    try {
      setLoading(true)

      for (const file of files) {
        // Delete the file first, then the directory
        await mfs.rm(`/${file.dirName}/${file.name}`)
        await mfs.rm(`/${file.dirName}`)
      }

      setFiles([])
      dispatch({ type: 'reset_files' })
    } catch (err: any) {
      setError(err.message ?? 'Failed to clear all files')
      console.error('Error clearing files:', err)
    } finally {
      setLoading(false)
    }
  }

  const generateEditLink = async (file: MFSFile): Promise<void> => {
    if (unixfs == null) return

    // Check if we already have a link for this file
    if (editLinks[file.cid.toString()] != null) return

    try {
      // Fetch the file content from IPFS
      const chunks: Uint8Array[] = []
      for await (const chunk of unixfs.cat(file.cid)) {
        chunks.push(chunk)
      }

      // Combine chunks
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
      const combined = new Uint8Array(totalLength)
      let offset = 0
      for (const chunk of chunks) {
        combined.set(chunk, offset)
        offset += chunk.length
      }

      // Decode as text
      const decoder = new TextDecoder()
      const code = decoder.decode(combined)

      // Generate edit link
      const params = new URLSearchParams({
        code: encodeURIComponent(code),
        filename: encodeURIComponent(file.name)
      })
      const link = `#/add?${params.toString()}`

      setEditLinks(prev => ({ ...prev, [file.cid.toString()]: link }))
    } catch (err: any) {
      console.error('Error generating edit link:', err)
    }
  }

  // Generate edit links when files load
  useEffect(() => {
    for (const file of files) {
      void generateEditLink(file)
    }
  }, [files])

  if (loading && files.length === 0) {
    return (
      <div className="pa4 white tc">
        <div className="loading-spinner center mb3" style={{ width: '40px', height: '40px' }} />
        <p>Loading files...</p>
      </div>
    )
  }

  return (
    <div className="pa4">
      <div className="mb4 flex items-center justify-between">
        <h2 className="f3 fw4 white ma0">MFS File Manager</h2>
        {files.length > 0 && (
          <button
            onClick={handleClearAll}
            className="pa2 ph3 br-pill bg-red white bn pointer f6 fw4"
            disabled={loading}
          >
            Clear All Files
          </button>
        )}
      </div>

      {error != null && (
        <div className="pa3 mb3 br2 bg-red white-90 f6">
          {error}
        </div>
      )}

      {files.length === 0 ? (
        <div className="pa4 tc white-60">
          <p className="f5">No files in MFS storage</p>
        </div>
      ) : (
        <div className="overflow-auto">
          <table className="w-100 collapse ba b--white-20 br2">
            <thead>
              <tr className="bg-white-10">
                <th className="pa3 tl f6 fw6 white-80 bb b--white-20">Name</th>
                <th className="pa3 tr f6 fw6 white-80 bb b--white-20">Size</th>
                <th className="pa3 tl f6 fw6 white-80 bb b--white-20">Share Link</th>
                <th className="pa3 tc f6 fw6 white-80 bb b--white-20" style={{ width: '180px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => {
                const isDeleting = deleting.has(file.name)
                const shareLink = getShareLink({
                  cid: file.dirCid, // Use directory CID for sharing
                  name: file.name,
                  webrtcMaddrs: getWebRTCAddrs(nodeInfo?.multiaddrs)
                })
                return (
                  <tr key={file.cid.toString()} className="hover-bg-white-05">
                    <td className="pa3 f6 white bb b--white-20">{file.name}</td>
                    <td className="pa3 f6 white-60 tr bb b--white-20">
                      {formatBytes(file.size)}
                    </td>
                    <td className="pa3 f7 white-60 bb b--white-20 truncate" style={{ maxWidth: '300px' }}>
                      <a href={shareLink} className="aqua no-underline hover-underline" target="_blank" rel="noopener noreferrer">
                        {shareLink}
                      </a>
                    </td>
                    <td className="pa3 tc bb b--white-20">
                      {editLinks[file.cid.toString()] != null ? (
                        <a
                          href={editLinks[file.cid.toString()]}
                          className="pa2 ph3 br2 bg-blue white no-underline pointer f7 hover-bg-dark-blue mr2 dib"
                        >
                          Edit
                        </a>
                      ) : (
                        <span className="pa2 ph3 br2 bg-gray white f7 mr2 dib o-50">
                          Loading...
                        </span>
                      )}
                      <button
                        onClick={() => { void handleDelete(file.dirName, file.name) }}
                        disabled={isDeleting}
                        className="pa2 ph3 br2 bg-red white bn pointer f7 hover-bg-dark-red"
                        style={{ opacity: isDeleting ? 0.5 : 1 }}
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* files.length > 0 && (
        <div className="mt4">
          <div className="pa3 br2 bg-white-10 white-70 f6 lh-copy mb3">
            <p className="ma0 mb2"><strong>Share All Files</strong></p>
            <p className="ma0 f7">
              Create a share link that includes all files listed above. Recipients will be able to access all files through a single link.
            </p>
          </div>
          <ShareAllFiles withLabel={true} />
        </div>
      ) */}

      <div className="mt4 pa3 br2 bg-white-10 white-70 f7 lh-copy">
        <p className="ma0 mb2"><strong>About MFS Storage:</strong></p>
        <p className="ma0">
          Files are stored in the browser's IndexedDB using Helia's Mutable File System (MFS).
          They persist across page reloads and will be included in share links until explicitly removed.
        </p>
      </div>
    </div>
  )
}

function formatBytes(bytes: number | bigint): string {
  // Convert BigInt to number for calculation
  const numBytes = typeof bytes === 'bigint' ? Number(bytes) : bytes
  if (numBytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(numBytes) / Math.log(k))
  return `${parseFloat((numBytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
