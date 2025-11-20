import { Injectable } from '@nestjs/common';
import { BaseAgent } from '../base/base-agent';
import { AgentInput, AgentOutput } from '../interfaces/agent.interface';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentExecution } from '../../../database/entities/agent-execution.entity';

@Injectable()
export class PlanningAgent extends BaseAgent {
  constructor(
    @InjectRepository(AgentExecution)
    agentExecutionRepo: Repository<AgentExecution>,
    private readonly configService: ConfigService,
  ) {
    super({
      name: 'PlanningAgent',
      type: 'planning',
      enabled: true,
      role: 'task_planner',
      description: 'Breaks down tasks into subtasks and creates execution plans',
      timeout: 45000,
      retryAttempts: 3,
      maxConcurrent: 3,
    }, agentExecutionRepo, configService, PlanningAgent.name);
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const task = input.task.toLowerCase();

    try {
      if (task.includes('frontend') || task.includes('react')) {
        return await this.planFrontendDevelopment(input);
      } else if (task.includes('backend') || task.includes('api')) {
        return await this.planBackendDevelopment(input);
      } else if (task.includes('fullstack') || task.includes('complete')) {
        return await this.planFullstackDevelopment(input);
      } else if (task.includes('desktop') || task.includes('electron')) {
        return await this.planDesktopDevelopment(input);
      } else {
        return await this.planGenericProject(input);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        duration: 0,
      };
    }
  }

  private async planFrontendDevelopment(input: AgentInput): Promise<AgentOutput> {
    this.getLogger().log('Planning frontend development');
    
    const tasks = [
      {
        id: 'setup-frontend',
        title: 'Setup React Project',
        description: 'Initialize Vite + React + TypeScript project',
        agentType: 'code_generation',
        priority: 1,
        dependencies: [],
        estimatedTime: '15 minutes',
        tasks: [
          'Create Vite configuration',
          'Setup TypeScript config',
          'Configure Tailwind CSS',
          'Setup Monaco Editor',
        ],
      },
      {
        id: 'components',
        title: 'Create Core Components',
        description: 'Build main UI components',
        agentType: 'code_generation',
        priority: 2,
        dependencies: ['setup-frontend'],
        estimatedTime: '1 hour',
        tasks: [
          'Code editor component',
          'Live preview component',
          'File explorer component',
          'Terminal component',
        ],
      },
      {
        id: 'state-management',
        title: 'Implement State Management',
        description: 'Setup Zustand for state management',
        agentType: 'code_generation',
        priority: 2,
        dependencies: ['setup-frontend'],
        estimatedTime: '30 minutes',
        tasks: [
          'Create store definitions',
          'Setup project state',
          'Implement file state',
          'Create agent state',
        ],
      },
      {
        id: 'websocket',
        title: 'Setup WebSocket Connection',
        description: 'Connect to backend WebSocket for real-time updates',
        agentType: 'code_generation',
        priority: 3,
        dependencies: ['setup-frontend'],
        estimatedTime: '20 minutes',
        tasks: [
          'Setup Socket.io client',
          'Handle connection events',
          'Implement real-time updates',
          'Error handling',
        ],
      },
    ];

    return {
      success: true,
      result: {
        projectType: 'frontend',
        tasks,
        totalTasks: tasks.length,
        estimatedTime: '2 hours 5 minutes',
        criticalPath: ['setup-frontend', 'components'],
        requirements: [
          'Node.js 18+',
          'Vite',
          'React 18',
          'TypeScript',
          'Tailwind CSS',
        ],
      },
      duration: 2000,
    };
  }

  private async planBackendDevelopment(input: AgentInput): Promise<AgentOutput> {
    this.getLogger().log('Planning backend development');
    
    const tasks = [
      {
        id: 'setup-backend',
        title: 'Setup NestJS Project',
        description: 'Initialize NestJS with TypeScript',
        agentType: 'code_generation',
        priority: 1,
        dependencies: [],
        estimatedTime: '20 minutes',
        tasks: [
          'Create NestJS project structure',
          'Setup TypeScript configuration',
          'Configure database connections',
          'Setup Redis for caching',
        ],
      },
      {
        id: 'database',
        title: 'Setup Database Schema',
        description: 'Create database entities and migrations',
        agentType: 'code_generation',
        priority: 1,
        dependencies: ['setup-backend'],
        estimatedTime: '30 minutes',
        tasks: [
          'Define entity models',
          'Create database migrations',
          'Setup TypeORM configuration',
          'Create seed data',
        ],
      },
      {
        id: 'agents-system',
        title: 'Implement Multi-Agent System',
        description: 'Create the core agent architecture',
        agentType: 'code_generation',
        priority: 2,
        dependencies: ['setup-backend'],
        estimatedTime: '1 hour',
        tasks: [
          'Create base agent class',
          'Implement agent registry',
          'Setup task queue with Bull',
          'Create agent communication',
        ],
      },
      {
        id: 'ai-integration',
        title: 'Setup AI Providers',
        description: 'Integrate OpenAI and other AI services',
        agentType: 'code_generation',
        priority: 2,
        dependencies: ['setup-backend'],
        estimatedTime: '45 minutes',
        tasks: [
          'Setup OpenAI API integration',
          'Create AI provider interface',
          'Implement response caching',
          'Setup error handling',
        ],
      },
      {
        id: 'websocket',
        title: 'Setup WebSocket Gateway',
        description: 'Create real-time communication system',
        agentType: 'code_generation',
        priority: 3,
        dependencies: ['agents-system'],
        estimatedTime: '30 minutes',
        tasks: [
          'Create WebSocket gateway',
          'Handle client connections',
          'Broadcast agent updates',
          'Setup room management',
        ],
      },
    ];

    return {
      success: true,
      result: {
        projectType: 'backend',
        tasks,
        totalTasks: tasks.length,
        estimatedTime: '3 hours 5 minutes',
        criticalPath: ['setup-backend', 'agents-system', 'websocket'],
        requirements: [
          'Node.js 18+',
          'NestJS',
          'PostgreSQL',
          'Redis',
          'TypeScript',
        ],
      },
      duration: 1800,
    };
  }

