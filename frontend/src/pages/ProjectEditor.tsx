import React from 'react'
import { useParams } from 'react-router-dom'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from 'react-resizable-panels'
import { CodeEditor } from '../components/Editor/CodeEditor'
import { LivePreview } from '../components/Preview/LivePreview'
import { ChatInterface } from '../components/Chat/ChatInterface'
import { TaskPanel } from '../components/Agents/TaskPanel'
import { useProjectStore } from '../stores/projects'
import { useAgentStore } from '../stores/agents'

export const ProjectEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { currentProject, files } = useProjectStore()
  const { activeTasks } = useAgentStore()

  React.useEffect(() => {
    // Load project by ID
    if (id && currentProject?.id !== id) {
      // In a real app, this would fetch the project from the API
      console.log('Loading project:', id)
    }
  }, [id, currentProject])

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-dark-100 mb-2">Project not found</h2>
          <p className="text-dark-400">The project you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Panel - Code Editor */}
          <ResizablePanel defaultSize={40} minSize={20}>
            <div className="h-full flex flex-col">
              <div className="flex-1">
                <CodeEditor />
              </div>
              
              {/* Active Tasks */}
              {activeTasks.length > 0 && (
                <div className="h-32 border-t border-dark-700">
                  <TaskPanel />
                </div>
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Preview and Chat */}
          <ResizablePanel defaultSize={60} minSize={30}>
            <ResizablePanelGroup direction="vertical">
              {/* Preview */}
              <ResizablePanel defaultSize={70} minSize={40}>
                <div className="h-full">
                  <LivePreview />
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Chat Interface */}
              <ResizablePanel defaultSize={30} minSize={20}>
                <div className="h-full border-t border-dark-700">
                  <ChatInterface />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}