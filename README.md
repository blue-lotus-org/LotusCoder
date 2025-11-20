# LotusAGI - AI-Powered Coding Assistant

A sophisticated AI-powered coding assistant with multi-agent system, plugin ecosystem, and real-time collaboration features. Built with React + NestJS and designed to rival commercial solutions like Bolt/Lovable with advanced agent orchestration.

## 🚀 Features

### Core Features
- **Multi-Agent System** - Parallel AI agents working together
- **Plugin Ecosystem** - Extensible plugins for web search, scraping, language references
- **Live Preview** - Real-time code compilation and preview
- **Resizable UI** - Fully customizable workspace layout
- **YAML/JSON Settings** - Flexible configuration management
- **WebSocket Communication** - Real-time updates and collaboration
- **GPU Acceleration** - CUDA/OpenCL support for enhanced performance

### Available Plugins
- **Web Search Plugin** - Search the web for documentation and examples
- **Web Scraper Plugin** - Extract content from websites and documentation
- **Language References Plugin** - Access syntax references for 15+ programming languages
- **Package Manager Plugin** - Search and install packages from npm, PyPI, Cargo, etc.
- **Git Integration Plugin** - Git operations and repository management
- **Code Formatter Plugin** - Format code according to language standards
- **Documentation Generator Plugin** - Generate documentation from code and comments
### AI Agents
- **Manager Agent** - Central coordinator managing other agents
- **Planning Agent** - Breaks down tasks into subtasks
- **Code Generation Agent** - Generates frontend and backend code
- **Review Agent** - Reviews code for quality and security
- **Testing Agent** - Creates and runs comprehensive tests

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Monaco Editor
- **Backend**: NestJS + TypeORM + PostgreSQL + Redis + WebSocket
- **AI Integration**: OpenAI GPT-4, Anthropic Claude, Custom Providers
- **Real-time**: Socket.io for live updates
- **Task Queue**: Bull/Redis for agent coordination
- **Plugin System**: Extensible architecture with 7 built-in plugins
- **Performance**: GPU acceleration with CUDA/OpenCL support

## 📁 Project Structure

```
lotusagi/
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── modules/
│   │   │   ├── agents/     # Multi-agent system
│   │   │   ├── plugins/    # Plugin ecosystem
│   │   │   ├── projects/   # Project management
│   │   │   ├── websocket/  # Real-time communication
│   │   │   ├── settings/   # Configuration management
│   │   │   ├── ai/         # AI provider integration
│   │   │   └── preview/    # Live preview system
│   │   ├── database/       # TypeORM entities
│   │   └── config/         # Configuration management
│   └── shared/            # Shared configuration
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── stores/        # Zustand state management
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils/         # Utility functions
│   └── public/           # Static assets
└── shared/               # Shared configuration files
```

## 🛠️ Installation & Setup

### Quick Installation (Recommended)

Use our automated installer for the fastest setup:

```bash
# Download and run the installer
chmod +x install.sh
./install.sh

# Or with options:
./install.sh --enable-gpu    # Include GPU configuration
./install.sh --skip-deps     # Skip system dependencies
./install.sh --no-start      # Don't start services after install
```

The installer will:
- ✅ Check system requirements
- ✅ Install dependencies automatically
- ✅ Set up database services
- ✅ Create environment configuration
- ✅ Configure GPU acceleration (optional)
- ✅ Start the application

### Manual Installation

#### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Redis 6+
- npm or yarn
- Git (optional, for git integration plugin)

### 4. Install Dependencies

```bash
# Install all dependencies (root, frontend, backend)
npm run dev:install

# Or install manually:
npm install
cd frontend && npm install && cd ../backend && npm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb lotusagi

# Start Redis (optional, for queue management)
redis-server
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Set your API keys and database credentials
```

### 5. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start individually:
# Backend (http://localhost:3001)
npm run dev:backend

