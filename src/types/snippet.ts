import { CID } from 'multiformats/cid'

/**
 * Supported programming languages for syntax highlighting
 */
export type SupportedLanguage =
  | 'javascript'
  | 'typescript'
  | 'jsx'
  | 'tsx'
  | 'python'
  | 'java'
  | 'cpp'
  | 'c'
  | 'csharp'
  | 'go'
  | 'rust'
  | 'ruby'
  | 'php'
  | 'swift'
  | 'kotlin'
  | 'scala'
  | 'solidity'
  | 'html'
  | 'css'
  | 'scss'
  | 'json'
  | 'yaml'
  | 'markdown'
  | 'sql'
  | 'bash'
  | 'shell'
  | 'plaintext'

/**
 * Language display names and file extensions
 */
export const LANGUAGE_INFO: Record<SupportedLanguage, { name: string, extensions: string[] }> = {
  javascript: { name: 'JavaScript', extensions: ['.js', '.mjs'] },
  typescript: { name: 'TypeScript', extensions: ['.ts'] },
  jsx: { name: 'JSX', extensions: ['.jsx'] },
  tsx: { name: 'TSX', extensions: ['.tsx'] },
  python: { name: 'Python', extensions: ['.py'] },
  java: { name: 'Java', extensions: ['.java'] },
  cpp: { name: 'C++', extensions: ['.cpp', '.cc', '.cxx', '.hpp', '.h'] },
  c: { name: 'C', extensions: ['.c', '.h'] },
  csharp: { name: 'C#', extensions: ['.cs'] },
  go: { name: 'Go', extensions: ['.go'] },
  rust: { name: 'Rust', extensions: ['.rs'] },
  ruby: { name: 'Ruby', extensions: ['.rb'] },
  php: { name: 'PHP', extensions: ['.php'] },
  swift: { name: 'Swift', extensions: ['.swift'] },
  kotlin: { name: 'Kotlin', extensions: ['.kt', '.kts'] },
  scala: { name: 'Scala', extensions: ['.scala'] },
  solidity: { name: 'Solidity', extensions: ['.sol'] },
  html: { name: 'HTML', extensions: ['.html', '.htm'] },
  css: { name: 'CSS', extensions: ['.css'] },
  scss: { name: 'SCSS', extensions: ['.scss', '.sass'] },
  json: { name: 'JSON', extensions: ['.json'] },
  yaml: { name: 'YAML', extensions: ['.yaml', '.yml'] },
  markdown: { name: 'Markdown', extensions: ['.md', '.markdown'] },
  sql: { name: 'SQL', extensions: ['.sql'] },
  bash: { name: 'Bash', extensions: ['.sh', '.bash'] },
  shell: { name: 'Shell', extensions: ['.sh', '.zsh', '.fish'] },
  plaintext: { name: 'Plain Text', extensions: ['.txt'] }
}

/**
 * Metadata for a single code snippet file
 */
export interface SnippetMetadata {
  filename: string
  language: SupportedLanguage
  description?: string
}

/**
 * A code snippet file with content and metadata
 */
export interface CodeSnippet extends SnippetMetadata {
  id: string
  content: string
  size: number
  cid?: CID
}

/**
 * A gist containing one or more code snippets
 */
export interface Gist {
  id: string
  title?: string
  description?: string
  snippets: CodeSnippet[]
  createdAt: Date
  updatedAt: Date
  cid?: CID
}

/**
 * Detect language from file extension
 */
export function detectLanguageFromFilename(filename: string): SupportedLanguage {
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase()

  for (const [lang, info] of Object.entries(LANGUAGE_INFO)) {
    if (info.extensions.includes(ext)) {
      return lang as SupportedLanguage
    }
  }

  return 'plaintext'
}

/**
 * Get file extension for a language
 */
export function getDefaultExtension(language: SupportedLanguage): string {
  return LANGUAGE_INFO[language].extensions[0]
}
