import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Plugin, DocumentationSection, GeneratedDocumentation } from '../interfaces/plugin.interface';

@Injectable()
export class DocumentationGeneratorPlugin implements Plugin {
  readonly name = 'documentation_generator';
  readonly version = '1.0.0';
  readonly description = 'Documentation Generator Plugin - Generate documentation from code and comments';
  readonly author = 'LotusAGI Team';
  enabled = true;

  private readonly logger = new Logger(DocumentationGeneratorPlugin.name);
  private config: any = {};

  constructor(private readonly configService: ConfigService) {}

  async initialize(): Promise<void> {
    this.config = this.configService.get('plugins.available.documentation_generator.config') || {};
    this.logger.log('Documentation Generator Plugin initialized');
  }

  async activate(): Promise<void> {
    this.logger.log('Documentation Generator Plugin activated');
  }

  async deactivate(): Promise<void> {
    this.logger.log('Documentation Generator Plugin deactivated');
  }

  async dispose(): Promise<void> {
    this.logger.log('Documentation Generator Plugin disposed');
  }

  getCapabilities(): string[] {
    return [
      'generate_api_docs',
      'generate_readme',
      'generate_changelog',
      'extract_comments',
      'generate_inline_docs',
      'export_documentation'
    ];
  }

  getDependencies(): string[] {
    return [];
  }

  getDefaultConfig(): Record<string, any> {
    return {
      formats: ['javadoc', 'jsdoc', 'rustdoc', 'godoc', 'sphinx'],
      auto_detect: true,
      include_examples: true,
      include_dependencies: true,
    };
  }

  async updateConfig(config: Record<string, any>): Promise<void> {
    this.config = { ...this.config, ...config };
  }

  validate(params: Record<string, any>): boolean {
    const required = ['source_files', 'format'];
    return required.every(key => params[key] !== undefined && params[key] !== '');
  }

