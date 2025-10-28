import React, { useState, useEffect, useRef } from 'react'
import hljs from 'highlight.js'
import 'highlight.js/styles/vs2015.css' // Dark theme
import hljsDefineSolidity from 'highlightjs-solidity'
import { type SupportedLanguage, LANGUAGE_INFO } from '../../types/snippet'
import './code-viewer.css'
import { CopyToClipboard } from 'react-copy-to-clipboard'

// Register Solidity language with highlight.js
hljsDefineSolidity(hljs)

interface CodeViewerProps {
  code: string
  language: SupportedLanguage
  filename: string
  showLineNumbers?: boolean
  showEditButton?: boolean
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  language,
  filename,
  showLineNumbers = true,
  showEditButton = false
}) => {
  const [copied, setCopied] = useState(false)
  const codeRef = useRef<HTMLElement>(null)

  // Generate edit link
  const editLink = showEditButton
    ? `#/add?${new URLSearchParams({
        code: encodeURIComponent(code),
        filename: encodeURIComponent(filename)
      }).toString()}`
    : undefined

  useEffect(() => {
    if (codeRef.current != null) {
      hljs.highlightElement(codeRef.current)
    }
  }, [code, language])

  const handleCopy = (): void => {
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  // Map our language types to highlight.js language IDs
  const getHljsLanguage = (lang: SupportedLanguage): string => {
    const mapping: Record<string, string> = {
      javascript: 'javascript',
      typescript: 'typescript',
      jsx: 'javascript',
      tsx: 'typescript',
      python: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      csharp: 'csharp',
      go: 'go',
      rust: 'rust',
      ruby: 'ruby',
      php: 'php',
      swift: 'swift',
      kotlin: 'kotlin',
      scala: 'scala',
      solidity: 'solidity',
      html: 'xml',
      css: 'css',
      scss: 'scss',
      json: 'json',
      yaml: 'yaml',
      markdown: 'markdown',
      sql: 'sql',
      bash: 'bash',
      shell: 'bash',
      plaintext: 'plaintext'
    }
    return mapping[lang] ?? 'plaintext'
  }

  const languageName = LANGUAGE_INFO[language]?.name ?? 'Plain Text'

  return (
    <div className="code-viewer-container dark">
      <div className="code-viewer-header">
        <div className="code-viewer-info">
          <span className="code-viewer-filename">{filename}</span>
          <span className="code-viewer-language">{languageName}</span>
        </div>
        <div className="code-viewer-actions">
          {showEditButton && editLink != null && (
            <a href={editLink} className="code-viewer-button" title="Edit code">
              ✏️ Edit
            </a>
          )}
          <CopyToClipboard text={code} onCopy={handleCopy}>
            <button className="code-viewer-button" title="Copy code">
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </CopyToClipboard>
        </div>
      </div>
      <div className="code-viewer-content">
        <pre className="hljs">
          <code
            ref={codeRef}
            className={`language-${getHljsLanguage(language)}`}
          >
            {code}
          </code>
        </pre>
      </div>
    </div>
  )
}
