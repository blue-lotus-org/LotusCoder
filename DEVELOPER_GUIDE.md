# AI Coding App - Developer Guide

## Table of Contents
1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Installation & Setup](#installation--setup)
4. [Configuration](#configuration)
5. [AI Provider Setup](#ai-provider-setup)
6. [GPU Configuration](#gpu-configuration)
7. [Development Workflow](#development-workflow)
8. [API Documentation](#api-documentation)
9. [Agent System](#agent-system)
10. [Performance Optimization](#performance-optimization)
11. [Troubleshooting](#troubleshooting)
12. [Contributing](#contributing)

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 13+
- Redis 6+
- GPU drivers (optional, for acceleration)

### 1. Clone and Install
```bash
# Clone the repository
git clone <your-repo-url>
cd ai-coding-app

# Install dependencies for all packages
npm install

# Install root dependencies
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your API keys and database settings
nano .env
```

### 3. Database Setup
```bash
# Start PostgreSQL and Redis
# Using Docker:
docker-compose up -d

# Or manually start services
sudo systemctl start postgresql
sudo systemctl start redis
```

### 4. Start Development Servers
```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run dev:backend  # Port 3001
npm run dev:frontend # Port 3000
```

### 5. Verify Installation
- Backend API: http://localhost:3001
- Frontend App: http://localhost:3000
- API Documentation: http://localhost:3001/docs

## Architecture Overview

### System Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   External      │
│   (React)       │◄──►│   (NestJS)      │◄──►│   Services      │
│   Port: 3000    │    │   Port: 3001    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌────────┴────────┐             │
         │              │                 │             │
         ▼              ▼                 ▼             ▼
┌─────────────────┐  ┌──────────────┐  ┌──────────────┐
│   WebSocket     │  │ PostgreSQL   │  │ Redis Queue  │
│   Real-time     │  │  Database    │  │  Bull Queue  │
└─────────────────┘  └──────────────┘  └──────────────┘
```

### Multi-Agent Architecture
```
ManagerAgent (Coordinator)
├── PlanningAgent (Task Breakdown)
├── CodeGenerationAgent (Code Creation)
├── ReviewAgent (Quality Assurance)
├── TestingAgent (Test Generation)
└── DeploymentAgent (Build & Deploy)
```

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Monaco Editor
- **Backend**: NestJS, TypeScript, TypeORM, PostgreSQL
- **Real-time**: Socket.io (WebSockets)
- **Queue**: Bull Queue with Redis
- **State Management**: Zustand
- **Build Tools**: Vite, SWC
- **Database**: PostgreSQL with TypeORM
- **Caching**: Redis
- **AI Integration**: OpenAI-compatible API structure

## Installation & Setup

### System Requirements
- **Minimum**: 4GB RAM, 2 CPU cores
- **Recommended**: 16GB RAM, 8 CPU cores, GPU with 8GB+ VRAM
- **Operating System**: Linux (Ubuntu 20.04+), macOS 10.15+, Windows 10+

### Dependencies Installation

#### 1. Install Node.js and npm
```bash
# Using NodeSource (recommended)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be 18+
npm --version   # Should be 8+
```

#### 2. Install Database Services
```bash
# PostgreSQL
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Redis
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis

# Create database
sudo -u postgres createdb ai_coding_app
sudo -u postgres psql -c "CREATE USER ai_coding_app WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ai_coding_app TO ai_coding_app;"
```

#### 3. Install GPU Drivers (Optional)
```bash
# NVIDIA GPU (for CUDA support)
sudo apt install nvidia-driver-535  # Adjust version for your GPU
nvidia-smi  # Verify installation

# Or use Docker with GPU support
sudo docker run --rm --gpus all nvidia/cuda:11.8-base-ubuntu20.04 nvidia-smi
```

#### 4. Python Dependencies (for AI providers)
```bash
# Required for some AI client libraries
pip3 install torch transformers accelerate  # PyTorch for local models
pip3 install openai anthropic  # Official API clients
```

### Project Setup

#### 1. Install Dependencies
```bash
# Root workspace
npm install

# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

#### 2. Database Migration
```bash
cd backend
npm run build
npm run start:dev  # This will auto-sync database schema
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Core Application
NODE_ENV=development
PORT=3001
CORS_ORIGINS=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ai_coding_app
DB_USER=ai_coding_app
DB_PASSWORD=your_secure_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# AI Providers (Required)
OPENAI_API_KEY=sk-your_openai_key_here
CLAUDE_API_KEY=your_claude_key_here

# Performance
GPU_ENABLED=true
GPU_THREADS=4
GPU_MEMORY_FRACTION=0.8
```

### Configuration File Structure

The application uses a YAML configuration file at `shared/config.yaml`:

```yaml
# Main sections:
app:          # Application settings
ai:           # AI provider configurations
agents:       # Multi-agent system settings
frontend:     # Frontend configuration
database:     # Database settings
redis:        # Redis configuration
performance:  # Performance tuning
security:     # Security settings
```

## AI Provider Setup

### Supported Providers

#### 1. OpenAI
```yaml
openai:
  api_key: "${OPENAI_API_KEY}"
  api_endpoint: "https://api.openai.com/v1"
  model: "gpt-4"
  enabled: true
```

#### 2. Anthropic Claude
```yaml
claude:
  api_key: "${CLAUDE_API_KEY}"
  api_endpoint: "https://api.anthropic.com"
  model: "claude-3-sonnet-20240229"
  enabled: true
```

#### 3. Custom OpenAI-Compatible Providers

**Together AI:**
```yaml
custom_1:
  name: "Together AI"
  api_key: "${CUSTOM_1_API_KEY}"
  api_endpoint: "https://api.together.xyz/v1"
  model: "meta-llama/Llama-2-70b-chat-hf"
  enabled: true
```

**OpenRouter:**
```yaml
custom_2:
  name: "OpenRouter"
  api_key: "${CUSTOM_2_API_KEY}"
  api_endpoint: "https://openrouter.ai/api/v1"
  model: "mistralai/Mixtral-8x7B-Instruct-v0.1"
  enabled: true
```

**Ollama (Local):**
```yaml
ollama:
  api_key: ""  # Empty for local
  api_endpoint: "http://localhost:11434/v1"
  model: "llama2:70b"
  enabled: false  # Enable when Ollama is running
```

### Adding New Providers

1. **Update Configuration**: Add provider to `shared/config.yaml`
2. **Environment Variables**: Add API keys to `.env`
3. **Code Integration**: Extend `AIProviderService` in backend
4. **Test Provider**: Add integration tests

Example custom provider:
```typescript
// backend/src/modules/ai/providers/custom-provider.ts
export class CustomProvider implements AIProvider {
  async generate(request: AIRequest): Promise<AIResponse> {
    const response = await this.client.chat.completions.create({
      model: this.config.model,
      messages: request.messages,
      headers: this.config.headers,
      ...this.config
    });
    return this.transformResponse(response);
  }
}
```

## GPU Configuration

### CUDA Setup (NVIDIA)

#### 1. Install CUDA Toolkit
```bash
# Download and install CUDA 12.0
wget https://developer.download.nvidia.com/compute/cuda/12.0.0/local_installers/cuda_12.0.0_525.60.13_linux.run
sudo sh cuda_12.0.0_525.60.13_linux.run

# Add to PATH
echo 'export PATH=/usr/local/cuda/bin:$PATH' >> ~/.bashrc
echo 'export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH' >> ~/.bashrc
source ~/.bashrc
```

#### 2. Configure GPU in App
```yaml
performance:
  gpu_enabled: true
  gpu_threads: 4
  gpu_memory_fraction: 0.8
  cuda_enabled: true
  
gpu:
  enabled: true
  threads: 4
  memory_fraction: 0.8
  device_id: 0
  allow_memory_growth: true
```

### AMD GPU Setup (ROCm)

#### 1. Install ROCm
```bash
# Add ROCm repository
wget -qO - https://repo.radeon.com/rocm/rocm.gpg.key | sudo apt-key add -
echo 'deb [arch=amd64] https://repo.radeon.com/rocm/apt/5.7 ubuntu main' | sudo tee /etc/apt/sources.list.d/rocm.list

# Install ROCm
sudo apt update
sudo apt install rocm-dev rocminfo rocm-libs

# Add user to video group
sudo usermod -a -G video,render $USER
```

#### 2. Configure for ROCm
```yaml
performance:
  gpu_enabled: true
  opencl_enabled: true
  gpu_vendor: "amd"
  
cuda_enabled: false
```

### Intel GPU Setup

```yaml
performance:
  gpu_enabled: true
  opencl_enabled: true
  gpu_vendor: "intel"
```

### GPU Monitoring

Add monitoring to your application:

```typescript
// Check GPU status
import { nvidiaSmi } from 'nvidia-smi';

const gpuStatus = await nvidiaSmi({
  gpuId: 0,
  queryGpuMemoryUsage: true,
  queryGpuUtilization: true,
});

console.log('GPU Memory:', gpuStatus.memory.used / 1024, 'MB');
console.log('GPU Utilization:', gpuStatus.utilization.gpu, '%');
```

## Development Workflow

### 1. Starting Development

```bash
# Start all services
npm run dev

# Or start individually
npm run dev:backend
npm run dev:frontend
```

### 2. Hot Reloading

- **Backend**: Auto-restart on file changes
- **Frontend**: HMR (Hot Module Replacement)
- **Database**: Auto-sync schema changes

### 3. Code Structure

```
backend/
├── src/
│   ├── modules/
│   │   ├── agents/          # Multi-agent system
│   │   ├── ai/             # AI provider integrations
│   │   ├── database/       # Database entities
│   │   ├── websocket/      # Real-time communication
│   │   └── ...
│   ├── config/             # Configuration management
│   └── main.ts             # Application entry

frontend/
├── src/
│   ├── components/         # React components
│   ├── stores/            # Zustand stores
│   ├── pages/             # Route components
│   ├── hooks/             # Custom hooks
│   └── services/          # API services
```

### 4. Adding New Features

#### Backend Module
```bash
cd backend
nest g module feature-name
nest g service feature-name
nest g controller feature-name
```

#### Frontend Component
```bash
cd frontend
mkdir src/components/FeatureName
# Create TSX files
```

### 5. Testing

```bash
# Backend tests
cd backend
npm run test
npm run test:watch
npm run test:e2e

# Frontend tests
cd frontend
npm run test
npm run test:coverage
```

## API Documentation

### REST Endpoints

#### Projects
- `GET /projects` - List all projects
- `POST /projects` - Create new project
- `GET /projects/:id` - Get project details
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

#### Agents
- `GET /agents` - List all agents
- `POST /agents/execute` - Execute agent task
- `GET /agents/status/:taskId` - Get task status

#### AI
- `POST /ai/chat` - Send chat message
- `POST /ai/generate-code` - Generate code
- `POST /ai/review-code` - Review code

#### Settings
- `GET /settings` - Get all settings
- `PUT /settings` - Update settings
- `POST /settings/reload` - Reload configuration

### WebSocket Events

#### Client → Server
- `join_project` - Join project room
- `agent_execute` - Execute agent task
- `file_change` - File content changed

#### Server → Client
- `agent_status` - Agent execution status
- `task_progress` - Task progress update
- `file_update` - File content update
- `error` - Error notifications

### API Usage Examples

#### Chat with AI
```typescript
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Create a React component',
    provider: 'openai',
    context: { projectId: '123' }
  })
});
```

#### Execute Agent Task
```typescript
const task = await fetch('/api/agents/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agentType: 'code_generation',
    task: 'Generate authentication component',
    parameters: { framework: 'react', type: 'login' }
  })
});
```

## Agent System

### Available Agents

#### 1. ManagerAgent
- **Role**: Central coordinator
- **Responsibilities**: 
  - Task distribution
  - Agent orchestration
  - Workflow management
  - Error handling

#### 2. PlanningAgent
- **Role**: Task breakdown
- **Responsibilities**:
  - Analyze requirements
  - Create task hierarchies
  - Estimate complexity
  - Generate TODO lists

#### 3. CodeGenerationAgent
- **Role**: Code creation
- **Responsibilities**:
  - Generate frontend code
  - Generate backend code
  - File creation and management
  - Code templates

#### 4. ReviewAgent
- **Role**: Quality assurance
- **Responsibilities**:
  - Code review
  - Security analysis
  - Performance optimization
  - Best practices enforcement

#### 5. TestingAgent
- **Role**: Test generation
- **Responsibilities**:
  - Unit test creation
  - Integration tests
  - E2E test scenarios
  - Test execution

### Creating Custom Agents

#### 1. Define Agent Interface
```typescript
export interface CustomAgent extends Agent {
  readonly capabilities: string[];
  readonly supportedLanguages: string[];
  
  execute(request: AgentRequest): Promise<AgentResponse>;
  validate(input: any): boolean;
}
```

#### 2. Implement Agent Class
```typescript
@Injectable()
export class CustomAgent implements Agent {
  readonly name = 'CustomAgent';
  readonly role = 'custom_role';
  readonly capabilities = ['coding', 'review'];
  
  async execute(request: AgentRequest): Promise<AgentResponse> {
    // Implementation
  }
  
  validate(input: any): boolean {
    // Validation logic
  }
}
```

#### 3. Register Agent
```typescript
// In agent.registry.ts
registerAgent('custom_agent', CustomAgent);
```

### Agent Communication

Agents communicate through:
- **Message Passing**: Direct agent-to-agent
- **Event Bus**: Pub/sub pattern
- **Shared State**: Centralized state management
- **Queue System**: Asynchronous task processing

## Performance Optimization

### Backend Optimization

#### 1. Database Optimization
```sql
-- Add indexes for common queries
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_agent_executions_agent_type ON agent_executions(agent_type);

-- Optimize connection pool
-- In TypeORM config:
synchronize: true,
logging: false, // Disable in production
cache: {
  type: 'redis',
  options: { host: 'localhost', port: 6379 }
}
```

#### 2. Caching Strategy
```typescript
// Redis caching for AI responses
@Cacheable('ai-responses', 300) // 5 minutes
async generateResponse(prompt: string): Promise<string> {
  // AI generation logic
}

// LRU cache for frequent operations
const lruCache = new LRUCache<string, any>({
  max: 100,
  ttl: 1000 * 60 * 5 // 5 minutes
});
```

#### 3. Connection Pooling
```typescript
// PostgreSQL connection pool
TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  // Connection pool settings
  extra: {
    max: 20, // Maximum connections
    min: 5,  // Minimum connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }
})
```

### Frontend Optimization

#### 1. Code Splitting
```typescript
// Lazy load routes
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProjectEditor = lazy(() => import('./pages/ProjectEditor'));

// Dynamic imports
const loadMonaco = async () => {
  const monaco = await import('monaco-editor');
  return monaco;
};
```

#### 2. State Management
```typescript
// Optimize Zustand stores
const useAgentStore = create<AgentState>((set, get) => ({
  // Use selectors to avoid re-renders
  agents: {},
  getAgent: (id) => get().agents[id],
  
  // Batch updates
  updateAgents: (updates) => set((state) => ({
    agents: { ...state.agents, ...updates }
  }))
}));
```

#### 3. Component Optimization
```typescript
// Memoize expensive components
const CodeEditor = memo(({ content, onChange }) => {
  const editorRef = useRef(null);
  
  // Memoize configuration
  const editorOptions = useMemo(() => ({
    minimap: { enabled: false },
    fontSize: 14,
    wordWrap: 'on'
  }), []);
  
  return <MonacoEditor /* ... */ />;
});
```

### GPU Optimization

#### 1. Memory Management
```typescript
// Configure GPU memory allocation
const gpuConfig = {
  memory_fraction: 0.8,  // Use 80% of GPU memory
  allow_memory_growth: true,  // Allow dynamic allocation
  device_id: 0,  // Use first GPU
  visible_devices: [0]  // Make only one GPU visible
};

// Monitor GPU memory usage
setInterval(() => {
  const memoryInfo = tf.memory();
  console.log('GPU Memory:', memoryInfo.numBytes / 1024 / 1024, 'MB');
}, 10000);
```

#### 2. Batch Processing
```typescript
// Process multiple requests in batches
const batchProcess = async (requests: AIRequest[]) => {
  const batchSize = 4;  // Adjust based on GPU memory
  const results = [];
  
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(req => processRequest(req))
    );
    results.push(...batchResults);
  }
  
  return results;
};
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U ai_coding_app -d ai_coding_app

# Check logs
sudo tail -f /var/log/postgresql/postgresql-13-main.log
```

**Solutions:**
- Verify database credentials in `.env`
- Check PostgreSQL configuration
- Ensure database exists
- Verify connection limits

#### 2. Redis Connection Issues
```bash
# Check Redis status
redis-cli ping

# Check Redis logs
sudo journalctl -u redis-server

# Test connection
redis-cli -h localhost -p 6379
```

#### 3. GPU Issues
```bash
# Check GPU availability
nvidia-smi
# or
rocm-smi  # For AMD

# Verify CUDA installation
nvcc --version

# Check GPU memory
nvidia-smi -q -d memory
```

**Common Solutions:**
- Install correct GPU drivers
- Enable GPU in Docker containers
- Adjust GPU memory settings
- Check for conflicts with other processes

#### 4. AI Provider Issues

**OpenAI Rate Limits:**
```typescript
// Implement retry with exponential backoff
const retryWithBackoff = async (fn: Function, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        continue;
      }
      throw error;
    }
  }
};
```

**Custom Provider Connectivity:**
```typescript
// Test provider connectivity
const testProvider = async (config: ProviderConfig) => {
  try {
    const response = await fetch(`${config.api_endpoint}/models`, {
      headers: { 'Authorization': `Bearer ${config.api_key}` }
    });
    return response.ok;
  } catch (error) {
    console.error('Provider connection failed:', error);
    return false;
  }
};
```

#### 5. Build Issues

**Backend Build:**
```bash
# Clean and rebuild
cd backend
rm -rf dist
npm run build

# Check TypeScript errors
npx tsc --noEmit

# Check dependencies
npm audit
```

**Frontend Build:**
```bash
cd frontend
rm -rf dist node_modules
npm install
npm run build

# Check for import errors
npm run type-check
```

### Debug Mode

Enable debug logging:
```bash
# Backend debug
DEBUG=ai-coding-app:* npm run start:dev

# Frontend debug
REACT_APP_DEBUG=true npm start
```

### Performance Monitoring

#### 1. Database Query Monitoring
```typescript
// Enable query logging in development
TypeOrmModule.forRoot({
  logging: ['query', 'error'],
  logger: 'advanced-console'
});
```

#### 2. Memory Usage Monitoring
```typescript
// Monitor memory usage
setInterval(() => {
  const usage = process.memoryUsage();
  console.log('Memory Usage:', {
    rss: Math.round(usage.rss / 1024 / 1024) + 'MB',
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + 'MB',
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB'
  });
}, 30000);
```

#### 3. API Response Time Monitoring
```typescript
// Middleware for response time tracking
@UseInterceptors(Middleware, (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${duration}ms`);
  });
  next();
})
```

## Contributing

### Development Guidelines

#### 1. Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for code formatting
- Write unit tests for new features

#### 2. Git Workflow
```bash
# Feature development
git checkout -b feature/your-feature-name
git commit -m "feat: add new feature"
git push origin feature/your-feature-name

# Create pull request
# After review and approval, merge to main
```

#### 3. Testing Requirements
```bash
# Backend testing
npm run test:cov      # Coverage report
npm run test:e2e      # End-to-end tests

# Frontend testing  
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

#### 4. Documentation Standards
- Update README for major changes
- Document new API endpoints
- Add JSDoc comments for functions
- Update this developer guide

### Release Process

#### 1. Version Management
```bash
# Update version
npm version patch|minor|major

# Update CHANGELOG.md
git add -A
git commit -m "chore: release v1.2.3"
git tag v1.2.3
git push origin v1.2.3
```

#### 2. Deployment
```bash
# Build for production
npm run build:prod

# Run tests
npm run test:prod

# Deploy (example with PM2)
pm2 start ecosystem.config.js
```

### Getting Help

#### 1. Documentation
- API Documentation: http://localhost:3001/docs
- Configuration Guide: See `shared/config.yaml`
- Architecture Overview: This document

#### 2. Community
- GitHub Issues: Report bugs and feature requests
- GitHub Discussions: Ask questions and share ideas
- Discord/Slack: Real-time chat (if available)

#### 3. Professional Support
For enterprise support, commercial licensing, or custom development:
- Contact: [---]
- Website: [https://lotuschain.org]

---

## Appendix

### A. Environment Variables Reference
Complete list of all environment variables with descriptions.

### B. API Endpoints Reference
Complete REST API documentation with examples.

### C. Configuration File Reference
Detailed explanation of all configuration options.

### D. Troubleshooting Quick Reference
Common error messages and solutions.

### E. Performance Benchmarks
Expected performance metrics for different configurations.

---

*This developer guide is maintained as part of the project. Please update it when making significant changes to the codebase.*
