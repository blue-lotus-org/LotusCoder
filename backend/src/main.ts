import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true,
    },
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('AI Coding App API')
    .setDescription('AI-powered coding assistant with multi-agent system')
    .setVersion('1.0')
    .addTag('agents', 'Multi-agent system endpoints')
    .addTag('projects', 'Project management')
    .addTag('ai', 'AI provider integration')
    .addTag('preview', 'Live preview system')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 3001);
  const host = configService.get<string>('app.host', 'localhost');

  await app.listen(port, host);
  
  console.log(`🚀 AI Coding App Backend running at http://${host}:${port}`);
  console.log(`📚 API Documentation available at http://${host}:${port}/api/docs`);
  console.log(`🔧 Environment: ${configService.get<string>('app.environment', 'development')}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start the application:', error);
  process.exit(1);
});