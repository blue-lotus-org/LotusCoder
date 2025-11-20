import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

// Import custom modules
import { AgentsModule } from './modules/agents/agents.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { AiModule } from './modules/ai/ai.module';
import { PreviewModule } from './modules/preview/preview.module';
import { SettingsModule } from './modules/settings/settings.module';
import { WebSocketModule } from './modules/websocket/websocket.module';

// Import entities
import { Project } from './database/entities/project.entity';
import { Task } from './database/entities/task.entity';
import { AgentExecution } from './database/entities/agent-execution.entity';
import { Setting } from './database/entities/setting.entity';

// Import configuration
import configuration from './config/configuration';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [Project, Task, AgentExecution, Setting],
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging'),
      }),
      inject: [ConfigService],
    }),

    // Redis for task queue
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          password: configService.get('redis.password'),
          db: configService.get('redis.db'),
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: configService.get('agents.retry_attempts'),
        },
      }),
      inject: [ConfigService],
    }),

    // Application modules
    AgentsModule,
    ProjectsModule,
    AiModule,
    PreviewModule,
    SettingsModule,
    WebSocketModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}