import Editor from '@monaco-editor/react'
import React from 'react'
import { type SupportedLanguage, LANGUAGE_INFO } from '../../types/snippet'
import './code-editor.css'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: SupportedLanguage
  onLanguageChange: (language: SupportedLanguage) => void
  filename: string
  onFilenameChange: (filename: string) => void
  height?: string
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  onLanguageChange,
  filename,
  onFilenameChange,
  height = '400px'
}) => {
  const handleEditorChange = (value: string | undefined): void => {
    onChange(value ?? '')
  }

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    onLanguageChange(e.target.value as SupportedLanguage)
  }

  // Map our language types to Monaco editor language IDs
  const getMonacoLanguage = (lang: SupportedLanguage): string => {
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
      solidity: 'sol',
      html: 'html',
      css: 'css',
      scss: 'scss',
      json: 'json',
      yaml: 'yaml',
      markdown: 'markdown',
      sql: 'sql',
      bash: 'shell',
      shell: 'shell',
      plaintext: 'plaintext'
    }
    return mapping[lang] ?? 'plaintext'
  }

  return (
    <div className="code-editor-container">
      <div className="code-editor-toolbar">
        <div className="code-editor-controls">
          <input
            type="text"
            value={filename}
            onChange={(e) => { onFilenameChange(e.target.value) }}
            placeholder="filename.ext"
            className="code-editor-filename"
          />
          <select
            value={language}
            onChange={handleLanguageChange}
            className="code-editor-language-select"
          >
            {Object.entries(LANGUAGE_INFO).map(([key, info]) => (
              <option key={key} value={key}>
                {info.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="code-editor-wrapper">
        <Editor
          height={height}
          language={getMonacoLanguage(language)}
          value={value}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true
          }}
        />
      </div>
    </div>
  )
}
