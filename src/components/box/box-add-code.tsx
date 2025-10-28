import React, { useState } from 'react'
import { Box } from './box'
import { CodeEditor } from '../code-editor/code-editor'
import { FileTree } from '../file-tree/file-tree'
import { Info } from '../info/info'
import { ShareAllFiles } from '../share-all-files/share-all-files'
import { useFilesDispatch } from '../../hooks/use-files'
import { useHelia } from '../../hooks/use-helia'
import { useAddSnippet } from '../../hooks/use-add-snippet'
import { type SupportedLanguage, detectLanguageFromFilename, getDefaultExtension } from '../../types/snippet'
import { useHashLocation } from 'wouter/use-hash-location'
import './box-add-code.css'

export const BoxAddCode = (): React.JSX.Element => {
  const dispatch = useFilesDispatch()
  const heliaState = useHelia()
  const addSnippet = useAddSnippet(dispatch, heliaState)
  const [location] = useHashLocation()

  // Parse URL parameters for edit mode
  const getUrlParams = (): { code?: string, filename?: string } => {
    const params = new URLSearchParams(location.split('?')[1])
    return {
      code: params.get('code') != null ? decodeURIComponent(params.get('code')!) : undefined,
      filename: params.get('filename') != null ? decodeURIComponent(params.get('filename')!) : undefined
    }
  }

  const urlParams = getUrlParams()
  const initialFilename = urlParams.filename ?? 'snippet.sol'
  const initialLanguage = detectLanguageFromFilename(initialFilename)

  const [code, setCode] = useState(urlParams.code ?? '')
  const [filename, setFilename] = useState(initialFilename)
  const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage)
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLanguageChange = (newLanguage: SupportedLanguage): void => {
    setLanguage(newLanguage)
    // Update filename extension if it hasn't been customized
    const currentExt = filename.substring(filename.lastIndexOf('.'))
    const defaultExt = getDefaultExtension(language)
    if (currentExt === defaultExt) {
      const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'))
      setFilename(nameWithoutExt + getDefaultExtension(newLanguage))
    }
  }

  const handleFilenameChange = (newFilename: string): void => {
    setFilename(newFilename)
    // Auto-detect language from filename
    const detectedLang = detectLanguageFromFilename(newFilename)
    if (detectedLang !== language) {
      setLanguage(detectedLang)
    }
  }

  const handleAddSnippet = async (): Promise<void> => {
    if (code.trim() === '') {
      setError('Code cannot be empty')
      return
    }

    if (filename.trim() === '') {
      setError('Filename cannot be empty')
      return
    }

    setIsAdding(true)
    setError(null)

    try {
      await addSnippet(code, filename)
      // Clear the editor after successful add
      setCode('')
      setFilename('snippet.sol')
      setLanguage('solidity')
    } catch (err: any) {
      setError(err.message ?? 'Failed to add snippet')
    } finally {
      setIsAdding(false)
    }
  }

  const handleAddAnother = (): void => {
    // Just clear the form - don't reset the file tree
    setCode('')
  }

  return (
    <>
      <Box>
        <div className="box-add-code-container">
          <CodeEditor
            value={code}
            onChange={setCode}
            language={language}
            onLanguageChange={handleLanguageChange}
            filename={filename}
            onFilenameChange={handleFilenameChange}
            height="calc(100vh - 500px)"
          />

          {error != null && (
            <div className="box-add-code-error">
              {error}
            </div>
          )}

          <div className="box-add-code-actions">
            <button
              onClick={handleAddSnippet}
              disabled={isAdding || heliaState.starting}
              className="box-add-code-button box-add-code-button-primary"
            >
              {isAdding ? 'Adding...' : heliaState.starting ? 'Connecting to peers...' : 'Add File'}
            </button>
            {code.trim() !== '' && (
              <button
                onClick={handleAddAnother}
                className="box-add-code-button box-add-code-button-secondary"
              >
                Clear
              </button>
            )}
          </div>

          <FileTree />
        </div>
      </Box>

      <div className="box-add-code-info-section">
        <Info isDownload={false} />
      </div>
    </>
  )
}
