import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Bot, Settings, Play, Save } from 'lucide-react'
import { useWebSocketStore } from '../../stores/websocket'
import { useProjectStore } from '../../stores/projects'
import { Project } from '../../stores/projects'

interface HeaderProps {
  onToggleSidebar: () => void
  sidebarCollapsed: boolean
  project: Project | null
}

export const Header: React.FC<HeaderProps> = ({ 
  onToggleSidebar, 
  sidebarCollapsed, 
  project 
}) => {
  const location = useLocation()
  const { isConnected, connectionStatus } = useWebSocketStore()
  const { compileCode, currentProject } = useProjectStore()

  const handleCompile = () => {
    if (currentProject) {
      compileCode()
    }
  }

  return (
    <header className="h-16 bg-dark-800 border-b border-dark-700 flex items-center justify-between px-4">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-dark-700 transition-colors"
        >
          {sidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>

        <Link to="/" className="flex items-center space-x-2">
          <Bot className="text-primary-500" size={24} />
          <span className="font-bold text-lg">AI Coding App</span>
        </Link>

        {project && (
          <>
            <div className="text-dark-400">•</div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">{project.name}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                project.status === 'completed' ? 'bg-green-900 text-green-100' :
                project.status === 'coding' ? 'bg-blue-900 text-blue-100' :
                project.status === 'reviewing' ? 'bg-yellow-900 text-yellow-100' :
                'bg-gray-900 text-gray-100'
              }`}>
                {project.status}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Center Section */}
      <div className="flex items-center space-x-2">
        {project && (
          <>
            <button
              onClick={handleCompile}
              className="flex items-center space-x-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <Play size={16} />
              <span>Compile</span>
            </button>
            
            <button className="flex items-center space-x-2 px-3 py-2 bg-dark-700 hover:bg-dark-600 text-dark-100 rounded-lg transition-colors">
              <Save size={16} />
              <span>Save</span>
            </button>
          </>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 
            connectionStatus === 'connecting' ? 'bg-yellow-500' : 
            'bg-red-500'
          }`} />
          <span className="text-sm text-dark-300">
            {isConnected ? 'Connected' : 
             connectionStatus === 'connecting' ? 'Connecting...' : 
             'Disconnected'}
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-1">
          <Link
            to="/"
            className={`px-3 py-2 rounded-lg transition-colors ${
              location.pathname === '/' ? 'bg-dark-700 text-primary-400' : 'hover:bg-dark-700'
            }`}
          >
            Dashboard
          </Link>
          
          {project && (
            <Link
              to={`/project/${project.id}`}
              className={`px-3 py-2 rounded-lg transition-colors ${
                location.pathname === `/project/${project.id}` ? 'bg-dark-700 text-primary-400' : 'hover:bg-dark-700'
              }`}
            >
              Editor
            </Link>
          )}
          
          <Link
            to="/settings"
            className={`px-3 py-2 rounded-lg transition-colors ${
              location.pathname === '/settings' ? 'bg-dark-700 text-primary-400' : 'hover:bg-dark-700'
            }`}
          >
            <Settings size={18} />
          </Link>
        </nav>
      </div>
    </header>
  )
}