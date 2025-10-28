import { type Dispatch } from 'react'
import { type FilesAction, type AddFileState } from '../providers/files-provider'
import { type HeliaContextType } from '../providers/helia-provider'
import { getUniqueFilename } from '../lib/get-unique-filename'

/**
 * Hook for adding code snippets to IPFS
 * Converts code string to blob and adds to MFS
 */
export function useAddSnippet (dispatch: Dispatch<FilesAction>, heliaState: HeliaContextType) {
  if (heliaState.starting || heliaState.mfs == null) {
    // Return a no-op function while Helia is starting
    return async (code: string, filename: string): Promise<void> => {
      throw new Error('Helia is still initializing. Please wait.')
    }
  }
  const { mfs } = heliaState

  return async (code: string, filename: string): Promise<void> => {
    try {
      // Get unique filename to avoid overwriting existing files
      const uniqueFilename = await getUniqueFilename(mfs, filename)

      // Convert code string to async iterable
      const encoder = new TextEncoder()
      const content = encoder.encode(code)

      async function* toAsyncIterable(data: Uint8Array) {
        yield data
      }

      // Create a directory wrapper to store the filename in UnixFS metadata
      // This allows the filename to be derived from the CID structure
      const dirName = `file-${Date.now()}`
      await mfs.mkdir(`/${dirName}`)

      // Write file inside the directory (must use absolute path)
      await mfs.writeByteStream(toAsyncIterable(content), `/${dirName}/${uniqueFilename}`)

      // Get the directory CID (this is what we'll share)
      const dirStat = await mfs.stat(`/${dirName}`)

      const file: AddFileState = {
        id: dirStat.cid.toString(),
        name: uniqueFilename,
        size: content.length,
        progress: 0,
        cid: dirStat.cid, // Use directory CID
        published: false
      }

      dispatch({ type: 'add_start', ...file })
      dispatch({ type: 'add_success', id: dirStat.cid.toString(), cid: dirStat.cid })
    } catch (err: any) {
      console.error('error adding snippet', err)
      throw err
    }
  }
}
