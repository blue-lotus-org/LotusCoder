import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { AgentInput, AgentOutput, AgentMessage, AgentConfig } from '../interfaces/agent.interface';
import { AgentExecution } from '../../../database/entities/agent-execution.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export abstract class BaseAgent {
  protected readonly logger: Logger;
  protected readonly config: AgentConfig;
  protected readonly agentExecutionRepo: Repository<AgentExecution>;
  protected readonly configService: ConfigService;

  constructor(
    config: AgentConfig,
    agentExecutionRepo: Repository<AgentExecution>,
    configService: ConfigService,
    loggerName: string,
  ) {
    this.config = config;
    this.agentExecutionRepo = agentExecutionRepo;
    this.configService = configService;
    this.logger = new Logger(loggerName);
  }

  abstract execute(input: AgentInput): Promise<AgentOutput>;

  async processTask(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    let agentExecution: AgentExecution;

    try {
      this.logger.log(`Starting task execution for ${input.task}`);

      // Create agent execution record
      agentExecution = this.agentExecutionRepo.create({
        id: uuidv4(),
        agentType: this.config.type,
        agentName: this.config.name,
        status: 'running',
        input: JSON.stringify(input),
        taskId: input.taskId,
        projectId: input.projectId,
        startedAt: new Date(),
      });

      await this.agentExecutionRepo.save(agentExecution);

      // Execute the task
      const result = await this.execute(input);

      // Update execution record
      agentExecution.status = result.success ? 'completed' : 'failed';
      agentExecution.output = result.success ? JSON.stringify(result.result) : result.error;
      agentExecution.error = result.error;
      agentExecution.duration = Date.now() - startTime;
      agentExecution.tokensUsed = result.tokensUsed;
      agentExecution.completedAt = new Date();

      await this.agentExecutionRepo.save(agentExecution);

      this.logger.log(`Task completed successfully in ${agentExecution.duration}ms`);
      return {
        ...result,
        agentExecutionId: agentExecution.id,
        duration: agentExecution.duration,
      };

    } catch (error) {
      this.logger.error(`Task failed: ${error.message}`, error.stack);
      
      const duration = Date.now() - startTime;
      
      // Update execution record with error
      if (agentExecution) {
        agentExecution.status = 'failed';
        agentExecution.error = error.message;
        agentExecution.duration = duration;
        agentExecution.completedAt = new Date();
        await this.agentExecutionRepo.save(agentExecution);
      }

      return {
        success: false,
        error: error.message,
        duration,
        agentExecutionId: agentExecution?.id,
      };
    }
  }

  async sendMessage(message: AgentMessage): Promise<void> {
    // This will be implemented by WebSocket module
    // For now, just log the message
    this.logger.debug(`Agent message: ${message.type} from ${message.agentName}`);
  }

  getConfig(): AgentConfig {
    return { ...this.config };
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  getLogger(): Logger {
    return this.logger;
  }
}