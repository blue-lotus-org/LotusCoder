import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AgentsService } from '../agents/agents.service';

@Injectable()
export class WebSocketService {
  private readonly logger = new Logger(WebSocketService.name);
  private server: Server;
  private clients: Map<string, Socket> = new Map();

  constructor(private readonly agentsService: AgentsService) {}

  setServer(server: Server) {
    this.server = server;
    this.logger.log('WebSocket server reference set');
  }

  addClient(socket: Socket) {
    this.clients.set(socket.id, socket);
    this.logger.debug(`Added client: ${socket.id} (total: ${this.clients.size})`);
  }

  removeClient(socket: Socket) {
    this.clients.delete(socket.id);
    this.logger.debug(`Removed client: ${socket.id} (total: ${this.clients.size})`);
  }

  async executeAgentTask(payload: {
    agentType: string;
    task: string;
    context?: any;
    projectId?: string;
    taskId?: string;
  }) {
    this.logger.log(`Executing agent task: ${payload.agentType} - ${payload.task}`);

    try {
      const result = await this.agentsService.executeAgentTask(
        payload.agentType,
        payload.task,
        payload.context,
        payload.projectId,
        payload.taskId,
      );

      return result;
    } catch (error) {
      this.logger.error(`Agent task failed: ${error.message}`);
      throw error;
    }
  }

  async getAgentStatus() {
    try {
      return await this.agentsService.getAgentStatus();
    } catch (error) {
      this.logger.error(`Failed to get agent status: ${error.message}`);
      return {};
    }
  }

  broadcastToProject(projectId: string, event: string, data: any) {
    if (this.server) {
      this.server.to(`project:${projectId}`).emit(event, data);
      this.logger.debug(`Broadcast to project ${projectId}: ${event}`);
    } else {
      this.logger.warn('WebSocket server not available for broadcasting');
    }
  }

  broadcastToAll(event: string, data: any) {
    if (this.server) {
      this.server.emit(event, data);
      this.logger.debug(`Broadcast to all clients: ${event}`);
    } else {
      this.logger.warn('WebSocket server not available for broadcasting');
    }
  }

  sendToClient(socketId: string, event: string, data: any) {
    const socket = this.clients.get(socketId);
    if (socket) {
      socket.emit(event, data);
      this.logger.debug(`Sent to client ${socketId}: ${event}`);
    } else {
      this.logger.warn(`Client ${socketId} not found`);
    }
  }

  async broadcastAgentProgress(
    projectId: string,
    agentType: string,
    progress: {
      stage: string;
      message: string;
      percentage?: number;
      data?: any;
    },
  ) {
    const payload = {
      agentType,
      ...progress,
      timestamp: new Date().toISOString(),
    };

    this.broadcastToProject(projectId, 'agent_progress', payload);
    this.logger.log(`Broadcasted agent progress: ${agentType} - ${progress.stage}`);
  }

  async broadcastAgentResult(
    projectId: string,
    agentType: string,
    result: any,
  ) {
    const payload = {
      agentType,
      result,
      timestamp: new Date().toISOString(),
    };

    this.broadcastToProject(projectId, 'agent_result', payload);
    this.logger.log(`Broadcasted agent result: ${agentType}`);
  }

  async broadcastCodeGeneration(
    projectId: string,
    files: Array<{
      name: string;
      path: string;
      language: string;
      content: string;
    }>,
    summary: string,
  ) {
    const payload = {
      files,
      summary,
      timestamp: new Date().toISOString(),
    };

    this.broadcastToProject(projectId, 'code_generated', payload);
    this.logger.log(`Broadcasted code generation for project ${projectId}`);
  }

  async broadcastError(
    projectId: string,
    error: {
      message: string;
      agentType?: string;
      task?: string;
      stack?: string;
    },
  ) {
    const payload = {
      ...error,
      timestamp: new Date().toISOString(),
    };

    this.broadcastToProject(projectId, 'error', payload);
    this.logger.error(`Broadcasted error to project ${projectId}: ${error.message}`);
  }

  async broadcastSystemStatus(status: any) {
    const payload = {
      status,
      timestamp: new Date().toISOString(),
    };

    this.broadcastToAll('system_status', payload);
    this.logger.log('Broadcasted system status to all clients');
  }

  getClientCount(): number {
    return this.clients.size;
  }

  getConnectedClients(): string[] {
    return Array.from(this.clients.keys());
  }

  isClientConnected(socketId: string): boolean {
    return this.clients.has(socketId);
  }

  async cleanup() {
    this.clients.clear();
    this.logger.log('WebSocket service cleaned up');
  }
}