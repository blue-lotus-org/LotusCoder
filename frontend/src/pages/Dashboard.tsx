import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Code, Bot, Activity, TrendingUp, Zap } from 'lucide-react'
import { useProjectStore } from '../stores/projects'
import { useAgentStore } from '../stores/agents'
import { useWebSocketStore } from '../stores/websocket'

export const Dashboard: React.FC = () => {
  const { projects, fetchProjects } = useProjectStore()
  const { agents, fetchAgents, activeTasks } = useAgentStore()
  const { isConnected } = useWebSocketStore()

  useEffect(() => {
    fetchProjects()
    fetchAgents()
  }, [])

  const recentProjects = projects.slice(0, 3)
  const busyAgents = agents.filter(agent => 
    activeTasks.some(task => task.agentType === agent.type && 
      (task.status === 'running' || task.status === 'queued'))
  )

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status !== 'completed').length,
    totalAgents: agents.length,
    busyAgents: busyAgents.length,
    connectedAgents: agents.filter(a => a.enabled).length,
    activeTasks: activeTasks.length,
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-100 mb-2">
          AI Coding App Dashboard
        </h1>
        <p className="text-dark-400">
          Manage your projects and interact with AI agents in real-time
        </p>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-400 rounded-full" />
            <span className="text-red-100">WebSocket disconnected - Real-time features unavailable</span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm">Total Projects</p>
              <p className="text-2xl font-bold text-dark-100">{stats.totalProjects}</p>
            </div>
            <Code className="text-primary-400" size={24} />
          </div>
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm">Active Projects</p>
              <p className="text-2xl font-bold text-dark-100">{stats.activeProjects}</p>
            </div>
            <Activity className="text-green-400" size={24} />
          </div>
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm">AI Agents</p>
              <p className="text-2xl font-bold text-dark-100">
                {stats.connectedAgents}/{stats.totalAgents}
              </p>
            </div>
            <Bot className="text-blue-400" size={24} />
          </div>
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm">Active Tasks</p>
              <p className="text-2xl font-bold text-dark-100">{stats.activeTasks}</p>
            </div>
            <Zap className="text-yellow-400" size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="bg-dark-800 border border-dark-700 rounded-lg">
          <div className="p-6 border-b border-dark-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-dark-100">Recent Projects</h2>
              <Link
                to="/projects/new"
                className="flex items-center space-x-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm"
              >
                <Plus size={16} />
                <span>New Project</span>
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            {recentProjects.length > 0 ? (
              <div className="space-y-4">
                {recentProjects.map(project => (
                  <Link
                    key={project.id}
                    to={`/project/${project.id}`}
                    className="block p-4 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-dark-100">{project.name}</h3>
                        <p className="text-sm text-dark-400 mt-1">{project.description}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          project.status === 'completed' ? 'bg-green-900 text-green-100' :
                          project.status === 'coding' ? 'bg-blue-900 text-blue-100' :
                          project.status === 'reviewing' ? 'bg-yellow-900 text-yellow-100' :
                          'bg-gray-900 text-gray-100'
                        }`}>
                          {project.status}
                        </span>
                        <p className="text-xs text-dark-500 mt-1">{project.type}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Code size={48} className="mx-auto text-dark-500 mb-4" />
                <p className="text-dark-400 mb-4">No projects yet</p>
                <Link
                  to="/projects/new"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  <Plus size={16} />
                  <span>Create Your First Project</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Agent Status */}
        <div className="bg-dark-800 border border-dark-700 rounded-lg">
          <div className="p-6 border-b border-dark-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-dark-100">Agent Status</h2>
              <TrendingUp className="text-green-400" size={20} />
            </div>
          </div>
          
          <div className="p-6">
            {agents.length > 0 ? (
              <div className="space-y-4">
                {agents.map(agent => {
                  const agentTasks = activeTasks.filter(task => task.agentType === agent.type)
                  const isBusy = agentTasks.some(task => 
                    task.status === 'running' || task.status === 'queued'
                  )
                  
                  return (
                    <div key={agent.type} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          isBusy ? 'bg-yellow-400' : 
                          agent.enabled ? 'bg-green-400' : 'bg-red-400'
                        }`} />
                        <div>
                          <p className="font-medium text-dark-100">{agent.name}</p>
                          <p className="text-sm text-dark-400">{agent.role}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-dark-300">
                          {agentTasks.length} tasks
                        </p>
                        <p className="text-xs text-dark-400">
                          {agent.enabled ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bot size={48} className="mx-auto text-dark-500 mb-4" />
                <p className="text-dark-400">Loading agents...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-dark-100 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/projects/new"
            className="p-4 bg-dark-800 border border-dark-700 hover:border-primary-500 rounded-lg transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <Plus className="text-primary-400 group-hover:text-primary-300" size={20} />
              <div>
                <h3 className="font-medium text-dark-100">New Project</h3>
                <p className="text-sm text-dark-400">Start a new coding project</p>
              </div>
            </div>
          </Link>

          <Link
            to="/agents"
            className="p-4 bg-dark-800 border border-dark-700 hover:border-primary-500 rounded-lg transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <Bot className="text-primary-400 group-hover:text-primary-300" size={20} />
              <div>
                <h3 className="font-medium text-dark-100">Manage Agents</h3>
                <p className="text-sm text-dark-400">Configure AI agents</p>
              </div>
            </div>
          </Link>

          <Link
            to="/settings"
            className="p-4 bg-dark-800 border border-dark-700 hover:border-primary-500 rounded-lg transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <Activity className="text-primary-400 group-hover:text-primary-300" size={20} />
              <div>
                <h3 className="font-medium text-dark-100">System Settings</h3>
                <p className="text-sm text-dark-400">Configure the application</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}