import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent } from './base/base-agent';
import { AgentConfig } from './interfaces/agent.interface';
import { ManagerAgent } from './implementations/manager-agent';
import { PlanningAgent } from './implementations/planning-agent';
import { CodeGenerationAgent } from './implementations/code-generation-agent';
import { ReviewAgent } from './implementations/review-agent';
import { TestingAgent } from './implementations/testing-agent';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentExecution } from '../../database/entities/agent-execution.entity';

@Injectable()
export class AgentRegistry implements OnModuleInit {
  private readonly logger = new Logger(AgentRegistry.name);
  private agents: Map<string, BaseAgent> = new Map();

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(AgentExecution)
    private readonly agentExecutionRepo: Repository<AgentExecution>,
    private readonly managerAgent: ManagerAgent,
    private readonly planningAgent: PlanningAgent,
    private readonly codeGenerationAgent: CodeGenerationAgent,
    private readonly reviewAgent: ReviewAgent,
    private readonly testingAgent: TestingAgent,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing Agent Registry...');
    
    // Register all available agents
    await this.registerAgent('manager', this.managerAgent);
    await this.registerAgent('planning', this.planningAgent);
    await this.registerAgent('code_generation', this.codeGenerationAgent);
    await this.registerAgent('review', this.reviewAgent);
    await this.registerAgent('testing', this.testingAgent);
    
    this.logger.log(`Agent Registry initialized with ${this.agents.size} agents`);
    this.listAgents();
  }

  async registerAgent(type: string, agent: BaseAgent): Promise<void> {
    if (this.agents.has(type)) {
      this.logger.warn(`Agent type '${type}' is already registered. Replacing...`);
    }
    
    if (!agent.isEnabled()) {
      this.logger.log(`Agent '${type}' is disabled, skipping registration`);
      return;
    }
    
    this.agents.set(type, agent);
    this.logger.log(`Registered agent: ${type} (${agent.getConfig().name})`);
  }

  getAgent(type: string): BaseAgent | undefined {
    const agent = this.agents.get(type);
    if (!agent) {
      this.logger.error(`Agent type '${type}' not found`);
      return undefined;
    }
    
    return agent;
  }

  getAllAgents(): Map<string, BaseAgent> {
    return new Map(this.agents);
  }

  getAvailableAgents(): AgentConfig[] {
    const configs: AgentConfig[] = [];
    
    for (const [type, agent] of this.agents) {
      configs.push(agent.getConfig());
    }
    
    return configs;
  }

  async executeTask(
    agentType: string,
    task: string,
    context?: any,
    projectId?: string,
    taskId?: string,
  ): Promise<any> {
    const agent = this.getAgent(agentType);
    if (!agent) {
      throw new Error(`Agent type '${agentType}' not available`);
    }

    this.logger.log(`Executing task with ${agentType}: ${task}`);

    const input = {
      task,
      context,
      projectId,
      taskId,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
      },
    };

    try {
      const result = await agent.processTask(input);
      
      if (!result.success) {
        this.logger.error(`Task failed: ${result.error}`);
        throw new Error(result.error);
      }

      this.logger.log(`Task completed successfully in ${result.duration}ms`);
      return result;
    } catch (error) {
      this.logger.error(`Task execution failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async executeTasks(requests: Array<{
    agentType: string;
    task: string;
    context?: any;
    projectId?: string;
    taskId?: string;
  }>): Promise<any[]> {
    this.logger.log(`Executing ${requests.length} tasks in parallel`);
    
    const promises = requests.map(request =>
      this.executeTask(
        request.agentType,
        request.task,
        request.context,
        request.projectId,
        request.taskId,
      ).catch(error => ({
        success: false,
        error: error.message,
        agentType: request.agentType,
      }))
    );

    const results = await Promise.all(promises);
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    this.logger.log(`Tasks completed: ${successful} successful, ${failed} failed`);
    
    return results;
  }

  async orchestrateWorkflow(workflow: {
    name: string;
    steps: Array<{
      agentType: string;
      task: string;
      dependencies?: string[];
      condition?: string;
    }>;
  }): Promise<any> {
    this.logger.log(`Orchestrating workflow: ${workflow.name}`);
    
    const executedSteps: any[] = [];
    const stepResults: Map<string, any> = new Map();

    for (const step of workflow.steps) {
      // Check dependencies
      if (step.dependencies && step.dependencies.length > 0) {
        const missingDeps = step.dependencies.filter(dep => !stepResults.has(dep));
        if (missingDeps.length > 0) {
          this.logger.warn(`Skipping step due to missing dependencies: ${missingDeps}`);
          continue;
        }
      }

      try {
        const result = await this.executeTask(step.agentType, step.task, {
          previousResults: Object.fromEntries(stepResults),
        });
        
        stepResults.set(step.task, result);
        executedSteps.push({ step, result, status: 'completed' });
        
        this.logger.log(`Completed step: ${step.agentType} - ${step.task}`);
      } catch (error) {
        this.logger.error(`Failed step: ${step.agentType} - ${step.task}`, error.stack);
        executedSteps.push({ step, error: error.message, status: 'failed' });
        
        if (workflow.name !== 'non-critical') {
          throw error;
        }
      }
    }

    return {
      workflow: workflow.name,
      totalSteps: workflow.steps.length,
      completedSteps: executedSteps.filter(s => s.status === 'completed').length,
      failedSteps: executedSteps.filter(s => s.status === 'failed').length,
      results: Object.fromEntries(stepResults),
      steps: executedSteps,
    };
  }

  getAgentStatus(): any {
    const status: any = {};
    
    for (const [type, agent] of this.agents) {
      status[type] = {
        name: agent.getConfig().name,
        enabled: agent.isEnabled(),
        role: agent.getConfig().role,
        description: agent.getConfig().description,
        healthy: true, // TODO: Implement health checks
      };
    }
    
    return status;
  }

  private listAgents(): void {
    this.logger.log('Available agents:');
    for (const [type, agent] of this.agents) {
      const config = agent.getConfig();
      this.logger.log(`  ${type}: ${config.name} (${config.role}) - ${config.enabled ? 'enabled' : 'disabled'}`);
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}