# Frontend (http://localhost:3000)
npm run dev:frontend
```

## 🔧 Quick Start Guide

1. **Access the Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/docs

2. **Configure AI Providers**:
   - Edit `~/.lotusagi/.env` with your API keys
   - Configure custom AI providers in `shared/config.yaml`
   - See [Developer Guide](DEVELOPER_GUIDE.md) for detailed setup

3. **Try the Plugins**:
   - Web Search: Search for documentation and examples
   - Language References: Get syntax help for 15+ languages
   - Package Manager: Search npm, PyPI, Cargo packages
   - Code Formatter: Format code with Prettier, Black, etc.

4. **Use AI Agents**:
   - Create a new project
   - Use Planning Agent to break down tasks
   - Generate code with Code Generation Agent
   - Review with Review Agent
   - Test with Testing Agent

## ⚙️ Configuration

### AI Provider Setup

Edit `shared/config.yaml` or use environment variables:

```yaml
ai:
  providers:
    openai:
      api_key: "${OPENAI_API_KEY}"  # Set in .env
      model: "gpt-4"
      enabled: true
    claude:
      api_key: "${CLAUDE_API_KEY}"  # Set in .env
      model: "claude-3-sonnet-20240229"
      enabled: false  # Enable if you have Claude API access
```

### Agent Configuration

```yaml
agents:
  enabled: true
  max_concurrent: 5
  retry_attempts: 3
  timeout_ms: 300000  # 5 minutes
```

### Database Configuration

```yaml
database:
  type: "postgresql"
  host: "localhost"
  port: 5432
  username: "ai_coding_app"
  password: "${DB_PASSWORD}"
  database: "ai_coding_app"
```

## 🤖 Multi-Agent System

### Agent Architecture

The system uses a catalyst-based manager agent that orchestrates specialized agents:

1. **Manager Agent** - Central coordinator and workflow orchestrator
2. **Planning Agent** - Task breakdown and project planning
3. **Code Generation Agent** - Frontend/backend code creation
4. **Review Agent** - Code quality and security analysis
5. **Testing Agent** - Test creation and execution

### Agent Communication

Agents communicate through:
- **WebSocket** - Real-time status updates
- **Task Queue** - Bull/Redis for job management
- **Database** - Persistent execution history

### Example Usage

```typescript
// Execute task with specific agent
const result = await agentRegistry.executeTask(
  'code_generation',
  'Create a React button component',
  { context: 'user interface' },
  projectId
);

// Execute workflow with multiple agents
await agentRegistry.orchestrateWorkflow({
  name: 'Full-Stack Development',
  steps: [
    { agentType: 'planning', task: 'Analyze requirements' },
    { agentType: 'code_generation', task: 'Generate frontend', dependencies: ['planning'] },
    { agentType: 'code_generation', task: 'Generate backend', dependencies: ['planning'] },
    { agentType: 'review', task: 'Review code', dependencies: ['frontend', 'backend'] }
  ]
});
```

## 🎨 UI Components

### Resizable Layout
- **Split Panes** - Editor, Preview, Chat, File Tree
- **Draggable** - Customizable workspace
- **Responsive** - Mobile-friendly design
- **Dark Theme** - Professional coding environment

### Code Editor
- **Monaco Editor** - Full VS Code editor experience
- **Syntax Highlighting** - 50+ languages supported
- **Auto-completion** - IntelliSense and suggestions
- **Error Detection** - Real-time syntax checking

### Live Preview
- **Real-time Updates** - Instant compilation feedback
- **Multi-language Support** - HTML, CSS, JS, TS, React
- **Sandboxed Execution** - Safe code execution
- **Error Overlay** - Compilation error display

## 🔧 API Endpoints

### Agent Management
```
GET    /api/agents           # List all agents
GET    /api/agents/status    # Agent system status
POST   /api/agents/execute   # Execute agent task
POST   /api/agents/workflow  # Execute workflow
```

### Project Management
```
GET    /api/projects         # List all projects
GET    /api/projects/:id     # Get project details
POST   /api/projects         # Create new project
PUT    /api/projects/:id     # Update project
DELETE /api/projects/:id     # Delete project
```

### Settings
```
GET    /api/settings         # Get all settings
GET    /api/settings/:key    # Get specific setting
PUT    /api/settings/:key    # Update setting
```

### WebSocket Events
```javascript
// Agent task execution
socket.emit('agent_task_request', {
  agentType: 'code_generation',
  task: 'Create React component',
  projectId: 'project123'
});

