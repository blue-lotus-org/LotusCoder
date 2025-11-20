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

export interface AgentInput {
  task: string;
  context?: any;
  projectId?: string;
  taskId?: string;
  metadata?: any;
}

export interface AgentOutput {
  success: boolean;
  result?: any;
  error?: string;
  duration: number;
  tokensUsed?: number;
  agentExecutionId?: string;
  nextActions?: string[];
}

export interface AgentMessage {
  type: 'task_request' | 'task_response' | 'status_update' | 'error';
  agentType: string;
  agentName: string;
  data: any;
  timestamp: Date;
}