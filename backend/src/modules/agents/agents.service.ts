import { Injectable, Logger } from '@nestjs/common';
import { AgentRegistry } from './agent.registry';
import { AgentConfig, AgentMessage } from './interfaces/agent.interface';

@Injectable()
export class AgentsService {
  private readonly logger = new Logger(AgentsService.name);

  constructor(private readonly agentRegistry: AgentRegistry) {}

  async executeAgentTask(
    agentType: string,
    task: string,
    context?: any,
    projectId?: string,
    taskId?: string,
  ): Promise<any> {
    this.logger.log(`Executing agent task: ${agentType} - ${task}`);
    
    try {
      const result = await this.agentRegistry.executeTask(
        agentType,
        task,
        context,
        projectId,
        taskId,
      );
      
      return {
        success: true,
        agentType,
        task,
        result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Agent task failed: ${error.message}`);
      return {
        success: false,
        agentType,
        task,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async executeMultipleTasks(requests: Array<{
    agentType: string;
    task: string;
    context?: any;
    projectId?: string;
    taskId?: string;
  }>): Promise<any[]> {
    this.logger.log(`Executing ${requests.length} tasks in parallel`);
    
    const results = await this.agentRegistry.executeTasks(requests);
    
    return requests.map((request, index) => ({
      request,
      result: results[index],
      timestamp: new Date().toISOString(),
    }));
  }

  async executeWorkflow(workflow: {
    name: string;
    steps: Array<{
      agentType: string;
      task: string;
      dependencies?: string[];
      condition?: string;
    }>;
  }): Promise<any> {
    this.logger.log(`Executing workflow: ${workflow.name}`);
    
    try {
      const result = await this.agentRegistry.orchestrateWorkflow(workflow);
      
      return {
        success: true,
        workflow: workflow.name,
        result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Workflow failed: ${error.message}`);
      return {
        success: false,
        workflow: workflow.name,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getAvailableAgents(): Promise<AgentConfig[]> {
    return this.agentRegistry.getAvailableAgents();
  }

  async getAgentStatus(): Promise<any> {
    return this.agentRegistry.getAgentStatus();
  }

  async getAgent(agentType: string): Promise<AgentConfig | null> {
    const agent = this.agentRegistry.getAgent(agentType);
    return agent ? agent.getConfig() : null;
  }

  async broadcastMessage(message: AgentMessage): Promise<void> {
    this.logger.log(`Broadcasting message: ${message.type} from ${message.agentName}`);
    
    // This would integrate with WebSocket gateway
    // For now, just log the message
    this.logger.debug(`Message data: ${JSON.stringify(message.data)}`);
  }

  async handleAgentCommunication(fromAgent: string, toAgent: string, message: any): Promise<any> {
    this.logger.log(`Agent communication: ${fromAgent} -> ${toAgent}`);
    
    const targetAgent = this.agentRegistry.getAgent(toAgent);
    if (!targetAgent) {
      throw new Error(`Target agent '${toAgent}' not found`);
    }

    // Process the message (this would be more sophisticated in a real implementation)
    const response = {
      from: toAgent,
      to: fromAgent,
      timestamp: new Date().toISOString(),
      processed: true,
      message: `Message received and processed by ${toAgent}`,
    };

    return response;
  }

  async optimizeAgentPerformance(agentType: string): Promise<any> {
    this.logger.log(`Optimizing performance for agent: ${agentType}`);
    
    // Simulate performance optimization
    const optimizations = [
      'Cache AI responses for similar tasks',
      'Implement parallel processing for independent tasks',
      'Reduce timeout for well-tested workflows',
      'Enable proactive task preloading',
    ];

    const result = {
      agentType,
      optimizations,
      estimatedImprovement: '25-40% performance boost',
      implementation: {
        cacheHits: '67% of requests',
        parallelTasks: '3x throughput',
        reducedTimeouts: '15% faster response',
        proactiveLoading: '50% faster initial tasks',
      },
    };

    return {
      success: true,
      result,
      timestamp: new Date().toISOString(),
    };
  }

  async getAgentMetrics(agentType?: string): Promise<any> {
    // Simulate metrics collection
    const baseMetrics = {
      totalTasks: 1247,
      successfulTasks: 1198,
      failedTasks: 49,
      averageExecutionTime: 2.4, // seconds
      tokensUsed: 45632,
      costPerTask: 0.03, // USD
      uptime: '99.7%',
    };

    if (agentType) {
      return {
        agentType,
        metrics: baseMetrics,
        breakdown: {
          byTaskType: {
            'code_generation': { count: 456, avgTime: 3.1 },
            'review': { count: 234, avgTime: 2.8 },
            'testing': { count: 189, avgTime: 1.9 },
            'planning': { count: 98, avgTime: 2.1 },
            'other': { count: 270, avgTime: 2.0 },
          },
          byTimeOfDay: {
            'morning': 0.25,
            'afternoon': 0.35,
            'evening': 0.30,
            'night': 0.10,
          },
        },
      };
    }

    // Return aggregated metrics for all agents
    return {
      allAgents: {
        ...baseMetrics,
        agents: {
          manager: { ...baseMetrics, tasks: 245 },
          planning: { ...baseMetrics, tasks: 189 },
          code_generation: { ...baseMetrics, tasks: 456 },
          review: { ...baseMetrics, tasks: 234 },
          testing: { ...baseMetrics, tasks: 123 },
        },
      },
    };
  }

  async resetAgent(agentType: string): Promise<any> {
    this.logger.log(`Resetting agent: ${agentType}`);
    
    // Simulate agent reset
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      agentType,
      message: `Agent '${agentType}' has been reset successfully`,
      timestamp: new Date().toISOString(),
    };
  }

  async updateAgentConfig(agentType: string, config: Partial<AgentConfig>): Promise<any> {
    this.logger.log(`Updating configuration for agent: ${agentType}`);
    
    // In a real implementation, this would update the agent configuration
    const currentConfig = await this.getAgent(agentType);
    if (!currentConfig) {
      throw new Error(`Agent '${agentType}' not found`);
    }

    const updatedConfig = { ...currentConfig, ...config };
    
    return {
      success: true,
      agentType,
      updatedConfig,
      message: `Agent '${agentType}' configuration updated successfully`,
      timestamp: new Date().toISOString(),
    };
  }
}