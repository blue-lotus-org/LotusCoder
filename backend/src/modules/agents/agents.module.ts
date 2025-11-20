import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { AgentRegistry } from './agent.registry';

import { AgentExecution } from '../../database/entities/agent-execution.entity';

import { ManagerAgent } from './implementations/manager-agent';
import { PlanningAgent } from './implementations/planning-agent';
import { CodeGenerationAgent } from './implementations/code-generation-agent';
import { ReviewAgent } from './implementations/review-agent';
import { TestingAgent } from './implementations/testing-agent';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentExecution]),
    BullModule.registerQueue({
      name: 'agent-execution',
    }),
  ],
  controllers: [AgentsController],
  providers: [
    AgentsService,
    AgentRegistry,
    ManagerAgent,
    PlanningAgent,
    CodeGenerationAgent,
    ReviewAgent,
    TestingAgent,
  ],
  exports: [AgentsService, AgentRegistry],
})
export class AgentsModule {}