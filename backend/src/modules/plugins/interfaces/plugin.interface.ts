export interface Plugin {
  name: string;
  version: string;
  description: string;
  author: string;
  enabled: boolean;
  
  // Plugin lifecycle
  initialize(): Promise<void>;
  activate(): Promise<void>;
  deactivate(): Promise<void>;
  dispose(): Promise<void>;
  
  // Plugin capabilities
  getCapabilities(): string[];
  getDependencies(): string[];
  
  // Plugin configuration
  getDefaultConfig(): Record<string, any>;
  updateConfig(config: Record<string, any>): Promise<void>;
  
  // Plugin execution
  execute(action: string, params: Record<string, any>): Promise<any>;
  validate(params: Record<string, any>): boolean;
}

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  capabilities: string[];
  dependencies: string[];
  config: Record<string, any>;
  enabled: boolean;
}

export interface PluginExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    executionTime: number;
    plugin: string;
    action: string;
  };
}

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  relevanceScore: number;
  lastModified?: string;
}

export interface WebScrapingResult {
  content: string;
  url: string;
  title?: string;
  extractionTime: number;
  contentType: string;
}

export interface LanguageReference {
  language: string;
  syntax: string;
  description: string;
  examples: string[];
  documentation: string;
  lastUpdated: string;
}

export interface PackageInfo {
  name: string;
  version: string;
  description: string;
  repository?: string;
  homepage?: string;
  downloads: number;
  dependencies: string[];
  devDependencies?: string[];
}

export interface CodeFormatResult {
  formattedCode: string;
  originalCode: string;
  changes: string[];
  formatTime: number;
  formatter: string;
}

export interface DocumentationSection {
  name: string;
  content: string;
  code?: string;
  examples?: string[];
}

export interface GeneratedDocumentation {
  title: string;
  sections: DocumentationSection[];
  format: 'javadoc' | 'jsdoc' | 'rustdoc' | 'godoc' | 'sphinx';
  generatedAt: string;
  sourceFiles: string[];
}