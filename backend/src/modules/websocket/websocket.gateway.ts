import {
  WebSocketGateway as WSGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WebSocketService } from './websocket.service';

@WSGateway({
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/',
})
export class WebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketGateway.name);

  constructor(private readonly wsService: WebSocketService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
    this.wsService.setServer(server);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.wsService.addClient(client);
    
    // Send initial status
    client.emit('agent_status', {
      timestamp: new Date().toISOString(),
      message: 'Connected to AI Coding App WebSocket',
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.wsService.removeClient(client);
  }

  @SubscribeMessage('join_project')
  handleJoinProject(client: Socket, payload: { projectId: string }) {
    this.logger.log(`Client ${client.id} joining project: ${payload.projectId}`);
    client.join(`project:${payload.projectId}`);
    
    client.emit('project_joined', {
      projectId: payload.projectId,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('leave_project')
  handleLeaveProject(client: Socket, payload: { projectId: string }) {
    this.logger.log(`Client ${client.id} leaving project: ${payload.projectId}`);
    client.leave(`project:${payload.projectId}`);
  }

  @SubscribeMessage('agent_task_request')
  handleAgentTaskRequest(
    client: Socket,
    payload: {
      agentType: string;
      task: string;
      context?: any;
      projectId?: string;
      taskId?: string;
    },
  ) {
    this.logger.log(
      `Agent task request from ${client.id}: ${payload.agentType} - ${payload.task}`,
    );
    
    // Emit task started event
    this.server.to(`project:${payload.projectId || 'global'}`).emit('task_started', {
      agentType: payload.agentType,
      task: payload.task,
      taskId: payload.taskId,
      timestamp: new Date().toISOString(),
    });

    // Process the task through the WebSocket service
    this.wsService.executeAgentTask(payload).then((result) => {
      // Emit task completed event
      this.server.to(`project:${payload.projectId || 'global'}`).emit('task_completed', {
        agentType: payload.agentType,
        task: payload.task,
        result,
        timestamp: new Date().toISOString(),
      });
    }).catch((error) => {
      // Emit task failed event
      this.server.to(`project:${payload.projectId || 'global'}`).emit('task_failed', {
        agentType: payload.agentType,
        task: payload.task,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    });
  }

  @SubscribeMessage('code_update')
  handleCodeUpdate(
    client: Socket,
    payload: {
      projectId: string;
      filePath: string;
      content: string;
      language: string;
    },
  ) {
    this.logger.log(`Code update from ${client.id}: ${payload.filePath}`);
    
    // Broadcast code update to other clients in the project
    client.to(`project:${payload.projectId}`).emit('code_updated', {
      filePath: payload.filePath,
      content: payload.content,
      language: payload.language,
      updatedBy: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('live_preview_update')
  handleLivePreviewUpdate(
    client: Socket,
    payload: {
      projectId: string;
      html: string;
      css: string;
      js: string;
    },
  ) {
    this.logger.log(`Live preview update from ${client.id}`);
    
    // Broadcast preview update to other clients in the project
    client.to(`project:${payload.projectId}`).emit('preview_updated', {
      html: payload.html,
      css: payload.css,
      js: payload.js,
      updatedBy: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('request_agent_status')
  handleRequestAgentStatus(client: Socket) {
    this.logger.log(`Agent status requested by ${client.id}`);
    this.wsService.getAgentStatus().then((status) => {
      client.emit('agent_status', {
        status,
        timestamp: new Date().toISOString(),
      });
    });
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket) {
    client.emit('pong', {
      timestamp: new Date().toISOString(),
    });
  }
}