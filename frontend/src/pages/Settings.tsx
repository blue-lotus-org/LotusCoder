import React, { useState } from 'react'
import { Save, Settings as SettingsIcon, Bot, Wifi, Database } from 'lucide-react'

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    ai: {
      openaiApiKey: '',
      defaultModel: 'gpt-4',
      temperature: 0.7,
    },
    agents: {
      maxConcurrent: 5,
      timeout: 300000,
      retryAttempts: 3,
    },
    editor: {
      fontSize: 14,
      theme: 'vs-dark',
      wordWrap: true,
      minimap: true,
    },
    preview: {
      autoRefresh: true,
      refreshDelay: 1000,
    },
  })

  const handleSave = () => {
    // Save settings to localStorage or API
    localStorage.setItem('app-settings', JSON.stringify(settings))
    alert('Settings saved successfully!')
  }

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value,
      },
    }))
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-100 mb-2">Settings</h1>
        <p className="text-dark-400">Configure your AI Coding App preferences</p>
      </div>

      <div className="space-y-8">
        {/* AI Settings */}
        <div className="bg-dark-800 border border-dark-700 rounded-lg">
          <div className="p-6 border-b border-dark-700">
            <div className="flex items-center space-x-2">
              <Bot className="text-primary-400" size={20} />
              <h2 className="text-xl font-semibold text-dark-100">AI Configuration</h2>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                OpenAI API Key
              </label>
              <input
                type="password"
                value={settings.ai.openaiApiKey}
                onChange={(e) => updateSetting('ai', 'openaiApiKey', e.target.value)}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:border-primary-500 focus:outline-none"
                placeholder="sk-..."
              />
              <p className="text-xs text-dark-400 mt-1">
                Your API key is stored locally and never sent to our servers
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Default Model
              </label>
              <select
                value={settings.ai.defaultModel}
                onChange={(e) => updateSetting('ai', 'defaultModel', e.target.value)}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:border-primary-500 focus:outline-none"
              >
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Temperature: {settings.ai.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.ai.temperature}
                onChange={(e) => updateSetting('ai', 'temperature', parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-dark-400 mt-1">
                Lower values for more focused, higher values for more creative responses
              </p>
            </div>
          </div>
        </div>

        {/* Agent Settings */}
        <div className="bg-dark-800 border border-dark-700 rounded-lg">
          <div className="p-6 border-b border-dark-700">
            <div className="flex items-center space-x-2">
              <SettingsIcon className="text-primary-400" size={20} />
              <h2 className="text-xl font-semibold text-dark-100">Agent Settings</h2>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Max Concurrent Agents
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.agents.maxConcurrent}
                onChange={(e) => updateSetting('agents', 'maxConcurrent', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:border-primary-500 focus:outline-none"
              />
              <p className="text-xs text-dark-400 mt-1">
                Maximum number of agents that can run tasks simultaneously
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Task Timeout (seconds)
              </label>
              <input
                type="number"
                min="30"
                max="600"
                value={settings.agents.timeout / 1000}
                onChange={(e) => updateSetting('agents', 'timeout', parseInt(e.target.value) * 1000)}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Retry Attempts
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={settings.agents.retryAttempts}
                onChange={(e) => updateSetting('agents', 'retryAttempts', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Editor Settings */}
        <div className="bg-dark-800 border border-dark-700 rounded-lg">
          <div className="p-6 border-b border-dark-700">
            <h2 className="text-xl font-semibold text-dark-100">Code Editor</h2>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Font Size: {settings.editor.fontSize}px
              </label>
              <input
                type="range"
                min="10"
                max="24"
                value={settings.editor.fontSize}
                onChange={(e) => updateSetting('editor', 'fontSize', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Theme
              </label>
              <select
                value={settings.editor.theme}
                onChange={(e) => updateSetting('editor', 'theme', e.target.value)}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:border-primary-500 focus:outline-none"
              >
                <option value="vs-dark">Dark</option>
                <option value="vs">Light</option>
                <option value="hc-black">High Contrast</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.editor.wordWrap}
                  onChange={(e) => updateSetting('editor', 'wordWrap', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-dark-300">Enable word wrap</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.editor.minimap}
                  onChange={(e) => updateSetting('editor', 'minimap', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-dark-300">Show minimap</span>
              </label>
            </div>
          </div>
        </div>

        {/* Preview Settings */}
        <div className="bg-dark-800 border border-dark-700 rounded-lg">
          <div className="p-6 border-b border-dark-700">
            <h2 className="text-xl font-semibold text-dark-100">Live Preview</h2>
          </div>
          
          <div className="p-6 space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.preview.autoRefresh}
                onChange={(e) => updateSetting('preview', 'autoRefresh', e.target.checked)}
                className="mr-2"
              />
              <span className="text-dark-300">Auto-refresh preview</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Refresh Delay (ms)
              </label>
              <input
                type="number"
                min="100"
                max="5000"
                value={settings.preview.refreshDelay}
                onChange={(e) => updateSetting('preview', 'refreshDelay', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <Save size={18} />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  )
}