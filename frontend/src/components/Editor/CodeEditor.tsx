import React, { useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { useProjectStore } from '../../stores/projects'

export const CodeEditor: React.FC = () => {
  const { activeFile, updateCode } = useProjectStore()
  const editorRef = useRef<any>(null)

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    
    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
      minimap: { enabled: true },
      wordWrap: 'on',
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      detectIndentation: true,
      formatOnPaste: true,
      formatOnType: true,
    })
  }

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && activeFile) {
      updateCode(value)
    }
  }

  const getLanguage = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    const languageMap: { [key: string]: string } = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'py': 'python',
      'java': 'java',
      'css': 'css',
      'scss': 'scss',
      'html': 'html',
      'json': 'json',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'sql': 'sql',
      'sh': 'shell',
      'bash': 'shell',
    }
    
    return languageMap[extension || ''] || 'plaintext'
  }

  if (!activeFile) {
    return (
      <div className="h-full flex items-center justify-center bg-dark-900">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-dark-100 mb-2">
            No file selected
          </h3>
          <p className="text-dark-400">
            Select a file from the sidebar to start editing
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-dark-800 border-b border-dark-700">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span className="text-sm font-medium text-dark-100">{activeFile.name}</span>
          <span className="text-xs text-dark-400">
            {activeFile.language}
          </span>
          {activeFile.isModified && (
            <span className="text-xs text-yellow-400">• modified</span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              if (editorRef.current) {
                editorRef.current.getAction('editor.action.formatDocument').run()
              }
            }}
            className="px-2 py-1 text-xs bg-dark-700 hover:bg-dark-600 text-dark-300 rounded transition-colors"
          >
            Format
          </button>
          
          <button
            onClick={() => {
              if (editorRef.current) {
                editorRef.current.trigger('keyboard', 'editor.action.quickCommand', {})
              }
            }}
            className="px-2 py-1 text-xs bg-dark-700 hover:bg-dark-600 text-dark-300 rounded transition-colors"
          >
            Command Palette
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={getLanguage(activeFile.name)}
          value={activeFile.content}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            automaticLayout: true,
            scrollBeyondLastLine: false,
            minimap: { enabled: true },
            wordWrap: 'on',
            fontSize: 14,
            fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
            tabSize: 2,
            insertSpaces: true,
            detectIndentation: true,
            formatOnPaste: true,
            formatOnType: true,
            renderLineHighlight: 'all',
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: false,
            cursorStyle: 'line',
            contextmenu: true,
            mouseWheelZoom: true,
            smoothScrolling: true,
            padding: { top: 16, bottom: 16 },
          }}
        />
      </div>

      {/* Editor Footer */}
      <div className="flex items-center justify-between px-4 py-2 bg-dark-800 border-t border-dark-700 text-xs text-dark-400">
        <div className="flex items-center space-x-4">
          <span>UTF-8</span>
          <span>LF</span>
          <span>{getLanguage(activeFile.name)}</span>
        </div>
        
        <div className="flex items-center space-x-4">
          {editorRef.current && (
            <>
              <span>
                Line {editorRef.current.getPosition()?.lineNumber || 1}, 
                Column {editorRef.current.getPosition()?.column || 1}
              </span>
              
              <span>
                {activeFile.content.split('\n').length} lines, 
                {activeFile.content.length} characters
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}