import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Plugin, LanguageReference } from '../interfaces/plugin.interface';

@Injectable()
export class LanguageReferencesPlugin implements Plugin {
  readonly name = 'language_references';
  readonly version = '1.0.0';
  readonly description = 'Programming Language References - Access documentation and syntax references';
  readonly author = 'LotusAGI Team';
  enabled = true;

  private readonly logger = new Logger(LanguageReferencesPlugin.name);
  private config: any = {};
  private readonly languageData = new Map<string, LanguageReference>();

  constructor(private readonly configService: ConfigService) {}

  async initialize(): Promise<void> {
    this.config = this.configService.get('plugins.available.language_references.config') || {};
    await this.loadLanguageData();
    this.logger.log('Language References Plugin initialized');
  }

  async activate(): Promise<void> {
    this.logger.log('Language References Plugin activated');
  }

  async deactivate(): Promise<void> {
    this.logger.log('Language References Plugin deactivated');
  }

  async dispose(): Promise<void> {
    this.logger.log('Language References Plugin disposed');
  }

  getCapabilities(): string[] {
    return [
      'get_syntax_reference',
      'get_examples',
      'get_documentation',
      'search_language',
      'get_best_practices',
      'get_common_patterns'
    ];
  }

  getDependencies(): string[] {
    return [];
  }

  getDefaultConfig(): Record<string, any> {
    return {
      languages: [
        'javascript', 'typescript', 'python', 'rust', 'go', 'java', 'c++', 'c#',
        'php', 'ruby', 'kotlin', 'swift', 'scala', 'dart', 'elixir', 'clojure'
      ],
      auto_update: true,
      update_frequency: 'daily',
    };
  }

  async updateConfig(config: Record<string, any>): Promise<void> {
    this.config = { ...this.config, ...config };
  }

  validate(params: Record<string, any>): boolean {
    const required = ['language'];
    return required.every(key => params[key] !== undefined && params[key] !== '');
  }

