import { create } from 'zustand';
import { useWebSocketStore } from './websocket';

export interface AgentConfig {
  name: string;
  type: string;
  enabled: boolean;
  role: string;
  description: string;
  timeout: number;
  retryAttempts: number;
  maxConcurrent: number;
}

export interface AgentStatus {
  [key: string]: {
    name: string;
    enabled: boolean;
    role: string;
    description: string;
    healthy: boolean;
  };
}

export interface TaskExecution {
  id: string;
  agentType: string;
  task: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  progress?: number;
  startedAt?: Date;
  completedAt?: Date;
}

interface AgentState {
  agents: AgentConfig[];
  agentStatus: AgentStatus;
  activeTasks: TaskExecution[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAgents: () => Promise<void>;
  fetchAgentStatus: () => Promise<void>;
  executeTask: (agentType: string, task: string, context?: any, projectId?: string) => Promise<void>;
  executeTasks: (requests: Array<{ agentType: string; task: string; context?: any }>) => Promise<void>;
  executeWorkflow: (workflow: any) => Promise<void>;
  getTaskById: (id: string) => TaskExecution | undefined;
  updateTaskProgress: (id: string, progress: number, result?: any) => void;
  completeTask: (id: string, result: any) => void;
  failTask: (id: string, error: string) => void;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  agents: [],
  agentStatus: {},
  activeTasks: [],
  isLoading: false,
  error: null,

  fetchAgents: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('http://localhost:3001/api/agents');
      const data = await response.json();
      
      if (data.success) {
        set({ agents: data.data, isLoading: false });
      } else {
        throw new Error(data.error || 'Failed to fetch agents');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      });
    }
  },

  fetchAgentStatus: async () => {
    try {
      const response = await fetch('http://localhost:3001/api/agents/status');
      const data = await response.json();
      
      if (data.success) {
        set({ agentStatus: data.data });
      }
    } catch (error) {
      console.error('Failed to fetch agent status:', error);
    }
  },

  executeTask: async (agentType: string, task: string, context?: any, projectId?: string) => {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add task to active tasks
    const newTask: TaskExecution = {
      id: taskId,
      agentType,
      task,
      status: 'queued',
      startedAt: new Date(),
    };

    set(state => ({
      activeTasks: [...state.activeTasks, newTask],
    }));

    try {
      // Update task to running
      get().updateTaskProgress(taskId, 10);

      // Emit via WebSocket
      useWebSocketStore.getState().emit('agent_task_request', {
        agentType,
        task,
        context,
        projectId,
        taskId,
      });

    } catch (error) {
      get().failTask(taskId, error instanceof Error ? error.message : 'Unknown error');
    }
  },

  executeTasks: async (requests: Array<{ agentType: string; task: string; context?: any }>) => {
    // This would typically batch multiple task requests
    for (const request of requests) {
      await get().executeTask(request.agentType, request.task, request.context);
    }
  },

  executeWorkflow: async (workflow: any) => {
    try {
      const response = await fetch('http://localhost:3001/api/agents/workflow/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  },

  getTaskById: (id: string) => {
    return get().activeTasks.find(task => task.id === id);
  },

  updateTaskProgress: (id: string, progress: number, result?: any) => {
    set(state => ({
      activeTasks: state.activeTasks.map(task =>
        task.id === id 
          ? { ...task, status: 'running', progress, ...(result && { result }) }
          : task
      ),
    }));
  },

  completeTask: (id: string, result: any) => {
    set(state => ({
      activeTasks: state.activeTasks.map(task =>
        task.id === id 
          ? { ...task, status: 'completed', progress: 100, result, completedAt: new Date() }
          : task
      ),
    }));
  },

  failTask: (id: string, error: string) => {
    set(state => ({
      activeTasks: state.activeTasks.map(task =>
        task.id === id 
          ? { ...task, status: 'failed', error, completedAt: new Date() }
          : task
      ),
    }));
  },
}));

// Listen for WebSocket events to update task status
useWebSocketStore.getState().on('task_started', (data) => {
  console.log('Task started:', data);
});

useWebSocketStore.getState().on('task_completed', (data) => {
  const store = useAgentStore.getState();
  if (data.taskId) {
    store.completeTask(data.taskId, data.result);
  }
});

useWebSocketStore.getState().on('task_failed', (data) => {
  const store = useAgentStore.getState();
  if (data.taskId) {
    store.failTask(data.taskId, data.error);
  }
});

useWebSocketStore.getState().on('agent_progress', (data) => {
  const store = useAgentStore.getState();
  if (data.taskId) {
    store.updateTaskProgress(data.taskId, data.percentage || 0);
  }
});