  async execute(action: string, params: Record<string, any>): Promise<any> {
    switch (action) {
      case 'generate':
        return this.generateDocumentation(params.source_files, params.format, params.options);
      case 'generate_api':
        return this.generateAPIDocumentation(params.code, params.language, params.format);
      case 'generate_readme':
        return this.generateREADME(params.project_info, params.options);
      case 'extract_comments':
        return this.extractComments(params.source_code, params.language);
      case 'export':
        return this.exportDocumentation(params.documentation, params.format, params.output_path);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async generateDocumentation(
    sourceFiles: string[], 
    format: string, 
    options: any = {}
  ): Promise<GeneratedDocumentation> {
    try {
      const startTime = Date.now();
      
      // Auto-detect format if not specified
      const docFormat = options.format || format || this.detectFormat(sourceFiles);
      
      // Generate documentation sections from source files
      const sections = await this.generateSectionsFromFiles(sourceFiles, docFormat, options);
      
      const documentation: GeneratedDocumentation = {
        title: options.title || 'Generated Documentation',
        sections,
        format: docFormat,
        generatedAt: new Date().toISOString(),
        sourceFiles,
      };

      const generationTime = Date.now() - startTime;
      
      this.logger.debug(`Documentation generated in ${generationTime}ms`);
      
      return documentation;
    } catch (error) {
      this.logger.error('Failed to generate documentation:', error);
      throw error;
    }
  }

  private async generateAPIDocumentation(
    code: string, 
    language: string, 
    format: string
  ): Promise<GeneratedDocumentation> {
    try {
      const sections = await this.generateSectionsFromCode(code, language, format);
      
      return {
        title: `${language.charAt(0).toUpperCase() + language.slice(1)} API Documentation`,
        sections,
        format,
        generatedAt: new Date().toISOString(),
        sourceFiles: ['inline_code'],
      };
    } catch (error) {
      this.logger.error('Failed to generate API documentation:', error);
      throw error;
    }
  }

  private async generateREADME(
    projectInfo: any, 
    options: any = {}
  ): Promise<string> {
    try {
      const {
        name,
        description,
        version = '1.0.0',
        author = 'Unknown',
        dependencies = [],
        usage_example = '',
        installation_steps = [],
        features = [],
      } = projectInfo;

      const readme = `# ${name || 'Project'}\n\n` +
        `**Version:** ${version}\n\n` +
        `**Author:** ${author}\n\n` +
        `${description || 'A software project.'}\n\n` +
        
        `## Features\n\n` +
        (features.length > 0 
          ? features.map(f => `- ${f}`).join('\n') + '\n\n'
          : '- Feature 1\n- Feature 2\n\n') +
        
        `## Installation\n\n` +
        (installation_steps.length > 0 
          ? installation_steps.map(step => `1. ${step}`).join('\n') + '\n\n'
          : '1. Clone the repository\n2. Install dependencies\n3. Configure environment\n\n') +
        
        `## Usage\n\n\`\`\`\n${usage_example || '// Usage example here'}\`\`\`\n\n` +
        
        `## Dependencies\n\n` +
        (dependencies.length > 0 
          ? dependencies.map(dep => `- ${dep.name}: ${dep.version || 'latest'}`).join('\n') + '\n\n'
          : '- No external dependencies\n\n') +
        
        `## Contributing\n\n` +
        'Contributions are welcome! Please read the contributing guidelines before submitting pull requests.\n\n' +
        
        `## License\n\n` +
        'This project is licensed under the MIT License.';

      this.logger.debug('README generated successfully');
      
      return readme;
    } catch (error) {
      this.logger.error('Failed to generate README:', error);
      throw error;
    }
  }

  private async extractComments(
    sourceCode: string, 
    language: string
  ): Promise<DocumentationSection[]> {
    try {
      const sections: DocumentationSection[] = [];
      
      // Simple comment extraction based on language
      const comments = this.extractLanguageComments(sourceCode, language);
      
      sections.push({
        name: 'Code Comments',
        content: comments.length > 0 ? comments.join('\n\n') : 'No comments found.',
      });

      return sections;
    } catch (error) {
      this.logger.error('Failed to extract comments:', error);
      throw error;
    }
  }

  private async exportDocumentation(
    documentation: any, 
    format: string, 
    outputPath: string
  ): Promise<any> {
    try {
      // This would export documentation to various formats
      // For now, we'll return the formatted content
      
      let exportedContent = '';
      
      switch (format.toLowerCase()) {
        case 'markdown':
        case 'md':
          exportedContent = this.exportAsMarkdown(documentation);
          break;
        case 'html':
          exportedContent = this.exportAsHTML(documentation);
          break;
        case 'json':
          exportedContent = JSON.stringify(documentation, null, 2);
          break;
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      this.logger.debug(`Documentation exported as ${format}`);
      
      return {
        success: true,
        format,
        content: exportedContent,
        output_path: outputPath,
        size: exportedContent.length,
      };
    } catch (error) {
      this.logger.error('Failed to export documentation:', error);
      throw error;
    }
  }

  private detectFormat(sourceFiles: string[]): string {
    // Auto-detect documentation format based on file types
    const fileExtensions = sourceFiles.map(file => 
      file.split('.').pop()?.toLowerCase() || ''
    );

    if (fileExtensions.some(ext => ['java'].includes(ext))) return 'javadoc';
    if (fileExtensions.some(ext => ['js', 'ts', 'jsx', 'tsx'].includes(ext))) return 'jsdoc';
    if (fileExtensions.some(ext => ['rs'].includes(ext))) return 'rustdoc';
    if (fileExtensions.some(ext => ['go'].includes(ext))) return 'godoc';

    return 'markdown'; // Default
  }

  private async generateSectionsFromFiles(
    sourceFiles: string[], 
    format: string, 
    options: any
  ): Promise<DocumentationSection[]> {
    const sections: DocumentationSection[] = [];

    for (const file of sourceFiles) {
      // In a real implementation, this would read and parse the file
      // For now, we'll generate mock sections
      
      const sectionName = file.split('/').pop() || file;
      
      sections.push({
        name: `${sectionName} Documentation`,
        content: this.generateFileDocumentation(file, format),
        examples: this.generateFileExamples(format),
      });
    }

    return sections;
  }

  private async generateSectionsFromCode(
    code: string, 
    language: string, 
    format: string
  ): Promise<DocumentationSection[]> {
    const sections: DocumentationSection[] = [];

    // Extract functions, classes, and other code elements
    const functions = this.extractFunctions(code, language);
    const classes = this.extractClasses(code, language);

    if (functions.length > 0) {
      sections.push({
        name: 'Functions',
        content: functions.map(f => this.formatFunctionDocumentation(f, format)).join('\n\n'),
        examples: this.generateFunctionExamples(language),
      });
    }

    if (classes.length > 0) {
      sections.push({
        name: 'Classes',
        content: classes.map(c => this.formatClassDocumentation(c, format)).join('\n\n'),
      });
    }

    return sections;
  }

  private generateFileDocumentation(file: string, format: string): string {
    const ext = file.split('.').pop()?.toLowerCase();
    
    switch (format) {
      case 'javadoc':
        return `/**
 * File: ${file}
 * Description: This file contains the main implementation.
 * @author Generated by LotusAGI
 * @version 1.0.0
 */`;
      
      case 'jsdoc':
        return `/**
 * ${file}
 * 
 * This file contains the main implementation.
 * 
 * @author Generated by LotusAGI
 * @version 1.0.0
 * @module ${file}
 */`;
      
      case 'rustdoc':
        return `//! ${file}
//!
//! This file contains the main implementation.
//!
//! # Author
//! Generated by LotusAGI
//!
//! # Version
//! 1.0.0`;
      
      case 'godoc':
        return `// ${file}
//
// This file contains the main implementation.
//
// Author: Generated by LotusAGI
// Version: 1.0.0`;
      
      default:
        return `## ${file}\n\nThis file contains the main implementation.`;
    }
  }

  private generateFileExamples(format: string): string[] {
    const examples: Record<string, string[]> = {
      javadoc: [
        `/**
 * @example
 * <pre>
 * // Example usage
 * SomeClass obj = new SomeClass();
 * obj.method();
 * </pre>
 */`,
      ],
      jsdoc: [
        `/**
 * @example
 * // Example usage
 * const obj = new SomeClass();
 * obj.method();
 */`,
      ],
      rustdoc: [
        `/// Example usage:
        /// 
        /// ```
        /// let obj = SomeClass::new();
        /// obj.method();
        /// ````,
      ],
      godoc: [
        `// Example:
        // 
        //     obj := SomeClass{}
        //     obj.Method()`,
      ],
    };

    return examples[format] || [];
  }

  private extractFunctions(code: string, language: string): any[] {
    // Simple function extraction (would be more sophisticated in real implementation)
    const functionPatterns: Record<string, RegExp[]> = {
      javascript: [
        /function\s+(\w+)\s*\([^)]*\)/g,
        /(\w+)\s*=>\s*{/g,
      ],
      typescript: [
        /function\s+(\w+)\s*\([^)]*\):\s*[^;]+/g,
        /(\w+)\s*:\s*\([^)]*\)\s*=>/g,
      ],
      python: [
        /def\s+(\w+)\s*\([^)]*\):/g,
      ],
      rust: [
        /fn\s+(\w+)\s*\([^)]*\)/g,
      ],
    };

