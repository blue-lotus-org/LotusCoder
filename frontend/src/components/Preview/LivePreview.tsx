import React, { useEffect, useRef, useState } from 'react'
import { useProjectStore } from '../../stores/projects'
import { Play, RefreshCw, ExternalLink } from 'lucide-react'

export const LivePreview: React.FC = () => {
  const { activeFile, livePreview, updateLivePreview } = useProjectStore()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isCompiling, setIsCompiling] = useState(false)

  const updatePreview = () => {
    if (!activeFile || !iframeRef.current) return

    const content = activeFile.content
    const language = activeFile.language.toLowerCase()

    let previewContent = ''

    if (language === 'html') {
      previewContent = content
    } else if (language === 'css') {
      previewContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>CSS Preview</title>
  <style>${content}</style>
</head>
<body>
  <div style="padding: 20px;">
    <h1>CSS Preview</h1>
    <p>This is a preview of your CSS styles.</p>
    <div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0;">
      Sample content with border
    </div>
    <button style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px;">
      Sample Button
    </button>
  </div>
</body>
</html>`
    } else if (language === 'javascript' || language === 'typescript') {
      previewContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>JavaScript Preview</title>
  <style>
    body { font-family: 'Courier New', monospace; padding: 20px; }
    #output { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 4px; }
    .error { color: red; }
  </style>
</head>
<body>
  <h1>JavaScript Execution</h1>
  <div id="output"></div>
  <script>
    console.log = function(...args) {
      const output = document.getElementById('output');
      output.innerHTML += '<div>' + args.join(' ') + '</div>';
      console.log.__proto__ = originalLog;
    };
    
    console.error = function(...args) {
      const output = document.getElementById('output');
      output.innerHTML += '<div class="error">' + args.join(' ') + '</div>';
    };
    
    try {
      ${content}
    } catch (error) {
      console.error('Error:', error.message);
    }
  </script>
</body>
</html>`
    } else {
      previewContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Preview</title>
  <style>
    body { 
      font-family: 'Courier New', monospace; 
      padding: 20px; 
      background: #f5f5f5;
    }
    pre { 
      background: #fff; 
      padding: 15px; 
      border-radius: 8px; 
      border: 1px solid #ddd;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <h1>File Preview</h1>
  <p><strong>File:</strong> ${activeFile.name}</p>
  <p><strong>Language:</strong> ${activeFile.language}</p>
  <h2>Content:</h2>
  <pre>${content.replace(/[<>&]/g, (match) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;'
  }[match]))}</pre>
</body>
</html>`
    }

    // Update the iframe content
    if (iframeRef.current) {
      iframeRef.current.srcdoc = previewContent
    }

    // Update live preview state
    updateLivePreview({ html: previewContent })
  }

  const handleCompile = async () => {
    setIsCompiling(true)
    
    // Simulate compilation process
    setTimeout(() => {
      updatePreview()
      setIsCompiling(false)
    }, 500)
  }

  const openInNewTab = () => {
    if (livePreview?.html) {
      const newWindow = window.open()
      if (newWindow) {
        newWindow.document.write(livePreview.html)
        newWindow.document.close()
      }
    }
  }

  useEffect(() => {
    if (activeFile && livePreview?.html) {
      // Auto-update if auto-refresh is enabled
      const autoRefresh = JSON.parse(localStorage.getItem('app-settings') || '{}')?.preview?.autoRefresh || true
      if (autoRefresh) {
        handleCompile()
      }
    }
  }, [activeFile?.content])

  useEffect(() => {
    if (activeFile) {
      handleCompile()
    }
  }, [])

  if (!activeFile) {
    return (
      <div className="h-full flex items-center justify-center bg-dark-900">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-dark-100 mb-2">
            No preview available
          </h3>
          <p className="text-dark-400">
            Select a file to see live preview
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-dark-900">
      {/* Preview Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-dark-800 border-b border-dark-700">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-dark-100">Live Preview</h3>
          <span className="text-xs text-dark-400">
            {activeFile.language}
          </span>
          {livePreview?.error && (
            <span className="px-2 py-1 bg-red-900 text-red-100 text-xs rounded">
              Error
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCompile}
            disabled={isCompiling}
            className="flex items-center space-x-2 px-3 py-1 bg-primary-600 hover:bg-primary-700 disabled:bg-dark-600 text-white rounded text-sm transition-colors"
          >
            <RefreshCw size={14} className={isCompiling ? 'animate-spin' : ''} />
            <span>{isCompiling ? 'Compiling...' : 'Refresh'}</span>
          </button>
          
          {livePreview?.html && (
            <button
              onClick={openInNewTab}
              className="flex items-center space-x-2 px-3 py-1 bg-dark-700 hover:bg-dark-600 text-dark-300 rounded text-sm transition-colors"
            >
              <ExternalLink size={14} />
              <span>Open</span>
            </button>
          )}
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0 bg-white"
          title="Live Preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
        />
        
        {livePreview?.error && (
          <div className="absolute top-4 left-4 right-4 p-4 bg-red-900 border border-red-700 rounded-lg">
            <h4 className="font-medium text-red-100 mb-2">Preview Error</h4>
            <p className="text-red-200 text-sm">{livePreview.error}</p>
          </div>
        )}
        
        {isCompiling && (
          <div className="absolute inset-0 bg-dark-900 bg-opacity-75 flex items-center justify-center">
            <div className="text-center">
              <RefreshCw size={24} className="animate-spin text-primary-400 mx-auto mb-2" />
              <p className="text-dark-300">Compiling...</p>
            </div>
          </div>
        )}
      </div>

      {/* Preview Footer */}
      <div className="px-4 py-2 bg-dark-800 border-t border-dark-700 text-xs text-dark-400">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span>Viewport: Responsive</span>
            <span>Safe Mode</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {livePreview?.html && (
              <span>{livePreview.html.length} characters</span>
            )}
            <span>Auto-refresh: {JSON.parse(localStorage.getItem('app-settings') || '{}')?.preview?.autoRefresh ? 'On' : 'Off'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}