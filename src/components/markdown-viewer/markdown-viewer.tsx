import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import './markdown-viewer.css'

interface MarkdownViewerProps {
  content: string
  filename?: string
  showEditButton?: boolean
}

export function MarkdownViewer ({ content, filename, showEditButton = false }: MarkdownViewerProps): JSX.Element {
  const [copied, setCopied] = useState(false)

  // Generate edit link
  const editLink = showEditButton && filename != null
    ? `#/add?${new URLSearchParams({
        code: encodeURIComponent(content),
        filename: encodeURIComponent(filename)
      }).toString()}`
    : undefined

  const handleCopy = (): void => {
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <div className="markdown-viewer-container dark">
      <div className="markdown-viewer-header">
        <div className="markdown-viewer-info">
          {filename != null && (
            <span className="markdown-viewer-filename">{filename}</span>
          )}
          <span className="markdown-viewer-language">Markdown</span>
        </div>
        <div className="markdown-viewer-actions">
          {showEditButton && editLink != null && (
            <a href={editLink} className="markdown-viewer-button" title="Edit markdown">
              ✏️ Edit
            </a>
          )}
          <CopyToClipboard text={content} onCopy={handleCopy}>
            <button className="markdown-viewer-button" title="Copy markdown">
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </CopyToClipboard>
        </div>
      </div>
      <div className="markdown-viewer-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}