  private async planFullstackDevelopment(input: AgentInput): Promise<AgentOutput> {
    this.getLogger().log('Planning fullstack development');
    
    const tasks = [
      {
        id: 'architecture',
        title: 'System Architecture Design',
        description: 'Plan the overall system architecture',
        agentType: 'planning',
        priority: 1,
        dependencies: [],
        estimatedTime: '45 minutes',
        tasks: [
          'Define system components',
          'Plan data flow',
          'Design API structure',
          'Setup deployment strategy',
        ],
      },
      {
        id: 'setup-frontend',
        title: 'Setup Frontend Application',
        description: 'Initialize React frontend',
        agentType: 'code_generation',
        priority: 1,
        dependencies: ['architecture'],
        estimatedTime: '15 minutes',
        tasks: [
          'Create Vite + React project',
          'Setup TypeScript and Tailwind',
          'Configure build pipeline',
        ],
      },
      {
        id: 'setup-backend',
        title: 'Setup Backend Application',
        description: 'Initialize NestJS backend',
        agentType: 'code_generation',
        priority: 1,
        dependencies: ['architecture'],
        estimatedTime: '20 minutes',
        tasks: [
          'Create NestJS project',
          'Setup database and Redis',
          'Configure environment',
        ],
      },
      {
        id: 'core-features',
        title: 'Implement Core Features',
        description: 'Build main application features',
        agentType: 'code_generation',
        priority: 2,
        dependencies: ['setup-frontend', 'setup-backend'],
        estimatedTime: '3 hours',
        tasks: [
          'Frontend UI components',
          'Backend API endpoints',
          'Real-time features',
          'Agent system integration',
        ],
      },
    ];

    return {
      success: true,
      result: {
        projectType: 'fullstack',
        tasks,
        totalTasks: tasks.length,
        estimatedTime: '4 hours 20 minutes',
        criticalPath: ['architecture', 'setup-frontend', 'setup-backend', 'core-features'],
        requirements: [
          'Frontend: React + Vite + TypeScript',
          'Backend: NestJS + PostgreSQL + Redis',
          'Real-time: Socket.io',
          'AI: OpenAI API',
        ],
      },
      duration: 2500,
    };
  }

  private async planDesktopDevelopment(input: AgentInput): Promise<AgentOutput> {
    this.getLogger().log('Planning desktop development');
    
    const tasks = [
      {
        id: 'setup-electron',
        title: 'Setup Electron Application',
        description: 'Initialize Electron with React frontend',
        agentType: 'code_generation',
        priority: 1,
        dependencies: [],
        estimatedTime: '30 minutes',
        tasks: [
          'Create Electron main process',
          'Setup React renderer process',
          'Configure build and packaging',
          'Setup auto-updater',
        ],
      },
      {
        id: 'native-features',
        title: 'Implement Native Features',
        description: 'Add desktop-specific functionality',
        agentType: 'code_generation',
        priority: 2,
        dependencies: ['setup-electron'],
        estimatedTime: '1 hour',
        tasks: [
          'File system access',
          'System notifications',
          'Menu and toolbar',
          'Window management',
        ],
      },
    ];

    return {
      success: true,
      result: {
        projectType: 'desktop',
        tasks,
        totalTasks: tasks.length,
        estimatedTime: '1 hour 30 minutes',
        criticalPath: ['setup-electron', 'native-features'],
        requirements: [
          'Electron',
          'React',
          'Node.js',
          'TypeScript',
        ],
      },
      duration: 1500,
    };
  }

  private async planGenericProject(input: AgentInput): Promise<AgentOutput> {
    this.getLogger().log('Planning generic project');
    
    return {
      success: true,
      result: {
        message: 'Planning agent analyzed the request',
        recommendations: [
          'Specify project type for better planning',
          'Include technology preferences',
          'Provide feature requirements',
          'Define deployment target',
        ],
      },
      duration: 1000,
    };
  }
}