import blobToIt from 'blob-to-it'
import { type Dispatch, useContext } from 'react'
import { type AddFileState, type FilesAction, FilesContext, FilesDispatchContext, type FilesState } from '../providers/files-provider'
import { type HeliaContextType } from '../providers/helia-provider'
import { getUniqueFilename } from '../lib/get-unique-filename'

export function useFiles (): FilesState {
  return useContext(FilesContext)
}

export function useFilesDispatch (): Dispatch<FilesAction> {
  return useContext(FilesDispatchContext)
}

export function useAddFiles (dispatch: Dispatch<FilesAction>, heliaState: HeliaContextType) {
  if (heliaState.starting || heliaState.mfs == null) {
    // Return a no-op function while Helia is starting
    return (_files: File[]) => {
      console.warn('Helia is still initializing. Please wait.')
    }
  }
  const { mfs } = heliaState

  return (files: File[]) => {
    // If multiple files, keep them in a single directory
    // If single file, wrap it in its own directory for filename preservation
    const dirName = `files-${Date.now()}`

    Promise.resolve().then(async () => {
      // Create the directory first
      await mfs.mkdir(`/${dirName}`)

      // Add all files to the directory
      for (const _file of files) {
        // Get unique filename to avoid overwriting existing files
        const uniqueName = await getUniqueFilename(mfs, _file.name)

        const content = blobToIt(_file)
        // Must use absolute path
        await mfs.writeByteStream(content, `/${dirName}/${uniqueName}`)

        // For individual file tracking, we still dispatch per-file
        // But we'll update this to use the directory CID after all files are added
        const fileStat = await mfs.stat(`/${dirName}/${uniqueName}`)

        const file: AddFileState = {
          id: fileStat.cid.toString(),
          name: uniqueName,
          size: _file.size,
          progress: 0,
          cid: fileStat.cid,
          published: false
        }
        dispatch({ type: 'add_start', ...file })
      }

      // Get the directory CID and dispatch success with it
      const dirStat = await mfs.stat(`/${dirName}`)

      // Dispatch success for the directory
      dispatch({ type: 'add_success', id: dirStat.cid.toString(), cid: dirStat.cid })

      return dirStat.cid
    }).catch((err: Error) => {
      console.error('error adding files', err)
      // dispatch({ type: 'add_fail', id, error: err })
      throw err
    })
  }
}
