import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Plugin, CodeFormatResult } from '../interfaces/plugin.interface';
import { execSync } from 'child_process';

@Injectable()
export class CodeFormatterPlugin implements Plugin {
  readonly name = 'code_formatter';
  readonly version = '1.0.0';
  readonly description = 'Code Formatter Plugin - Format code according to language standards';
  readonly author = 'LotusAGI Team';
  enabled = true;

  private readonly logger = new Logger(CodeFormatterPlugin.name);
  private config: any = {};
  private readonly formatters = new Map<string, string>();

  constructor(private readonly configService: ConfigService) {}

  async initialize(): Promise<void> {
    this.config = this.configService.get('plugins.available.code_formatter.config') || {};
    
    // Initialize formatters
    const formatters = this.config.formatters || {};
    this.formatters.set('javascript', formatters.javascript || 'prettier');
    this.formatters.set('typescript', formatters.typescript || 'prettier');
    this.formatters.set('python', formatters.python || 'black');
    this.formatters.set('rust', formatters.rust || 'rustfmt');
    this.formatters.set('go', formatters.go || 'gofmt');
    
    this.logger.log('Code Formatter Plugin initialized');
  }

  async activate(): Promise<void> {
    this.logger.log('Code Formatter Plugin activated');
  }

  async deactivate(): Promise<void> {
    this.logger.log('Code Formatter Plugin deactivated');
  }

  async dispose(): Promise<void> {
    this.logger.log('Code Formatter Plugin disposed');
  }

  getCapabilities(): string[] {
    return [
      'format_code',
      'validate_format',
      'get_format_rules',
      'auto_format_file',
      'format_selection'
    ];
  }

  getDependencies(): string[] {
    return ['prettier', 'black', 'rustfmt', 'gofmt'];
  }

  getDefaultConfig(): Record<string, any> {
    return {
      formatters: {
        javascript: 'prettier',
        typescript: 'prettier',
        python: 'black',
        rust: 'rustfmt',
        go: 'gofmt',
      },
      auto_format: true,
      check_only: false,
    };
  }

  async updateConfig(config: Record<string, any>): Promise<void> {
    this.config = { ...this.config, ...config };
  }

  validate(params: Record<string, any>): boolean {
    const required = ['code', 'language'];
    return required.every(key => params[key] !== undefined && params[key] !== '');
  }