  async execute(action: string, params: Record<string, any>): Promise<any> {
    switch (action) {
      case 'get_syntax':
        return this.getSyntaxReference(params.language, params.topic);
      case 'get_examples':
        return this.getExamples(params.language, params.topic);
      case 'search':
        return this.searchLanguage(params.query, params.language);
      case 'get_documentation':
        return this.getDocumentation(params.language, params.topic);
      case 'get_best_practices':
        return this.getBestPractices(params.language);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async loadLanguageData(): Promise<void> {
    // Initialize language reference data
    const languages = this.config.languages || [];
    
    for (const lang of languages) {
      const reference = this.generateLanguageReference(lang);
      this.languageData.set(lang, reference);
    }
  }

  private generateLanguageReference(language: string): LanguageReference {
    // Generate mock language reference data
    // In a real implementation, this would load from a database or API
    
    const references: Record<string, LanguageReference> = {
      javascript: {
        language: 'javascript',
        syntax: 'JavaScript',
        description: 'JavaScript is a high-level, interpreted programming language',
        examples: [
          'const name = "John";',
          'function greet(name) { return `Hello, ${name}!`; }',
          'const numbers = [1, 2, 3, 4, 5];',
          'numbers.map(n => n * 2).filter(n => n > 5);'
        ],
        documentation: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        lastUpdated: new Date().toISOString(),
      },
      typescript: {
        language: 'typescript',
        syntax: 'TypeScript',
        description: 'TypeScript is a strongly typed programming language that builds on JavaScript',
        examples: [
          'interface User { name: string; age: number; }',
          'const user: User = { name: "John", age: 30 };',
          'function greet(user: User): string { return `Hello, ${user.name}!`; }',
          'type Status = "active" | "inactive" | "pending";'
        ],
        documentation: 'https://www.typescriptlang.org/docs/',
        lastUpdated: new Date().toISOString(),
      },
      python: {
        language: 'python',
        syntax: 'Python',
        description: 'Python is an interpreted, high-level programming language',
        examples: [
          'def greet(name: str) -> str:',
          '    return f"Hello, {name}!"',
          '',
          'class Person:',
          '    def __init__(self, name: str):',
          '        self.name = name',
          '',
          '    def greet(self) -> str:',
          '        return greet(self.name)'
        ],
        documentation: 'https://docs.python.org/3/',
        lastUpdated: new Date().toISOString(),
      },
      rust: {
        language: 'rust',
        syntax: 'Rust',
        description: 'Rust is a systems programming language focused on safety and performance',
        examples: [
          'fn greet(name: &str) -> String {',
          '    format!("Hello, {}!", name)',
          '}',
          '',
          'struct Person {',
          '    name: String,',
          '    age: u32,',
          '}',
          '',
          'impl Person {',
          '    fn new(name: String, age: u32) -> Person {',
          '        Person { name, age }',
          '    }',
          '}'
        ],
        documentation: 'https://doc.rust-lang.org/',
        lastUpdated: new Date().toISOString(),
      },
      go: {
        language: 'go',
        syntax: 'Go',
        description: 'Go is a statically typed, compiled programming language designed at Google',
        examples: [
          'package main',
          '',
          'import "fmt"',
          '',
          'type Person struct {',
          '    Name string',
          '    Age  int',
          '}',
          '',
          'func (p Person) Greet() string {',
          '    return fmt.Sprintf("Hello, %s!", p.Name)',
          '}',
          '',
          'func main() {',
          '    person := Person{Name: "John", Age: 30}',
          '    fmt.Println(person.Greet())',
          '}'
        ],
        documentation: 'https://golang.org/doc/',
        lastUpdated: new Date().toISOString(),
      },
    };

    return references[language] || {
      language,
      syntax: language.charAt(0).toUpperCase() + language.slice(1),
      description: `${language.charAt(0).toUpperCase() + language.slice(1)} is a programming language`,
      examples: [`// ${language} code example`],
      documentation: `https://www.${language}.org/docs/`,
      lastUpdated: new Date().toISOString(),
    };
  }

  private async getSyntaxReference(language: string, topic?: string): Promise<LanguageReference> {
    try {
      const reference = this.languageData.get(language.toLowerCase());
      if (!reference) {
        throw new Error(`Language not found: ${language}`);
      }

      this.logger.debug(`Syntax reference retrieved for ${language}`);
      return reference;
    } catch (error) {
      this.logger.error(`Failed to get syntax reference for ${language}:`, error);
      throw error;
    }
  }

  private async getExamples(language: string, topic?: string): Promise<string[]> {
    try {
      const reference = await this.getSyntaxReference(language);
      
      // Filter examples based on topic if provided
      let examples = reference.examples;
      
      if (topic) {
        // In a real implementation, this would filter examples by topic
        // For now, we'll return all examples
      }

      this.logger.debug(`Examples retrieved for ${language}, topic: ${topic || 'all'}`);
      return examples;
    } catch (error) {
      this.logger.error(`Failed to get examples for ${language}:`, error);
      throw error;
    }
  }

  private async searchLanguage(query: string, language?: string): Promise<LanguageReference[]> {
    try {
      let references = Array.from(this.languageData.values());
      
      if (language) {
        references = references.filter(ref => 
          ref.language.toLowerCase().includes(language.toLowerCase())
        );
      }

      // Filter by query (simple case-insensitive search)
      if (query) {
        references = references.filter(ref => 
          ref.description.toLowerCase().includes(query.toLowerCase()) ||
          ref.syntax.toLowerCase().includes(query.toLowerCase())
        );
      }

      this.logger.debug(`Search completed for query: ${query}, language: ${language}`);
      return references;
    } catch (error) {
      this.logger.error(`Language search failed:`, error);
      throw error;
    }
  }

  private async getDocumentation(language: string, topic?: string): Promise<string> {
    try {
      const reference = await this.getSyntaxReference(language);
      
      // In a real implementation, this would fetch actual documentation content
      // For now, we'll return the documentation URL
      
      let documentation = reference.documentation;
      if (topic) {
        documentation += `#${topic.replace(/\s+/g, '-').toLowerCase()}`;
      }

      this.logger.debug(`Documentation URL retrieved for ${language}`);
      return documentation;
    } catch (error) {
      this.logger.error(`Failed to get documentation for ${language}:`, error);
      throw error;
    }
  }

  private async getBestPractices(language: string): Promise<string[]> {
    try {
      const reference = await this.getSyntaxReference(language);
      
      // Generate best practices based on language
      const bestPractices: Record<string, string[]> = {
        javascript: [
          'Use const and let instead of var',
          'Always use strict equality (===) and strict inequality (!==)',
          'Use meaningful variable names',
          'Write self-documenting code',
          'Use async/await for asynchronous operations',
        ],
        typescript: [
          'Use strict type checking',
          'Leverage interfaces for type definitions',
          'Use union and intersection types wisely',
          'Prefer readonly over const for arrays',
          'Use generics for reusable code',
        ],
        python: [
          'Follow PEP 8 style guide',
          'Use type hints',
          'Write docstrings for functions and classes',
          'Use virtual environments',
          'Leverage list comprehensions',
        ],
        rust: [
          'Embrace the ownership model',
          'Use pattern matching effectively',
          'Leverage the type system',
          'Write comprehensive tests',
          'Use cargo for project management',
        ],
      };

      const practices = bestPractices[language.toLowerCase()] || [
        'Follow language-specific conventions',
        'Write clean, readable code',
        'Use appropriate data structures',
        'Implement error handling',
        'Write tests for your code',
      ];

      this.logger.debug(`Best practices retrieved for ${language}`);
      return practices;
    } catch (error) {
      this.logger.error(`Failed to get best practices for ${language}:`, error);
      throw error;
    }
  }
}