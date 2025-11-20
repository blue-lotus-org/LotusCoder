import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Plugin } from '../interfaces/plugin.interface';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class GitIntegrationPlugin implements Plugin {
  readonly name = 'git_integration';
  readonly version = '1.0.0';
  readonly description = 'Git Integration Plugin - Git operations and repository management';
  readonly author = 'LotusAGI Team';
  enabled = true;

  private readonly logger = new Logger(GitIntegrationPlugin.name);
  private config: any = {};

  constructor(private readonly configService: ConfigService) {}

  async initialize(): Promise<void> {
    this.config = this.configService.get('plugins.available.git_integration.config') || {};
    this.logger.log('Git Integration Plugin initialized');
  }

  async activate(): Promise<void> {
    this.logger.log('Git Integration Plugin activated');
  }

  async deactivate(): Promise<void> {
    this.logger.log('Git Integration Plugin deactivated');
  }

  async dispose(): Promise<void> {
    this.logger.log('Git Integration Plugin disposed');
  }

  getCapabilities(): string[] {
    return [
      'init_repository',
      'add_files',
      'commit_changes',
      'push_changes',
      'pull_changes',
      'create_branch',
      'switch_branch',
      'merge_branches',
      'get_status',
      'get_log',
      'get_diff'
    ];
  }

  getDependencies(): string[] {
    return ['git'];
  }

  getDefaultConfig(): Record<string, any> {
    return {
      default_branch: 'main',
      auto_commit: false,
      commit_message_template: 'feat: {description}',
      auto_push: false,
    };
  }

  async updateConfig(config: Record<string, any>): Promise<void> {
    this.config = { ...this.config, ...config };
  }

  validate(params: Record<string, any>): boolean {
    const required = ['repository_path'];
    return required.every(key => params[key] !== undefined && params[key] !== '');
  }

  async execute(action: string, params: Record<string, any>): Promise<any> {
    switch (action) {
      case 'init':
        return this.initRepository(params.repository_path, params);
      case 'add':
        return this.addFiles(params.repository_path, params.files);
      case 'commit':
        return this.commitChanges(params.repository_path, params.message);
      case 'status':
        return this.getStatus(params.repository_path);
      case 'log':
        return this.getLog(params.repository_path, params.limit);
      case 'diff':
        return this.getDiff(params.repository_path, params.from, params.to);
      case 'branch':
        return this.createBranch(params.repository_path, params.branch_name, params.from);
      case 'switch':
        return this.switchBranch(params.repository_path, params.branch_name);
      case 'merge':
        return this.mergeBranches(params.repository_path, params.source, params.target);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async initRepository(
    repositoryPath: string, 
    options: any = {}
  ): Promise<any> {
    try {
      if (!fs.existsSync(repositoryPath)) {
        throw new Error(`Repository path does not exist: ${repositoryPath}`);
      }

      const gitInit = execSync('git init', { cwd: repositoryPath });
      
      const defaultBranch = options.branch || this.config.default_branch;
      
      // Set default branch
      try {
        execSync(`git checkout -b ${defaultBranch}`, { cwd: repositoryPath });
      } catch {
        // Branch might already exist
      }

      // Configure git user if not set
      if (options.author && options.email) {
        execSync(`git config user.name "${options.author}"`, { cwd: repositoryPath });
        execSync(`git config user.email "${options.email}"`, { cwd: repositoryPath });
      }

      this.logger.log(`Git repository initialized at ${repositoryPath}`);
      
      return {
        success: true,
        message: `Repository initialized with branch ${defaultBranch}`,
        branch: defaultBranch,
      };
    } catch (error) {
      this.logger.error(`Failed to initialize repository:`, error);
      throw error;
    }
  }

  private async addFiles(
    repositoryPath: string, 
    files: string[]
  ): Promise<any> {
    try {
      if (!files || files.length === 0) {
        throw new Error('No files specified for add operation');
      }

      for (const file of files) {
        const fullPath = path.join(repositoryPath, file);
        if (!fs.existsSync(fullPath)) {
          throw new Error(`File does not exist: ${file}`);
        }
      }

      const fileList = files.join(' ');
      execSync(`git add ${fileList}`, { cwd: repositoryPath });

      this.logger.log(`Files added to staging: ${files.join(', ')}`);
      
      return {
        success: true,
        message: `${files.length} file(s) added to staging`,
        files,
      };
    } catch (error) {
      this.logger.error(`Failed to add files:`, error);
      throw error;
    }
  }

  private async commitChanges(
    repositoryPath: string, 
    message: string
  ): Promise<any> {
    try {
      // Check if there are changes to commit
      const status = execSync('git status --porcelain', { cwd: repositoryPath }).toString();
      
      if (!status.trim()) {
        return {
          success: false,
          message: 'No changes to commit',
        };
      }

      // Use template if message contains variables
      const commitMessage = message.includes('{description}') 
        ? message.replace('{description}', message.replace('feat: ', ''))
        : message;

      const result = execSync(`git commit -m "${commitMessage}"`, { cwd: repositoryPath }).toString();

      this.logger.log(`Changes committed: ${commitMessage}`);
      
      return {
        success: true,
        message: 'Changes committed successfully',
        commit_message: commitMessage,
        result,
      };
    } catch (error) {
      this.logger.error(`Failed to commit changes:`, error);
      throw error;
    }
  }

  private async getStatus(repositoryPath: string): Promise<any> {
    try {
      const statusOutput = execSync('git status --porcelain', { cwd: repositoryPath }).toString();
      
      const files = statusOutput.trim() ? statusOutput.split('\n') : [];
      const status = {
        modified: [] as string[],
        added: [] as string[],
        deleted: [] as string[],
        untracked: [] as string[],
      };

      files.forEach(line => {
        if (line.trim()) {
          const code = line.substring(0, 2);
          const file = line.substring(3);
          
          switch (code[0]) {
            case 'M':
              status.modified.push(file);
              break;
            case 'A':
              status.added.push(file);
              break;
            case 'D':
              status.deleted.push(file);
              break;
          }
          
          if (code[1] === '?') {
            status.untracked.push(file);
          }
        }
      });

      this.logger.debug(`Git status retrieved for ${repositoryPath}`);
      
      return {
        success: true,
        status,
        total_changes: files.length,
      };
    } catch (error) {
      this.logger.error(`Failed to get git status:`, error);
      throw error;
    }
  }

  private async getLog(
    repositoryPath: string, 
    limit: number = 10
  ): Promise<any> {
    try {
      const logOutput = execSync(
        `git log --oneline -${limit}`, 
        { cwd: repositoryPath }
      ).toString();

      const commits = logOutput.trim() ? logOutput.split('\n') : [];
      
      const formattedCommits = commits.map(line => {
        const [hash, ...messageParts] = line.split(' ');
        return {
          hash: hash.substring(0, 8),
          message: messageParts.join(' '),
        };
      });

      this.logger.debug(`Git log retrieved: ${formattedCommits.length} commits`);
      
      return {
        success: true,
        commits: formattedCommits,
        total: formattedCommits.length,
      };
    } catch (error) {
      this.logger.error(`Failed to get git log:`, error);
      throw error;
    }
  }

  private async getDiff(
    repositoryPath: string, 
    from?: string, 
    to?: string
  ): Promise<any> {
    try {
      let diffCommand = 'git diff';
      
      if (from && to) {
        diffCommand = `git diff ${from}..${to}`;
      }

      const diffOutput = execSync(diffCommand, { cwd: repositoryPath }).toString();

      this.logger.debug(`Git diff retrieved from ${from || 'current'} to ${to || 'current'}`);
      
      return {
        success: true,
        diff: diffOutput || 'No differences found',
        command: diffCommand,
      };
    } catch (error) {
      this.logger.error(`Failed to get git diff:`, error);
      throw error;
    }
  }

  private async createBranch(
    repositoryPath: string, 
    branchName: string, 
    from: string = 'HEAD'
  ): Promise<any> {
    try {
      // Check if branch already exists
      try {
        execSync(`git rev-parse --verify ${branchName}`, { cwd: repositoryPath });
        return {
          success: false,
          message: `Branch ${branchName} already exists`,
        };
      } catch {
        // Branch doesn't exist, continue
      }

      execSync(`git checkout -b ${branchName} ${from}`, { cwd: repositoryPath });

      this.logger.log(`Branch ${branchName} created and switched to`);
      
      return {
        success: true,
        message: `Branch ${branchName} created from ${from}`,
        branch: branchName,
      };
    } catch (error) {
      this.logger.error(`Failed to create branch:`, error);
      throw error;
    }
  }

  private async switchBranch(
    repositoryPath: string, 
    branchName: string
  ): Promise<any> {
    try {
      execSync(`git checkout ${branchName}`, { cwd: repositoryPath });

      this.logger.log(`Switched to branch ${branchName}`);
      
      return {
        success: true,
        message: `Switched to branch ${branchName}`,
        branch: branchName,
      };
    } catch (error) {
      this.logger.error(`Failed to switch branch:`, error);
      throw error;
    }
  }

  private async mergeBranches(
    repositoryPath: string, 
    source: string, 
    target: string
  ): Promise<any> {
    try {
      // Switch to target branch
      execSync(`git checkout ${target}`, { cwd: repositoryPath });
      
      // Merge source branch
      const mergeResult = execSync(`git merge ${source}`, { cwd: repositoryPath }).toString();

      this.logger.log(`Merged branch ${source} into ${target}`);
      
      return {
        success: true,
        message: `Merged ${source} into ${target}`,
        result: mergeResult,
      };
    } catch (error) {
      this.logger.error(`Failed to merge branches:`, error);
      throw error;
    }
  }
}