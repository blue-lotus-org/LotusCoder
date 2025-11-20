import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { useAgentStore } from '../../stores/agents'
import { useProjectStore } from '../../stores/projects'

interface Message {
  id: string
  type: 'user' | 'agent'
  content: string
  timestamp: Date
  agentType?: string
}

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { executeTask } = useAgentStore()
  const { currentProject } = useProjectStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(scrollToBottom, [messages])

  const sendMessage = async () => {
    if (!input.trim() || !currentProject) return

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsSending(true)

    try {
      // Determine which agent to use based on message content
      const messageContent = input.toLowerCase()
      let agentType = 'manager' // default

      if (messageContent.includes('generate') || messageContent.includes('create') || messageContent.includes('code')) {
        agentType = 'code_generation'
      } else if (messageContent.includes('review') || messageContent.includes('check') || messageContent.includes('improve')) {
        agentType = 'review'
      } else if (messageContent.includes('test') || messageContent.includes('test')) {
        agentType = 'testing'
      } else if (messageContent.includes('plan') || messageContent.includes('breakdown')) {
        agentType = 'planning'
      }

      // Execute task with agent
      executeTask(agentType, input, {}, currentProject.id)

      // Simulate agent response (in real app, this would come from WebSocket)
      const agentResponse: Message = {
        id: `agent_${Date.now()}`,
        type: 'agent',
        agentType,
        content: generateAgentResponse(agentType, input),
        timestamp: new Date(),
      }

      setTimeout(() => {
        setMessages(prev => [...prev, agentResponse])
        setIsSending(false)
      }, 2000)

    } catch (error) {
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        type: 'agent',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, errorMessage])
      setIsSending(false)
    }
  }

  const generateAgentResponse = (agentType: string, userInput: string): string => {
    const responses = {
      manager: [
        'I\'ll analyze your request and create an execution plan.',
        'Let me coordinate the agents to handle this efficiently.',
        'I\'ve reviewed your project and I have some suggestions.',
      ],
      code_generation: [
        'I\'ll generate the code for your request.',
        'Let me create the code components you need.',
        'I\'m working on generating the code structure.',
      ],
      review: [
        'I\'ll review the code and provide feedback.',
        'Let me analyze the code for improvements.',
        'I\'m checking the code quality and suggesting enhancements.',
      ],
      testing: [
        'I\'ll create comprehensive tests for your code.',
        'Let me generate test cases and scenarios.',
        'I\'m working on test coverage analysis.',
      ],
      planning: [
        'I\'ll create a detailed plan for your project.',
        'Let me break down your requirements into tasks.',
        'I\'m analyzing the project structure and creating a roadmap.',
      ],
    }

    const agentResponses = responses[agentType as keyof typeof responses] || responses.manager
    return agentResponses[Math.floor(Math.random() * agentResponses.length)]
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getAgentName = (agentType?: string) => {
    const names = {
      manager: 'Manager Agent',
      code_generation: 'Code Generator',
      review: 'Review Agent',
      testing: 'Testing Agent',
      planning: 'Planning Agent',
    }
    return names[agentType as keyof typeof names] || 'AI Assistant'
  }

  const getAgentColor = (agentType?: string) => {
    const colors = {
      manager: 'text-blue-400',
      code_generation: 'text-green-400',
      review: 'text-yellow-400',
      testing: 'text-purple-400',
      planning: 'text-pink-400',
    }
    return colors[agentType as keyof typeof colors] || 'text-gray-400'
  }

  return (
    <div className="h-full flex flex-col bg-dark-900">
      {/* Chat Header */}
      <div className="p-4 border-b border-dark-700">
        <h3 className="font-semibold text-dark-100 flex items-center space-x-2">
          <Bot size={18} className="text-primary-400" />
          <span>AI Assistant</span>
        </h3>
        <p className="text-sm text-dark-400 mt-1">
          Ask me to generate code, review your work, or plan your project
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot size={48} className="mx-auto text-dark-500 mb-4" />
            <p className="text-dark-400 mb-2">Start a conversation with AI agents</p>
            <p className="text-dark-500 text-sm">
              Try: "Generate a React component" or "Review my code"
            </p>
          </div>
        )}

        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-700 text-dark-100'
              }`}
            >
              {message.type === 'agent' && (
                <div className={`flex items-center space-x-2 mb-2 ${getAgentColor(message.agentType)}`}>
                  <Bot size={14} />
                  <span className="text-sm font-medium">{getAgentName(message.agentType)}</span>
                </div>
              )}
              
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              
              <p className={`text-xs mt-2 ${
                message.type === 'user' ? 'text-primary-200' : 'text-dark-400'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex justify-start">
            <div className="bg-dark-700 text-dark-100 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Loader2 size={14} className="animate-spin" />
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-dark-700">
        <div className="flex space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              currentProject 
                ? "Ask me to generate code, review, test, or plan..."
                : "Select a project to start chatting"
            }
            disabled={!currentProject || isSending}
            className="flex-1 min-h-[40px] max-h-[120px] px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 placeholder-dark-400 focus:border-primary-500 focus:outline-none resize-none disabled:opacity-50"
            rows={1}
          />
          
          <button
            onClick={sendMessage}
            disabled={!input.trim() || !currentProject || isSending}
            className="px-3 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-dark-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
        
        <p className="text-xs text-dark-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}