// Real-time code updates
socket.emit('code_update', {
  projectId: 'project123',
  filePath: 'src/App.tsx',
  content: 'new code here',
  language: 'typescript'
});
```

## 📊 Features in Detail

### Live Preview System
- **Auto-refresh** - Configurable delay (100ms - 5000ms)
- **Compilation** - Real-time error detection
- **Safe Execution** - Sandboxed environment
- **Multi-format** - HTML, CSS, JS, TS, React

### Task Management
- **Parallel Execution** - Multiple agents working simultaneously
- **Progress Tracking** - Real-time task status updates
- **Error Handling** - Automatic retry with exponential backoff
- **Queue Management** - Bull/Redis job queue system

### Code Quality
- **Automated Review** - AI-powered code analysis
- **Security Scanning** - Vulnerability detection
- **Performance Analysis** - Optimization suggestions
- **Best Practices** - Industry standard compliance

### Testing Integration
- **Unit Tests** - Automated test generation
- **Integration Tests** - MSW for API mocking
- **E2E Tests** - Playwright for full workflows
- **Coverage Reports** - Comprehensive testing metrics

## 🔒 Security Features

### Code Security
- **Input Validation** - All user inputs sanitized
- **XSS Protection** - Content Security Policy enabled
- **Safe Preview** - Sandboxed execution environment
- **API Key Protection** - Environment variable storage

### Data Protection
- **Encrypted Storage** - Sensitive data encryption
- **Access Control** - Role-based permissions
- **Audit Logging** - Complete action tracking
- **GDPR Compliance** - Data privacy standards

## 📈 Performance Optimization

### Frontend Optimization
- **Code Splitting** - Lazy loading for better performance
- **Bundle Analysis** - Webpack bundle optimization
- **Caching Strategy** - Service worker implementation
- **Image Optimization** - WebP format support

### Backend Optimization
- **Connection Pooling** - Database connection optimization
- **Query Optimization** - Efficient database queries
- **Caching Layer** - Redis for frequently accessed data
- **Worker Threads** - CPU-intensive task distribution

## 🧪 Testing

### Test Types
- **Unit Tests** - Jest + React Testing Library
- **Integration Tests** - API endpoint testing
- **E2E Tests** - Playwright for full workflows
- **Load Testing** - Artillery for performance testing

### Coverage Targets
- **Statements** - 90%+
- **Branches** - 85%+
- **Functions** - 90%+
- **Lines** - 90%+

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run start
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Environment Variables
Required for production:
- `OPENAI_API_KEY` - OpenAI API key
- `CLAUDE_API_KEY` - Claude API key (optional)
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - JWT signing secret

## 📚 Documentation

### API Documentation
- **Swagger UI** - Available at `http://localhost:3001/api/docs`
- **Postman Collection** - Import provided collection
- **OpenAPI Spec** - Complete API specification

### Architecture Docs
- **System Design** - High-level architecture overview
- **Agent Documentation** - Detailed agent implementation
- **Plugin System** - Complete plugin development guide
- **Database Schema** - Entity relationship diagrams
- **Deployment Guide** - Production deployment instructions

### Plugin Documentation
- **[PLUGINS.md](PLUGINS.md)** - Comprehensive plugin system documentation
- **Plugin API Reference** - HTTP endpoints and usage examples
- **Plugin Development Guide** - Create custom plugins
- **Plugin Configuration** - Configure existing plugins
- **Plugin Best Practices** - Development guidelines

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** Pull Request

### Code Standards
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **Husky** - Git hooks for quality gates
- **Conventional Commits** - Standardized commit messages

### Agent Development
- **Extend Base Agent** - Implement new agent types
- **Plugin System** - Add custom agent plugins
- **API Integration** - Connect new AI providers
- **Testing Framework** - Comprehensive agent testing

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** - GPT-4 API integration
- **Anthropic** - Claude API integration
- **Monaco Editor** - VS Code editor experience
- **NestJS** - Scalable backend architecture
- **React** - Frontend framework
- **Socket.io** - Real-time communication

## 📞 Support

### Getting Help
- **Documentation** - Comprehensive guides and API reference
- **Issues** - GitHub issues for bugs and feature requests
- **Discussions** - GitHub discussions for questions
- **Discord** - Community chat and support

### Common Issues

**Q: WebSocket connection failed**
A: Ensure backend is running on port 3001 and CORS origins are configured

**Q: AI agents not responding**
A: Check API keys in `.env` file and ensure OpenAI API quota is available

**Q: Database connection error**
A: Verify PostgreSQL is running and connection credentials are correct

**Q: Live preview not updating**
A: Check browser console for errors and ensure auto-refresh is enabled in settings

**Q: Plugin execution failed**
A: Verify plugin is enabled in settings and check plugin-specific configuration

**Q: Web search returning no results**
A: Ensure search API key is configured and rate limits are not exceeded

---

**🎆 LotusAGI - Where AI meets coding excellence!**