import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AgentsService } from './agents.service';
import { IsString, IsOptional, IsObject, IsArray, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

class ExecuteTaskDto {
  @IsString()
  agentType: string;

  @IsString()
  task: string;

  @IsOptional()
  @IsObject()
  context?: any;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  taskId?: string;
}

class ExecuteTasksDto {
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  agentTypes: string[];

  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  tasks: string[];

  @IsOptional()
  @IsObject()
  context?: any;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  taskId?: string;
}

class WorkflowStepDto {
  @IsString()
  agentType: string;

  @IsString()
  task: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dependencies?: string[];

  @IsOptional()
  @IsString()
  condition?: string;
}

class ExecuteWorkflowDto {
  @IsString()
  name: string;

  @IsArray()
  @IsObject({ each: true })
  steps: WorkflowStepDto[];
}

class UpdateAgentConfigDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  metadata?: any;
}

@ApiTags('agents')
@Controller('api/agents')
@ApiBearerAuth()
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all available agents' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of all available agents',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: { type: 'string' },
          enabled: { type: 'boolean' },
          role: { type: 'string' },
          description: { type: 'string' },
        },
      },
    },
  })
  async getAgents() {
    try {
      const agents = await this.agentsService.getAvailableAgents();
      return {
        success: true,
        data: agents,
        count: agents.length,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to get agents: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('status')
  @ApiOperation({ summary: 'Get agent system status' })
  @ApiResponse({ status: 200, description: 'Returns status of all agents' })
  async getAgentStatus() {
    try {
      const status = await this.agentsService.getAgentStatus();
      return {
        success: true,
        data: status,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to get agent status: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':type')
  @ApiOperation({ summary: 'Get specific agent configuration' })
  @ApiResponse({ status: 200, description: 'Returns agent configuration' })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  async getAgent(@Param('type') type: string) {
    try {
      const agent = await this.agentsService.getAgent(type);
      if (!agent) {
        throw new HttpException(`Agent '${type}' not found`, HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: agent,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to get agent: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('execute')
  @ApiOperation({ summary: 'Execute task with specific agent' })
  @ApiResponse({ status: 200, description: 'Task executed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async executeTask(@Body() executeTaskDto: ExecuteTaskDto) {
    try {
      const result = await this.agentsService.executeAgentTask(
        executeTaskDto.agentType,
        executeTaskDto.task,
        executeTaskDto.context,
        executeTaskDto.projectId,
        executeTaskDto.taskId,
      );

      return result;
    } catch (error) {
      throw new HttpException(
        `Failed to execute task: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('execute/batch')
  @ApiOperation({ summary: 'Execute multiple tasks in parallel' })
  @ApiResponse({ status: 200, description: 'Tasks executed successfully' })
  async executeTasks(@Body() executeTasksDto: ExecuteTasksDto) {
    try {
      const requests = executeTasksDto.agentTypes.map((agentType, index) => ({
        agentType,
        task: executeTasksDto.tasks[index],
        context: executeTasksDto.context,
        projectId: executeTasksDto.projectId,
        taskId: executeTasksDto.taskId,
      }));

      const results = await this.agentsService.executeMultipleTasks(requests);

      return {
        success: true,
        data: results,
        totalTasks: requests.length,
        successfulTasks: results.filter(r => r.result.success).length,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to execute tasks: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('workflow/execute')
  @ApiOperation({ summary: 'Execute a workflow with multiple agents' })
  @ApiResponse({ status: 200, description: 'Workflow executed successfully' })
  async executeWorkflow(@Body() executeWorkflowDto: ExecuteWorkflowDto) {
    try {
      const result = await this.agentsService.executeWorkflow(executeWorkflowDto);

      return result;
    } catch (error) {
      throw new HttpException(
        `Failed to execute workflow: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get agent performance metrics' })
  @ApiQuery({ name: 'agentType', required: false, description: 'Specific agent type' })
  @ApiResponse({ status: 200, description: 'Returns performance metrics' })
  async getMetrics(@Query('agentType') agentType?: string) {
    try {
      const metrics = await this.agentsService.getAgentMetrics(agentType);

      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to get metrics: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':type/reset')
  @ApiOperation({ summary: 'Reset specific agent' })
  @ApiResponse({ status: 200, description: 'Agent reset successfully' })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  async resetAgent(@Param('type') type: string) {
    try {
      const result = await this.agentsService.resetAgent(type);

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to reset agent: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':type/optimize')
  @ApiOperation({ summary: 'Optimize agent performance' })
  @ApiResponse({ status: 200, description: 'Agent optimization completed' })
  async optimizeAgent(@Param('type') type: string) {
    try {
      const result = await this.agentsService.optimizeAgentPerformance(type);

      return result;
    } catch (error) {
      throw new HttpException(
        `Failed to optimize agent: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':type/config')
  @ApiOperation({ summary: 'Update agent configuration' })
  @ApiResponse({ status: 200, description: 'Configuration updated successfully' })
  async updateAgentConfig(
    @Param('type') type: string,
    @Body() configDto: UpdateAgentConfigDto,
  ) {
    try {
      const result = await this.agentsService.updateAgentConfig(type, configDto);

      return result;
    } catch (error) {
      throw new HttpException(
        `Failed to update agent config: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':type/health')
  @ApiOperation({ summary: 'Get agent health status' })
  @ApiResponse({ status: 200, description: 'Returns agent health information' })
  async getAgentHealth(@Param('type') type: string) {
    try {
      // In a real implementation, this would check the actual health of the agent
      const health = {
        agentType: type,
        status: 'healthy',
        uptime: '99.8%',
        responseTime: '245ms',
        lastCheck: new Date().toISOString(),
        checks: {
          database: 'healthy',
          queue: 'healthy',
          aiProvider: 'healthy',
          memory: 'healthy',
        },
      };

      return {
        success: true,
        data: health,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to get agent health: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}