# LotusAGI Plugins - Plugin System Documentation

## Overview

LotusAGI features a comprehensive plugin ecosystem that extends its AI-powered coding capabilities. Each plugin provides specialized functionality to enhance your development workflow.

## Available Plugins

### 1. Web Search Plugin
**Purpose**: Search the web for documentation, code examples, and technical information.

**Capabilities**:
- `search` - General web search
- `search_code` - Search for code examples
- `search_docs` - Search for documentation

**API Usage**:
```bash
GET /plugins/web-search/search?q=react hooks&limit=5
```

**Configuration**:
```yaml
web_search:
  default_provider: "google"
  rate_limit: 10
  timeout: 10000
```

### 2. Web Scraper Plugin
**Purpose**: Extract content from websites and documentation pages.

**Capabilities**:
- `scrape` - Extract webpage content
- `extract_text` - Get clean text content
- `extract_code` - Extract code blocks
- `get_metadata` - Get page metadata

**API Usage**:
```bash
POST /plugins/web-scraper/scrape
{
  "url": "https://developer.mozilla.org",
  "selector": "main"
}
```

**Configuration**:
```yaml
web_scraper:
  allowed_domains:
    - "*.github.com"
    - "*.stackoverflow.com"
    - "*.mdn.mozilla.org"
    - "*.reactjs.org"
```

### 3. Language References Plugin
**Purpose**: Access documentation and syntax references for programming languages.

**Capabilities**:
- `get_syntax` - Get syntax reference for a language
- `get_examples` - Get code examples
- `search` - Search language references
- `get_best_practices` - Get best practices for a language

**Supported Languages**:
JavaScript, TypeScript, Python, Rust, Go, Java, C++, C#, PHP, Ruby, Kotlin, Swift, Scala, Dart, Elixir, Clojure

**API Usage**:
```bash
GET /plugins/language-references/javascript?topic=functions
```

**Configuration**:
```yaml
language_references:
  languages:
    - "javascript"
    - "typescript"
    - "python"
    - "rust"
    - "go"
  auto_update: true
```

### 4. Package Manager Plugin
**Purpose**: Search and install packages from various package managers.

**Capabilities**:
- `search` - Search packages
- `get_info` - Get detailed package information
- `get_popular` - Get popular packages

**Supported Managers**:
npm, yarn, pnpm, pip, cargo, go, maven, gradle, composer, bundler

**API Usage**:
```bash
GET /plugins/package-manager/npm/search?q=express&limit=5
```

**Configuration**:
```yaml
package_manager:
  managers:
    - "npm"
    - "pip"
    - "cargo"
  search_apis:
    npm: "https://registry.npmjs.org"
    pypi: "https://pypi.org/pypi"
    cargo: "https://crates.io/api/v1"
```

### 5. Git Integration Plugin
**Purpose**: Git operations and repository management.

**Capabilities**:
- `init` - Initialize repository
- `add` - Stage files
- `commit` - Commit changes
- `status` - Get repository status
- `branch` - Create branches
- `merge` - Merge branches

**API Usage**:
```bash
POST /plugins/git-integration/commit
{
  "repository_path": "./project",
  "message": "feat: add new feature"
}
```

**Configuration**:
```yaml
git_integration:
  default_branch: "main"
  auto_commit: false
  commit_message_template: "feat: {description}"
```

### 6. Code Formatter Plugin
**Purpose**: Format code according to language standards.

**Capabilities**:
- `format` - Format code
- `validate` - Validate code formatting
- `get_rules` - Get formatting rules
- `auto_format_file` - Auto-format files

**Supported Formatters**:
Prettier (JS/TS), Black (Python), rustfmt (Rust), gofmt (Go)

**API Usage**:
```bash
POST /plugins/code-formatter/format
{
  "code": "const x=1;console.log(x);",
  "language": "javascript"
}
```

**Configuration**:
```yaml
code_formatter:
  formatters:
    javascript: "prettier"
    python: "black"
    rust: "rustfmt"
    go: "gofmt"
```

### 7. Documentation Generator Plugin
**Purpose**: Generate documentation from code and comments.

**Capabilities**:
- `generate` - Generate comprehensive documentation
- `generate_api` - Generate API documentation
- `generate_readme` - Generate README file
- `extract_comments` - Extract code comments
- `export` - Export documentation in various formats

**Supported Formats**:
Javadoc, JSDoc, RustDoc, GoDoc, Sphinx, Markdown, HTML

**API Usage**:
```bash
POST /plugins/documentation-generator/generate
{
  "source_files": ["src/main.js", "src/utils.js"],
  "format": "jsdoc"
}
```