    const functions = [];
    const patterns = functionPatterns[language] || [];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        functions.push({
          name: match[1],
          type: 'function',
          line: this.getLineNumber(code, match.index),
        });
      }
    }

    return functions;
  }

  private extractClasses(code: string, language: string): any[] {
    const classPatterns: Record<string, RegExp> = {
      javascript: /class\s+(\w+)/g,
      typescript: /class\s+(\w+)/g,
      python: /class\s+(\w+)/g,
      java: /class\s+(\w+)/g,
      rust: /struct\s+(\w+)/g,
    };

    const classes = [];
    const pattern = classPatterns[language];
    
    if (pattern) {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        classes.push({
          name: match[1],
          type: language === 'rust' ? 'struct' : 'class',
          line: this.getLineNumber(code, match.index),
        });
      }
    }

    return classes;
  }

  private formatFunctionDocumentation(func: any, format: string): string {
    switch (format) {
      case 'javadoc':
        return `/**
 * Function: ${func.name}
 * Line: ${func.line}
 * Description: This function performs a specific operation.
 * @param parameter1 Type description
 * @return Return type description
 */`;
      
      case 'jsdoc':
        return `/**
 * ${func.name}
 * 
 * This function performs a specific operation.
 * 
 * @param {Type} parameter1 - Description
 * @returns {Type} Description
 */`;
      
      case 'rustdoc':
        return `/// ${func.name}
        ///
        /// This function performs a specific operation.
        ///
        /// # Arguments
        ///
        /// * `parameter1` - Description
        ///
        /// # Returns
        ///
        /// Description of return value`;
      
      case 'godoc':
        return `// ${func.name}
// 
// This function performs a specific operation.
//
// Parameters:
//   parameter1 - Description
//
// Returns:
//   Description of return value`;
      
      default:
        return `## ${func.name}\n\nThis function performs a specific operation.`;
    }
  }

  private formatClassDocumentation(cls: any, format: string): string {
    switch (format) {
      case 'javadoc':
        return `/**
 * Class: ${cls.name}
 * Line: ${cls.line}
 * Description: This ${cls.type} represents a data structure or entity.
 * @author Generated by LotusAGI
 * @version 1.0.0
 */`;
      
      case 'jsdoc':
        return `/**
 * ${cls.name}
 * 
 * This ${cls.type} represents a data structure or entity.
 * 
 * @author Generated by LotusAGI
 * @version 1.0.0
 */`;
      
      case 'rustdoc':
        return `/// ${cls.name}
        ///
        /// This ${cls.type} represents a data structure or entity.
        ///
        /// # Author
        /// Generated by LotusAGI
        ///
        /// # Version
        /// 1.0.0`;
      
      case 'godoc':
        return `// ${cls.name}
//
// This ${cls.type} represents a data structure or entity.
//
// Author: Generated by LotusAGI
// Version: 1.0.0`;
      
      default:
        return `## ${cls.name}\n\nThis ${cls.type} represents a data structure or entity.`;
    }
  }

  private extractLanguageComments(sourceCode: string, language: string): string[] {
    const comments: string[] = [];
    
    // Simple comment extraction
    const patterns: Record<string, RegExp> = {
      javascript: [/\/\*[\s\S]*?\*\//g, /\/\/.*$/gm],
      typescript: [/\/\*[\s\S]*?\*\//g, /\/\/.*$/gm],
      python: [/#.*$/gm],
      java: [/\/\*[\s\S]*?\*\//g, /\/\/.*$/gm, /\/\*\*[\s\S]*?\*\//g],
      rust: [/\/\*[\s\S]*?\*\//g, /\/\/.*$/gm, /\/\/[\s\S]*$/gm],
      go: [/\/\*[\s\S]*?\*\//g, /\/\/.*$/gm],
    };

    const commentPatterns = patterns[language] || [/\/\/.*$/gm];
    
    for (const pattern of commentPatterns) {
      let match;
      while ((match = pattern.exec(sourceCode)) !== null) {
        comments.push(match[0].trim());
      }
    }

    return comments;
  }

  private generateFunctionExamples(language: string): string[] {
    const examples: Record<string, string[]> = {
      javascript: [
        'const result = functionName(parameter);',
        'console.log(result);',
      ],
      typescript: [
        'const result: Type = functionName(parameter);',
        'console.log(result);',
      ],
      python: [
        'result = function_name(parameter)',
        'print(result)',
      ],
      rust: [
        'let result = function_name(parameter);',
        'println!("{:?}", result);',
      ],
      go: [
        'result := FunctionName(parameter)',
        'fmt.Println(result)',
      ],
    };

    return examples[language] || ['// Function example'];
  }

  private getLineNumber(text: string, index: number): number {
    return text.substring(0, index).split('\n').length;
  }

  private exportAsMarkdown(documentation: GeneratedDocumentation): string {
    let markdown = `# ${documentation.title}\n\n`;
    markdown += `Generated on: ${documentation.generatedAt}\n\n`;
    markdown += `Format: ${documentation.format}\n\n`;
    markdown += `Source Files: ${documentation.sourceFiles.join(', ')}\n\n`;
    
    if (documentation.sections) {
      for (const section of documentation.sections) {
        markdown += `## ${section.name}\n\n`;
        markdown += `${section.content}\n\n`;
        
        if (section.examples && section.examples.length > 0) {
          markdown += `### Examples\n\n`;
          for (const example of section.examples) {
            markdown += `${example}\n\n`;
          }
        }
      }
    }

    return markdown;
  }

  private exportAsHTML(documentation: GeneratedDocumentation): string {
    let html = `<!DOCTYPE html>\n`;
    html += `<html lang="en">\n`;
    html += `<head>\n`;
    html += `    <meta charset="UTF-8">\n`;
    html += `    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n`;
    html += `    <title>${documentation.title}</title>\n`;
    html += `    <style>\n`;
    html += `        body { font-family: Arial, sans-serif; margin: 40px; }\n`;
    html += `        h1, h2, h3 { color: #333; }\n`;
    html += `        code { background-color: #f4f4f4; padding: 2px 4px; }\n`;
    html += `        pre { background-color: #f4f4f4; padding: 10px; overflow-x: auto; }\n`;
    html += `    </style>\n`;
    html += `</head>\n`;
    html += `<body>\n`;
    html += `    <h1>${documentation.title}</h1>\n`;
    html += `    <p><strong>Generated on:</strong> ${documentation.generatedAt}</p>\n`;
    html += `    <p><strong>Format:</strong> ${documentation.format}</p>\n`;
    html += `    <p><strong>Source Files:</strong> ${documentation.sourceFiles.join(', ')}</p>\n`;
    
    if (documentation.sections) {
      for (const section of documentation.sections) {
        html += `    <h2>${section.name}</h2>\n`;
        html += `    <div>${this.markdownToHTML(section.content)}</div>\n`;
        
        if (section.examples && section.examples.length > 0) {
          html += `    <h3>Examples</h3>\n`;
          for (const example of section.examples) {
            html += `    <pre><code>${example}</code></pre>\n`;
          }
        }
      }
    }
    
    html += `</body>\n`;
    html += `</html>`;
    
    return html;
  }

  private markdownToHTML(markdown: string): string {
    return markdown
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
      .replace(/`(.*?)`/gim, '<code>$1</code>')
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/\n/g, '<br>');
  }
}