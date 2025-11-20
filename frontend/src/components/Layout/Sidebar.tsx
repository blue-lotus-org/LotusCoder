import React from 'react'
import { FileTree } from '../FileTree/FileTree'
import { AgentPanel } from '../Agents/AgentPanel'
import { useProjectStore } from '../../stores/projects'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const currentProject = useProjectStore(state => state.currentProject)

  if (collapsed) {
    return (
      <aside className="w-16 bg-dark-800 border-r border-dark-700 flex flex-col">
        <div className="p-4 border-b border-dark-700">
          <button
            onClick={onToggle}
            className="w-full p-2 text-dark-400 hover:text-primary-400 transition-colors"
          >
            📁
          </button>
        </div>
        
        <div className="flex-1 flex flex-col space-y-2 p-2">
          <button className="p-2 text-dark-400 hover:text-primary-400 transition-colors" title="Files">
            📁
          </button>
          <button className="p-2 text-dark-400 hover:text-primary-400 transition-colors" title="Agents">
            🤖
          </button>
        </div>
      </aside>
    )
  }

  return (
    <aside className="w-80 bg-dark-800 border-r border-dark-700 flex flex-col">
      <div className="p-4 border-b border-dark-700">
        <h2 className="font-semibold text-lg">
          {currentProject ? currentProject.name : 'Projects'}
        </h2>
        {currentProject && (
          <p className="text-sm text-dark-400 mt-1">{currentProject.description}</p>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-1/2 border-b border-dark-700">
          <div className="p-4 border-b border-dark-700">
            <h3 className="font-medium text-sm text-dark-300 uppercase tracking-wide">
              Files
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            <FileTree />
          </div>
        </div>

        <div className="h-1/2">
          <div className="p-4 border-b border-dark-700">
            <h3 className="font-medium text-sm text-dark-300 uppercase tracking-wide">
              AI Agents
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            <AgentPanel />
          </div>
        </div>
      </div>
    </aside>
  )
}