import React, { useState } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { useProjectStore } from '../../stores/projects'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const currentProject = useProjectStore(state => state.currentProject)

  return (
    <div className="app-container">
      <Header 
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        sidebarCollapsed={sidebarCollapsed}
        project={currentProject}
      />
      
      <div className="main-layout">
        <Sidebar 
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}