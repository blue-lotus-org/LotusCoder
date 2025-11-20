import * as yaml from 'yaml';
import * as fs from 'fs';
import * as path from 'path';

export interface AppConfig {
  app: {
    name: string;
    version: string;
    description: string;
    port: number;
    host: string;
    environment: string;
  };
  ai: {
    providers: {
      openai: {
        api_key: string;
        model: string;
        max_tokens: number;
        temperature: number;
        enabled: boolean;
      };
      claude: {
        api_key: string;
        model: string;
        max_tokens: number;
        temperature: number;
        enabled: boolean;
      };
      local: {
        model_path: string;
        enabled: boolean;
      };
    };
    agents: {
      [key: string]: {
        primary_provider: string;
        secondary_provider?: string;
        temperature: number;
        max_tokens: number;
      };
    };
  };
  agents: {
    enabled: boolean;
    max_concurrent: number;
    retry_attempts: number;
    timeout_ms: number;
    queue_bull: boolean;
    worker_threads: boolean;
    [key: string]: any;
  };
  frontend: {
    port: number;
    hot_reload: boolean;
    live_preview: boolean;
    browser_output: boolean;
  };
  live_preview: {
    enabled: boolean;
    auto_refresh: boolean;
    refresh_delay: number;
    iframe_sandbox: boolean;
    cors_enabled: boolean;
  };
  database: {
    type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    synchronize: boolean;
    logging: boolean;
  };
  redis: {
    host: string;
    port: number;
    password: string;
    db: number;
    key_prefix: string;
  };
}

export default function loadConfig(): AppConfig {
  try {
    // Try to load YAML config first
    const configPath = path.resolve(__dirname, '../../shared/config.yaml');
    
    if (fs.existsSync(configPath)) {
      const configFile = fs.readFileSync(configPath, 'utf8');
      const config = yaml.parse(configFile);
      
      // Process environment variables
      return processEnvironmentVariables(config);
    }
    
    throw new Error('Configuration file not found');
  } catch (error) {
    console.error('Failed to load configuration:', error);
    // Return default configuration
    return getDefaultConfig();
  }
}

function processEnvironmentVariables(config: any): any {
  const processValue = (value: any): any => {
    if (typeof value === 'string') {
      // Handle environment variable references like ${VAR_NAME}
      const envVarMatch = value.match(/\$\{([^}]+)\}/);
      if (envVarMatch) {
        const envVarName = envVarMatch[1];
        return process.env[envVarName] || value;
      }
    } else if (Array.isArray(value)) {
      return value.map(processValue);
    } else if (typeof value === 'object' && value !== null) {
      const processed: any = {};
      for (const [key, val] of Object.entries(value)) {
        processed[key] = processValue(val);
      }
      return processed;
    }
    return value;
  };

  return processValue(config);
}

function getDefaultConfig(): AppConfig {
  return {
    app: {
      name: 'AI Coding App',
      version: '1.0.0',
      description: 'AI-powered coding assistant with multi-agent system',
      port: 3001,
      host: 'localhost',
      environment: 'development',
    },
    ai: {
      providers: {
        openai: {
          api_key: process.env.OPENAI_API_KEY || '',
          model: 'gpt-4',
          max_tokens: 4000,
          temperature: 0.7,
          enabled: true,
        },
        claude: {
          api_key: process.env.CLAUDE_API_KEY || '',
          model: 'claude-3-sonnet-20240229',
          max_tokens: 4000,
          temperature: 0.7,
          enabled: false,
        },
        local: {
          model_path: './models/local-model',
          enabled: false,
        },
      },
      agents: {
        manager: {
          primary_provider: 'openai',
          secondary_provider: 'claude',
          temperature: 0.3,
          max_tokens: 2000,
        },
        planning: {
          primary_provider: 'openai',
          temperature: 0.5,
          max_tokens: 3000,
        },
        code_generation: {
          primary_provider: 'openai',
          temperature: 0.2,
          max_tokens: 4000,
        },
        review: {
          primary_provider: 'claude',
          temperature: 0.4,
          max_tokens: 3000,
        },
        testing: {
          primary_provider: 'openai',
          temperature: 0.1,
          max_tokens: 2000,
        },
      },
    },
    agents: {
      enabled: true,
      max_concurrent: 5,
      retry_attempts: 3,
      timeout_ms: 300000,
      queue_bull: true,
      worker_threads: true,
    },
    frontend: {
      port: 3000,
      hot_reload: true,
      live_preview: true,
      browser_output: true,
    },
    live_preview: {
      enabled: true,
      auto_refresh: true,
      refresh_delay: 1000,
      iframe_sandbox: true,
      cors_enabled: true,
    },
    database: {
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'ai_coding_app',
      password: process.env.DB_PASSWORD || '',
      database: 'ai_coding_app',
      synchronize: true,
      logging: true,
    },
    redis: {
      host: 'localhost',
      port: 6379,
      password: '',
      db: 0,
      key_prefix: 'ai_coding_app:',
    },
  };
}