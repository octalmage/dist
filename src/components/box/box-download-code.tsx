import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Box } from './box'
import { CodeViewer } from '../code-viewer/code-viewer'
import { MarkdownViewer } from '../markdown-viewer/markdown-viewer'
import { useFiles } from '../../hooks/use-files'
import { detectLanguageFromFilename, type SupportedLanguage } from '../../types/snippet'
import { downloadAllFiles, downloadCidAsFile } from '../file/utils/download'
import { useHelia } from '../../hooks/use-helia'
import './box-download-code.css'

interface CodeFileDisplay {
  filename: string
  code: string
  language: SupportedLanguage
  cid: string
}

export const BoxDownloadCode = (): React.JSX.Element => {
  const { t } = useTranslation('translation')
  const { files, filesToFetch } = useFiles()
  const { unixfs } = useHelia()
  const isLoading = filesToFetch.length > 0 || Object.keys(files).length === 0

  const [codeFiles, setCodeFiles] = useState<CodeFileDisplay[]>([])
  const [loadingContent, setLoadingContent] = useState(true)

  useEffect(() => {
    const loadCodeContent = async (): Promise<void> => {
      const loadedFiles: CodeFileDisplay[] = []

      for (const [cidStr, fileState] of Object.entries(files)) {
        try {
          if (unixfs == null) continue

          // Fetch the file content from IPFS
          const chunks: Uint8Array[] = []
          for await (const chunk of unixfs.cat(fileState.cid)) {
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

          loadedFiles.push({
            filename: fileState.name,
            code,
            language: detectLanguageFromFilename(fileState.name),
            cid: cidStr
          })
        } catch (err) {
          console.error('Error loading code content:', err)
        }
      }

      setCodeFiles(loadedFiles)
      setLoadingContent(false)
    }

    if (!isLoading && Object.keys(files).length > 0) {
      loadCodeContent().catch(console.error)
    }
  }, [files, isLoading, unixfs])

  const handleDownloadAll = (): void => {
    if (unixfs == null) return
    downloadAllFiles({ files, unixfs })
      .catch((err) => {
        console.error('Error downloading files:', err)
      })
  }

  const handleDownloadSingle = (cidStr: string): void => {
    const fileState = files[cidStr]
    if (fileState != null && unixfs != null) {
      downloadCidAsFile({ unixfs, cid: fileState.cid, filename: fileState.name })
        .catch((err) => {
          console.error('Error downloading file:', err)
        })
    }
  }

  if (isLoading) {
    return (
      <Box>
        <div className="box-download-code-loading">
          <div className="spinner"></div>
          <p>{t('download.loading', { defaultValue: 'Loading code snippet...' })}</p>
        </div>
      </Box>
    )
  }

  if (loadingContent) {
    return (
      <Box>
        <div className="box-download-code-loading">
          <div className="spinner"></div>
          <p>{t('download.loading-content', { defaultValue: 'Decoding files...' })}</p>
        </div>
      </Box>
    )
  }

  return (
    <Box>
      <div className="box-download-code-container">
        {codeFiles.length > 1 && (
          <div className="box-download-code-header">
            <span className="box-download-code-file-count">
              {codeFiles.length} files
            </span>
            <button
              onClick={handleDownloadAll}
              className="box-download-code-button"
            >
              Download All
            </button>
          </div>
        )}

        {codeFiles.length === 0 && (
          <div className="box-download-code-empty">
            <p>No files to display</p>
          </div>
        )}

        {codeFiles.map((file) => {
          const isMarkdown = file.filename.toLowerCase().endsWith('.md') || file.filename.toLowerCase().endsWith('.markdown')

          return (
            <div key={file.cid} className="box-download-code-file">
              {codeFiles.length > 1 && (
                <div className="box-download-code-file-actions">
                  <button
                    onClick={() => { handleDownloadSingle(file.cid) }}
                    className="box-download-code-file-button"
                  >
                    Download
                  </button>
                </div>
              )}
              {isMarkdown
                ? (
                  <MarkdownViewer
                    content={file.code}
                    filename={file.filename}
                    showEditButton={true}
                  />
                  )
                : (
                  <CodeViewer
                    code={file.code}
                    language={file.language}
                    filename={file.filename}
                    showEditButton={true}
                  />
                  )}
            </div>
          )
        })}
      </div>
    </Box>
  )
}
