import React from 'react'
import { CheckCircle, XCircle, Clock, Bot, AlertCircle } from 'lucide-react'
import { useAgentStore, TaskExecution } from '../../stores/agents'

export const TaskPanel: React.FC = () => {
  const { activeTasks } = useAgentStore()

  const getStatusIcon = (status: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-900 text-green-100'
      case 'failed':
        return 'bg-red-900 text-red-100'
      case 'running':
        return 'bg-yellow-900 text-yellow-100'
      default:
        return 'bg-dark-700 text-dark-300'
    }
  }

  const getAgentColor = (agentType: string) => {
    const colors = {
      manager: 'text-blue-400',
      code_generation: 'text-green-400',
      review: 'text-yellow-400',
      testing: 'text-purple-400',
      planning: 'text-pink-400',
    }
    return colors[agentType as keyof typeof colors] || 'text-gray-400'
  }

  const getAgentName = (agentType: string) => {
    const names = {
      manager: 'Manager',
      code_generation: 'Code Gen',
      review: 'Reviewer',
      testing: 'Tester',
      planning: 'Planner',
    }
    return names[agentType as keyof typeof names] || agentType
  }

  const formatDuration = (startedAt?: Date, completedAt?: Date) => {
    if (!startedAt) return '--'
    
    const end = completedAt || new Date()
    const duration = Math.floor((end.getTime() - startedAt.getTime()) / 1000)
    
    if (duration < 60) return `${duration}s`
    if (duration < 3600) return `${Math.floor(duration / 60)}m ${duration % 60}s`
    return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`
  }

  const runningTasks = activeTasks.filter(task => task.status === 'running' || task.status === 'queued')
  const completedTasks = activeTasks.filter(task => task.status === 'completed')
  const failedTasks = activeTasks.filter(task => task.status === 'failed')

  if (activeTasks.length === 0) {
    return null
  }

  return (
    <div className="h-full flex flex-col bg-dark-800">
      <div className="p-4 border-b border-dark-700">
        <h3 className="font-semibold text-dark-100 flex items-center space-x-2">
          <Bot size={16} className="text-primary-400" />
          <span>Active Tasks</span>
          <span className="text-xs bg-primary-900 text-primary-100 px-2 py-1 rounded-full">
            {activeTasks.length}
          </span>
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Running/Queued Tasks */}
        {runningTasks.length > 0 && (
          <div className="p-4">
            <h4 className="text-sm font-medium text-dark-300 mb-3 flex items-center space-x-2">
              <Clock size={14} />
              <span>In Progress</span>
            </h4>
            <div className="space-y-2">
              {runningTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="p-4">
            <h4 className="text-sm font-medium text-dark-300 mb-3 flex items-center space-x-2">
              <CheckCircle size={14} />
              <span>Completed</span>
            </h4>
            <div className="space-y-2">
              {completedTasks.slice(0, 3).map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
              {completedTasks.length > 3 && (
                <p className="text-xs text-dark-400 text-center">
                  +{completedTasks.length - 3} more completed
                </p>
              )}
            </div>
          </div>
        )}

        {/* Failed Tasks */}
        {failedTasks.length > 0 && (
          <div className="p-4">
            <h4 className="text-sm font-medium text-dark-300 mb-3 flex items-center space-x-2">
              <XCircle size={14} />
              <span>Failed</span>
            </h4>
            <div className="space-y-2">
              {failedTasks.slice(0, 2).map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
              {failedTasks.length > 2 && (
                <p className="text-xs text-dark-400 text-center">
                  +{failedTasks.length - 2} more failed
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-dark-700 bg-dark-900">
        <div className="flex items-center justify-between text-xs text-dark-400">
          <span>
            {runningTasks.length} running
          </span>
          <span>
            {completedTasks.length} completed
          </span>
          <span>
            {failedTasks.length} failed
          </span>
        </div>
      </div>
    </div>
  )
}

interface TaskItemProps {
  task: TaskExecution
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const getAgentName = (agentType: string) => {
    const names = {
      manager: 'Manager',
      code_generation: 'Code Gen',
      review: 'Reviewer',
      testing: 'Tester',
      planning: 'Planner',
    }
    return names[agentType as keyof typeof names] || agentType
  }

  const getAgentColor = (agentType: string) => {
    const colors = {
      manager: 'text-blue-400',
      code_generation: 'text-green-400',
      review: 'text-yellow-400',
      testing: 'text-purple-400',
      planning: 'text-pink-400',
    }
    return colors[agentType as keyof typeof colors] || 'text-gray-400'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={14} className="text-green-400" />
      case 'failed':
        return <XCircle size={14} className="text-red-400" />
      case 'running':
        return <Clock size={14} className="text-yellow-400 animate-spin" />
      default:
        return <Clock size={14} className="text-dark-400" />
    }
  }

  const formatDuration = (startedAt?: Date, completedAt?: Date) => {
    if (!startedAt) return '--'
    
    const end = completedAt || new Date()
    const duration = Math.floor((end.getTime() - startedAt.getTime()) / 1000)
    
    if (duration < 60) return `${duration}s`
    if (duration < 3600) return `${Math.floor(duration / 60)}m`
    return `${Math.floor(duration / 3600)}h`
  }

  return (
    <div className="p-3 bg-dark-700 rounded-lg border border-dark-600">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getStatusIcon(task.status)}
          <span className={`text-sm font-medium ${getAgentColor(task.agentType)}`}>
            {getAgentName(task.agentType)}
          </span>
        </div>
        
        <span className="text-xs text-dark-400">
          {formatDuration(task.startedAt, task.completedAt)}
        </span>
      </div>
      
      <p className="text-sm text-dark-200 mb-2 line-clamp-2">
        {task.task}
      </p>
      
      {task.progress !== undefined && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-dark-400 mb-1">
            <span>Progress</span>
            <span>{task.progress}%</span>
          </div>
          <div className="w-full bg-dark-600 rounded-full h-1">
            <div 
              className="bg-primary-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      )}
      
      {task.error && (
        <div className="mt-2 p-2 bg-red-900 border border-red-700 rounded text-xs text-red-200">
          <div className="flex items-center space-x-1 mb-1">
            <AlertCircle size={12} />
            <span className="font-medium">Error</span>
          </div>
          <p className="truncate">{task.error}</p>
        </div>
      )}
      
      {task.result && task.status === 'completed' && (
        <div className="mt-2 text-xs text-green-400">
          ✓ Completed successfully
        </div>
      )}
    </div>
  )
}