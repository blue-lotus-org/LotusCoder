import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'
import { Dashboard } from './pages/Dashboard'
import { ProjectEditor } from './pages/ProjectEditor'
import { Settings } from './pages/Settings'
import { useWebSocketStore } from './stores/websocket'
import './App.css'

function App() {
  // Initialize WebSocket connection
  useWebSocketStore(state => state.connect())

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/project/:id" element={<ProjectEditor />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App