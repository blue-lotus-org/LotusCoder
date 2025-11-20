import React, { useState } from 'react'
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus } from 'lucide-react'
import { useProjectStore } from '../../stores/projects'

interface FileNode {
  id: string
  name: string
  path: string
  type: 'file' | 'folder'
  children?: FileNode[]
  isExpanded?: boolean
}

export const FileTree: React.FC = () => {
  const { files, activeFile, setActiveFile, addFile } = useProjectStore()
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  const buildFileTree = (): FileNode[] => {
    const tree: FileNode[] = []
    const folderMap = new Map<string, FileNode>()

    // Create root folders
    const rootFolders = [
      { name: 'src', path: 'src', type: 'folder' as const },
      { name: 'public', path: 'public', type: 'folder' as const },
      { name: 'components', path: 'src/components', type: 'folder' as const },
      { name: 'utils', path: 'src/utils', type: 'folder' as const },
    ]

    rootFolders.forEach(folder => {
      folderMap.set(folder.path, {
        ...folder,
        id: folder.path,
        children: [],
        isExpanded: expandedFolders.has(folder.path),
      })
    })

    // Add files to their respective folders
    files.forEach(file => {
      const parts = file.path.split('/')
      const fileName = parts[parts.length - 1]
      const folderPath = parts.slice(0, -1).join('/') || 'src'
      
      const folder = folderMap.get(folderPath)
      if (folder) {
        folder.children!.push({
          id: file.id,
          name: fileName,
          path: file.path,
          type: 'file',
        })
      }
    })

    // Convert map to array, keeping only folders that have children
    folderMap.forEach(folder => {
      if (folder.children!.length > 0) {
        tree.push(folder)
      }
    })

    return tree
  }

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev)
      if (next.has(folderPath)) {
        next.delete(folderPath)
      } else {
        next.add(folderPath)
      }
      return next
    })
  }

  const handleAddFile = () => {
    const fileName = prompt('Enter file name:')
    if (fileName) {
      addFile({
        name: fileName,
        path: `src/${fileName}`,
        language: 'typescript',
        content: '// New file\n',
      })
    }
  }

  const renderFileNode = (node: FileNode, level: number = 0) => {
    const isActive = activeFile?.id === node.id
    const hasChildren = node.children && node.children.length > 0

    return (
      <div key={node.id}>
        <div
          className={`flex items-center px-2 py-1 hover:bg-dark-700 cursor-pointer transition-colors ${
            isActive ? 'bg-primary-900 text-primary-100' : 'text-dark-300'
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            if (node.type === 'folder') {
              toggleFolder(node.path)
            } else {
              const file = files.find(f => f.id === node.id)
              if (file) {
                setActiveFile(file)
              }
            }
          }}
        >
          {node.type === 'folder' ? (
            <>
              {node.isExpanded ? (
                <ChevronDown size={14} className="mr-1" />
              ) : (
                <ChevronRight size={14} className="mr-1" />
              )}
              {node.isExpanded ? (
                <FolderOpen size={16} className="mr-2 text-blue-400" />
              ) : (
                <Folder size={16} className="mr-2 text-blue-400" />
              )}
              <span className="font-medium">{node.name}</span>
            </>
          ) : (
            <>
              <File size={16} className="mr-2 text-dark-400" />
              <span>{node.name}</span>
            </>
          )}
        </div>

        {node.type === 'folder' && node.isExpanded && node.children && (
          <div>
            {node.children.map(child => renderFileNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const fileTree = buildFileTree()

  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-dark-400">Project Files</h4>
        <button
          onClick={handleAddFile}
          className="p-1 hover:bg-dark-700 rounded text-dark-400 hover:text-primary-400 transition-colors"
          title="Add file"
        >
          <Plus size={14} />
        </button>
      </div>
      
      <div className="space-y-1">
        {fileTree.length > 0 ? (
          fileTree.map(node => renderFileNode(node))
        ) : (
          <div className="text-center py-8 text-dark-500">
            <Folder size={48} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No files yet</p>
            <button
              onClick={handleAddFile}
              className="mt-2 px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded transition-colors"
            >
              Add First File
            </button>
          </div>
        )}
      </div>
    </div>
  )
}