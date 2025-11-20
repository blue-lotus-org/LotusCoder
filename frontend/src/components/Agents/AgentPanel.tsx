import React, { useEffect } from 'react'
import { Bot, Clock, CheckCircle, XCircle, Play, Pause } from 'lucide-react'
import { useAgentStore } from '../../stores/agents'
import { useProjectStore } from '../../stores/projects'

export const AgentPanel: React.FC = () => {
  const { 
    agents, 
    activeTasks, 
    fetchAgents, 
    fetchAgentStatus,
    executeTask 
  } = useAgentStore()
  
  const { currentProject } = useProjectStore()

  useEffect(() => {
    fetchAgents()
    fetchAgentStatus()
    
    // Set up periodic status updates
    const interval = setInterval(fetchAgentStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleAgentAction = (agentType: string, action: 'start' | 'pause') => {
    if (!currentProject) return

    const taskTemplates = {
      manager: 'Analyze current project status and create a task plan',
      planning: 'Break down the current development tasks',
      code_generation: 'Generate code for the current project requirements',
      review: 'Review the generated code for quality and improvements',
      testing: 'Create and run tests for the current project',
    }

    const task = taskTemplates[agentType as keyof typeof taskTemplates]
    if (task) {
      executeTask(agentType, task, {}, currentProject.id)
    }
  }

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-400" />
      case 'failed':
        return <XCircle size={16} className="text-red-400" />
      case 'running':
        return <Clock size={16} className="text-yellow-400 animate-spin" />
      default:
        return <Clock size={16} className="text-dark-400" />
    }
  }

  const getAgentTasks = (agentType: string) => {
    return activeTasks.filter(task => task.agentType === agentType)
  }

  return (
    <div className="p-4">
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-dark-400 mb-3">AI Agents</h4>
          
          <div className="space-y-3">
            {agents.map(agent => {
              const agentTasks = getAgentTasks(agent.type)
              const isBusy = agentTasks.some(task => task.status === 'running' || task.status === 'queued')
              
              return (
                <div key={agent.type} className="bg-dark-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Bot size={16} className="text-primary-400" />
                      <div>
                        <h5 className="font-medium text-sm">{agent.name}</h5>
                        <p className="text-xs text-dark-400">{agent.role}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isBusy ? 'bg-yellow-900 text-yellow-100' : 'bg-green-900 text-green-100'
                      }`}>
                        {isBusy ? 'Busy' : 'Ready'}
                      </span>
                      
                      {currentProject && (
                        <button
                          onClick={() => handleAgentAction(agent.type, isBusy ? 'pause' : 'start')}
                          className={`p-1 rounded transition-colors ${
                            isBusy 
                              ? 'hover:bg-red-700 text-red-400' 
                              : 'hover:bg-primary-700 text-primary-400'
                          }`}
                          disabled={!agent.enabled}
                        >
                          {isBusy ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {agentTasks.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {agentTasks.slice(0, 2).map(task => (
                        <div key={task.id} className="flex items-center space-x-2 text-xs">
                          {getTaskStatusIcon(task.status)}
                          <span className="text-dark-300 truncate">{task.task}</span>
                          {task.progress !== undefined && (
                            <div className="flex-1 bg-dark-600 rounded-full h-1 ml-2">
                              <div 
                                className="bg-primary-500 h-1 rounded-full transition-all"
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {agentTasks.length > 2 && (
                        <div className="text-xs text-dark-400">
                          +{agentTasks.length - 2} more tasks
                        </div>
                      )}
                    </div>
                  )}
                  
                  <p className="text-xs text-dark-400 mt-2">{agent.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h4 className="text-sm font-medium text-dark-400 mb-3">Quick Actions</h4>
          
          <div className="space-y-2">
            <button
              onClick={() => {
                if (currentProject) {
                  executeTask('manager', 'Create comprehensive project plan', {}, currentProject.id)
                }
              }}
              disabled={!currentProject || !agents.find(a => a.type === 'manager')?.enabled}
              className="w-full p-2 text-left bg-dark-700 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm"
            >
              <Bot size={14} className="inline mr-2" />
              Generate Project Plan
            </button>
            
            <button
              onClick={() => {
                if (currentProject) {
                  executeTask('code_generation', 'Create React component structure', {}, currentProject.id)
                }
              }}
              disabled={!currentProject || !agents.find(a => a.type === 'code_generation')?.enabled}
              className="w-full p-2 text-left bg-dark-700 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm"
            >
              <Bot size={14} className="inline mr-2" />
              Generate Code
            </button>
            
            <button
              onClick={() => {
                if (currentProject) {
                  executeTask('review', 'Review current code quality', {}, currentProject.id)
                }
              }}
              disabled={!currentProject || !agents.find(a => a.type === 'review')?.enabled}
              className="w-full p-2 text-left bg-dark-700 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm"
            >
              <Bot size={14} className="inline mr-2" />
              Code Review
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}