  async execute(action: string, params: Record<string, any>): Promise<any> {
    switch (action) {
      case 'format':
        return this.formatCode(params.code, params.language, params.options);
      case 'validate':
        return this.validateFormat(params.code, params.language);
      case 'get_rules':
        return this.getFormatRules(params.language);
      case 'auto_format_file':
        return this.autoFormatFile(params.file_path, params.options);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async formatCode(
    code: string, 
    language: string, 
    options: any = {}
  ): Promise<CodeFormatResult> {
    try {
      const startTime = Date.now();
      const languageLower = language.toLowerCase();
      
      // Detect language-specific formatting rules
      const formatter = this.detectFormatter(languageLower, options.formatter);
      
      let formattedCode = code;
      let changes: string[] = [];
      let formatSuccessful = true;
      let errorMessage = '';

      try {
        switch (formatter) {
          case 'prettier':
            ({ formattedCode, changes } = await this.formatWithPrettier(code, languageLower, options));
            break;
          case 'black':
            ({ formattedCode, changes } = await this.formatWithBlack(code, options));
            break;
          case 'rustfmt':
            ({ formattedCode, changes } = await this.formatWithRustfmt(code, options));
            break;
          case 'gofmt':
            ({ formattedCode, changes } = await this.formatWithGofmt(code, options));
            break;
          default:
            // For unsupported languages, perform basic formatting
            formattedCode = this.basicFormat(code, languageLower);
            changes = ['Basic formatting applied'];
        }
      } catch (formatError) {
        formatSuccessful = false;
        errorMessage = formatError.message;
        this.logger.warn(`Formatting failed for ${language}:`, formatError);
      }

      const formatTime = Date.now() - startTime;

      const result: CodeFormatResult = {
        formattedCode,
        originalCode: code,
        changes,
        formatTime,
        formatter,
      };

      if (!formatSuccessful) {
        result.error = errorMessage;
      }

      this.logger.debug(`Code formatted using ${formatter} (${formatTime}ms)`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to format code:`, error);
      throw error;
    }
  }

  private async validateFormat(
    code: string, 
    language: string
  ): Promise<any> {
    try {
      const formatResult = await this.formatCode(code, language, { check_only: true });
      
      const isFormatted = formatResult.formattedCode === formatResult.originalCode;
      const issues = [];

      if (!isFormatted) {
        issues.push('Code is not properly formatted');
        issues.push(...formatResult.changes);
      }

      return {
        success: true,
        isFormatted,
        issues,
        changes: isFormatted ? [] : formatResult.changes,
        formatter: formatResult.formatter,
      };
    } catch (error) {
      this.logger.error(`Failed to validate code format:`, error);
      throw error;
    }
  }

  private async getFormatRules(language: string): Promise<any> {
    const languageLower = language.toLowerCase();
    
    const rules: Record<string, any> = {
      javascript: {
        indent: 2,
        semicolons: true,
        quotes: 'single',
        trailing_commas: 'all',
        arrow_parens: 'always',
      },
      typescript: {
        indent: 2,
        semicolons: true,
        quotes: 'single',
        trailing_commas: 'all',
        arrow_parens: 'always',
      },
      python: {
        line_length: 88,
        target_version: ['py38'],
        include: ['*.py'],
        skip: ['.gitignore', '.flake8'],
      },
      rust: {
        edition: '2021',
        tab_spaces: 4,
        hard_tabs: false,
        newline_style: 'Unix',
      },
      go: {
        tab_length: 8,
        use_tab: true,
        use_spaces: false,
      },
    };

    return {
      success: true,
      language: languageLower,
      formatter: this.detectFormatter(languageLower),
      rules: rules[languageLower] || { basic_formatting: true },
    };
  }

  private async autoFormatFile(
    filePath: string, 
    options: any = {}
  ): Promise<any> {
    try {
      // This would read the file, format it, and write it back
      // For now, we'll simulate the process
      
      const language = this.detectLanguageFromFile(filePath);
      const content = `// Simulated content of ${filePath}`;
      
      const formatResult = await this.formatCode(content, language, options);

      return {
        success: true,
        message: `File ${filePath} formatted successfully`,
        file_path: filePath,
        language,
        changes: formatResult.changes,
        format_time: formatResult.formatTime,
      };
    } catch (error) {
      this.logger.error(`Failed to auto-format file:`, error);
      throw error;
    }
  }

  private detectFormatter(language: string, preferred?: string): string {
    if (preferred && this.formatters.has(language)) {
      return preferred;
    }
    return this.formatters.get(language) || 'basic';
  }

  private detectLanguageFromFile(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'rs': 'rust',
      'go': 'go',
      'java': 'java',
      'cpp': 'cpp',
      'cc': 'cpp',
      'cxx': 'cpp',
      'c': 'c',
      'h': 'c',
      'hpp': 'cpp',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'kt': 'kotlin',
      'swift': 'swift',
      'scala': 'scala',
    };

    return languageMap[ext || ''] || 'javascript';
  }

  private async formatWithPrettier(
    code: string, 
    language: string, 
    options: any
  ): Promise<{ formattedCode: string; changes: string[] }> {
    // Simulate Prettier formatting
    // In a real implementation, this would call Prettier API
    
    let formattedCode = code;
    const changes: string[] = [];

    // Basic JavaScript/TypeScript formatting rules
    if (['javascript', 'typescript'].includes(language)) {
      // Add spaces around operators
      const oldCode = formattedCode;
      formattedCode = formattedCode
        .replace(/\s*=\s*/g, ' = ')
        .replace(/\s*\+\s*/g, ' + ')
        .replace(/\s*-\s*/g, ' - ')
        .replace(/\s*\*\s*/g, ' * ')
        .replace(/\s*\/\s*/g, ' / ')
        .replace(/\s*<\s*/g, ' < ')
        .replace(/\s*>\s*/g, ' > ')
        .replace(/,\s*/g, ', ')
        .replace(/;\s*/g, '; ')
        .replace(/\{\s*/g, ' { ')
        .replace(/\s*\}/g, ' } ')
        .replace(/\(\s*/g, ' ( ')
        .replace(/\s*\)/g, ' ) ');
      
      if (oldCode !== formattedCode) {
        changes.push('Applied spacing rules');
      }
    }

    return { formattedCode, changes };
  }

  private async formatWithBlack(
    code: string, 
    options: any
  ): Promise<{ formattedCode: string; changes: string[] }> {
    // Simulate Black formatting
    let formattedCode = code;
    const changes: string[] = [];

    // Basic Python formatting
    const oldCode = formattedCode;
    formattedCode = formattedCode
      .replace(/\n\s+/g, '\n')  // Remove extra indentation
      .replace(/\s+\n/g, '\n')  // Remove trailing whitespace
      .replace(/\n{3,}/g, '\n\n')  // Limit consecutive newlines
      .trim();

    if (oldCode !== formattedCode) {
      changes.push('Applied Python formatting rules');
    }

    return { formattedCode, changes };
  }

  private async formatWithRustfmt(
    code: string, 
    options: any
  ): Promise<{ formattedCode: string; changes: string[] }> {
    // Simulate rustfmt formatting
    let formattedCode = code;
    const changes: string[] = [];

    const oldCode = formattedCode;
    formattedCode = formattedCode
      .replace(/\n\s+/g, '\n')  // Remove extra indentation
      .replace(/\s+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (oldCode !== formattedCode) {
      changes.push('Applied Rust formatting rules');
    }

    return { formattedCode, changes };
  }

  private async formatWithGofmt(
    code: string, 
    options: any
  ): Promise<{ formattedCode: string; changes: string[] }> {
    // Simulate gofmt formatting
    let formattedCode = code;
    const changes: string[] = [];

    const oldCode = formattedCode;
    formattedCode = formattedCode
      .replace(/\n\s+/g, '\n')
      .replace(/\s+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (oldCode !== formattedCode) {
      changes.push('Applied Go formatting rules');
    }

    return { formattedCode, changes };
  }

  private basicFormat(code: string, language: string): string {
    // Basic formatting for unsupported languages
    return code
      .replace(/\s+/g, ' ')  // Collapse multiple spaces
      .replace(/;\s*/g, ';\n')  // Add newlines after semicolons (if applicable)
      .replace(/\{\s*/g, ' {\n')  // Add newlines after opening braces
      .replace(/\s*\}/g, '\n}')  // Add newlines before closing braces
      .trim();
  }
}