**Configuration**:
```yaml
documentation_generator:
  formats:
    - "javadoc"
    - "jsdoc"
    - "rustdoc"
    - "godoc"
    - "sphinx"
  auto_detect: true
```

## Plugin Management

### Listing Available Plugins
```bash
GET /plugins
```

### Enable/Disable Plugins
```bash
POST /plugins/web-search/enable
POST /plugins/web-scraper/disable
```

### Execute Plugin Actions
```bash
POST /plugins/{pluginName}/execute
{
  "action": "search",
  "params": {
    "query": "react hooks",
    "limit": 10
  }
}
```

## Plugin Development

### Creating Custom Plugins

1. **Create Plugin Directory**:
   ```
   backend/src/modules/plugins/my-custom-plugin/
   ```

2. **Implement Plugin Interface**:
   ```typescript
   import { Plugin } from '../interfaces/plugin.interface';
   
   @Injectable()
   export class MyCustomPlugin implements Plugin {
     readonly name = 'my_custom_plugin';
     readonly version = '1.0.0';
     readonly description = 'My custom plugin description';
     readonly author = 'Your Name';
     enabled = true;
     
     async initialize(): Promise<void> {
       // Plugin initialization logic
     }
     
     async execute(action: string, params: Record<string, any>): Promise<any> {
       // Plugin execution logic
     }
     
     // ... implement other required methods
   }
   ```

3. **Register Plugin**:
   - Add to `PluginModule` in `plugin.module.ts`
   - Update `shared/config.yaml` with plugin configuration

### Plugin Architecture

Each plugin must implement the `Plugin` interface:

```typescript
interface Plugin {
  // Metadata
  name: string;
  version: string;
  description: string;
  author: string;
  enabled: boolean;
  
  // Lifecycle
  initialize(): Promise<void>;
  activate(): Promise<void>;
  deactivate(): Promise<void>;
  dispose(): Promise<void>;
  
  // Capabilities
  getCapabilities(): string[];
  getDependencies(): string[];
  
  // Configuration
  getDefaultConfig(): Record<string, any>;
  updateConfig(config: Record<string, any>): Promise<void>;
  
  // Execution
  execute(action: string, params: Record<string, any>): Promise<any>;
  validate(params: Record<string, any>): boolean;
}
```

### Plugin Configuration

Plugins are configured in `shared/config.yaml`:

```yaml
plugins:
  enabled: true
  auto_load: true
  plugin_dir: "./plugins"
  
  available:
    my_plugin:
      name: "My Plugin"
      description: "Plugin description"
      version: "1.0.0"
      enabled: true
      author: "Your Name"
      config:
        # Plugin-specific configuration
        option1: value1
        option2: value2
```

## Error Handling

All plugin operations return a standardized result format:

```typescript
{
  "success": true,
  "data": any,           // Plugin result data
  "error": string,       // Error message (if success: false)
  "metadata": {
    "executionTime": number,
    "plugin": string,
    "action": string
  }
}
```

## Performance Considerations

1. **Rate Limiting**: Many plugins include rate limiting to prevent API abuse
2. **Caching**: Plugin results can be cached for improved performance
3. **Parallel Execution**: Multiple plugin requests can run in parallel
4. **Resource Management**: Plugins should clean up resources properly

## Security

1. **Domain Restrictions**: Web scraper only allows whitelisted domains
2. **Input Validation**: All plugin parameters are validated
3. **Sandboxing**: Plugin execution is isolated
4. **Permission System**: Plugin access can be controlled per user

## Troubleshooting

### Common Issues

**Plugin Not Found**:
```bash
# Check if plugin is registered
GET /plugins/{pluginName}

# Enable plugin if disabled
POST /plugins/{pluginName}/enable
```

**Plugin Execution Failed**:
```bash
# Check plugin status
GET /plugins
GET /plugins/active

# Check logs in backend console
```

**Plugin Configuration Issues**:
- Verify plugin configuration in `shared/config.yaml`
- Ensure all required config values are provided
- Check environment variables for API keys

## Plugin API Reference

For complete API documentation, visit `/plugins/docs` when the backend is running.

---

## Support

For plugin development questions or issues:
1. Check the logs for detailed error messages
2. Verify plugin configuration
3. Test individual plugin actions
4. Review plugin interface requirements

**Plugin Development Best Practices**:
- Always implement proper error handling
- Provide meaningful error messages
- Include comprehensive logging
- Document plugin configuration options
- Test plugin with various input parameters
- Clean up resources in `dispose()` method