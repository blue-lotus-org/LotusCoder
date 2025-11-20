import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Plugin, PackageInfo } from '../interfaces/plugin.interface';
import axios from 'axios';

@Injectable()
export class PackageManagerPlugin implements Plugin {
  readonly name = 'package_manager';
  readonly version = '1.0.0';
  readonly description = 'Package Manager Plugin - Search and install packages from various package managers';
  readonly author = 'LotusAGI Team';
  enabled = true;

  private readonly logger = new Logger(PackageManagerPlugin.name);
  private config: any = {};
  private readonly searchAPIs = new Map<string, string>();

  constructor(private readonly configService: ConfigService) {}

  async initialize(): Promise<void> {
    this.config = this.configService.get('plugins.available.package_manager.config') || {};
    
    // Initialize search API endpoints
    const apis = this.config.search_apis || {};
    this.searchAPIs.set('npm', apis.npm || 'https://registry.npmjs.org');
    this.searchAPIs.set('pypi', apis.pypi || 'https://pypi.org/pypi');
    this.searchAPIs.set('cargo', apis.cargo || 'https://crates.io/api/v1');
    
    this.logger.log('Package Manager Plugin initialized');
  }

  async activate(): Promise<void> {
    this.logger.log('Package Manager Plugin activated');
  }

  async deactivate(): Promise<void> {
    this.logger.log('Package Manager Plugin deactivated');
  }

  async dispose(): Promise<void> {
    this.logger.log('Package Manager Plugin disposed');
  }

  getCapabilities(): string[] {
    return [
      'search_packages',
      'get_package_info',
      'get_dependencies',
      'get_popular_packages',
      'get_recent_packages'
    ];
  }

  getDependencies(): string[] {
    return [];
  }

  getDefaultConfig(): Record<string, any> {
    return {
      managers: [
        'npm', 'yarn', 'pnpm', 'pip', 'cargo', 'go',
        'maven', 'gradle', 'composer', 'bundler'
      ],
      search_apis: {
        npm: 'https://registry.npmjs.org',
        pypi: 'https://pypi.org/pypi',
        cargo: 'https://crates.io/api/v1',
      },
    };
  }

  async updateConfig(config: Record<string, any>): Promise<void> {
    this.config = { ...this.config, ...config };
  }

  validate(params: Record<string, any>): boolean {
    const required = ['package_name', 'manager'];
    return required.every(key => params[key] !== undefined && params[key] !== '');
  }

  async execute(action: string, params: Record<string, any>): Promise<any> {
    switch (action) {
      case 'search':
        return this.searchPackages(params.query, params.manager, params);
      case 'get_info':
        return this.getPackageInfo(params.package_name, params.manager);
      case 'get_popular':
        return this.getPopularPackages(params.manager, params.limit);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async searchPackages(
    query: string, 
    manager: string, 
    options: any = {}
  ): Promise<PackageInfo[]> {
    try {
      if (!this.config.managers?.includes(manager)) {
        throw new Error(`Package manager not supported: ${manager}`);
      }

      const searchAPI = this.searchAPIs.get(manager);
      if (!searchAPI) {
        throw new Error(`No search API configured for ${manager}`);
      }

      // Generate mock search results for demo
      const packages = this.generateMockPackages(query, manager, options.limit || 10);

      this.logger.debug(`Package search completed for ${query} in ${manager}`);
      return packages;
    } catch (error) {
      this.logger.error(`Package search failed:`, error);
      throw error;
    }
  }

  private async getPackageInfo(
    packageName: string, 
    manager: string
  ): Promise<PackageInfo> {
    try {
      if (!this.config.managers?.includes(manager)) {
        throw new Error(`Package manager not supported: ${manager}`);
      }

      // Generate mock package info
      const packageInfo = this.generateMockPackageInfo(packageName, manager);

      this.logger.debug(`Package info retrieved for ${packageName} (${manager})`);
      return packageInfo;
    } catch (error) {
      this.logger.error(`Failed to get package info for ${packageName}:`, error);
      throw error;
    }
  }

  private async getPopularPackages(
    manager: string, 
    limit: number = 10
  ): Promise<PackageInfo[]> {
    try {
      if (!this.config.managers?.includes(manager)) {
        throw new Error(`Package manager not supported: ${manager}`);
      }

      // Generate mock popular packages
      const popularPackages = this.generatePopularPackages(manager, limit);

      this.logger.debug(`Popular packages retrieved for ${manager}`);
      return popularPackages;
    } catch (error) {
      this.logger.error(`Failed to get popular packages for ${manager}:`, error);
      throw error;
    }
  }

  private generateMockPackages(
    query: string, 
    manager: string, 
    limit: number = 10
  ): PackageInfo[] {
    const mockPackages: Record<string, PackageInfo[]> = {
      npm: [
        {
          name: `${query}-package`,
          version: '1.0.0',
          description: `A Node.js package for ${query}`,
          repository: `https://github.com/example/${query}-package`,
          downloads: 15000,
          dependencies: ['lodash', 'axios'],
        },
        {
          name: `@scope/${query}`,
          version: '2.3.1',
          description: `Scoped npm package for ${query}`,
          downloads: 8500,
          dependencies: ['express', 'moment'],
        },
        {
          name: `awesome-${query}`,
          version: '3.1.4',
          description: `Awesome ${query} utilities`,
          repository: 'https://github.com/awesome/awesome-package',
          downloads: 32000,
          dependencies: ['react', 'typescript'],
        },
      ],
      pip: [
        {
          name: `${query.replace(/-/g, '_')}_lib`,
          version: '1.2.0',
          description: `Python library for ${query}`,
          downloads: 25000,
          dependencies: ['requests', 'pandas'],
        },
        {
          name: `${query}-tools`,
          version: '0.9.0',
          description: `Tools and utilities for ${query}`,
          downloads: 12000,
          dependencies: ['numpy', 'matplotlib'],
        },
      ],
      cargo: [
        {
          name: `${query}-rs`,
          version: '0.1.5',
          description: `Rust crate for ${query}`,
          downloads: 8500,
          dependencies: ['serde', 'tokio'],
        },
        {
          name: `awesome-${query}`,
          version: '1.0.0',
          description: `Awesome ${query} utilities in Rust`,
          downloads: 15000,
          dependencies: ['actix-web', 'postgres'],
        },
      ],
    };

    const packages = mockPackages[manager] || [];
    return packages.slice(0, limit);
  }

  private generateMockPackageInfo(
    packageName: string, 
    manager: string
  ): PackageInfo {
    const packages = this.generateMockPackages(packageName, manager, 1);
    return packages[0] || {
      name: packageName,
      version: '1.0.0',
      description: `Package ${packageName} for ${manager}`,
      downloads: Math.floor(Math.random() * 100000),
      dependencies: ['dependency1', 'dependency2'],
    };
  }

  private generatePopularPackages(
    manager: string, 
    limit: number = 10
  ): PackageInfo[] {
    const popularPackages: Record<string, PackageInfo[]> = {
      npm: [
        {
          name: 'react',
          version: '18.2.0',
          description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces',
          downloads: 5000000,
          dependencies: ['loose-envify', 'js-tokens'],
        },
        {
          name: 'lodash',
          version: '4.17.21',
          description: 'Lodash modular utilities',
          downloads: 4800000,
          dependencies: [],
        },
        {
          name: 'express',
          version: '4.18.2',
          description: 'Fast, unopinionated, minimalist web framework for node',
          downloads: 4200000,
          dependencies: ['accepts', 'body-parser', 'cookie-parser'],
        },
      ],
      pip: [
        {
          name: 'requests',
          version: '2.31.0',
          description: 'Python HTTP for Humans.',
          downloads: 3000000,
          dependencies: ['certifi', 'charset-normalizer', 'idna', 'urllib3'],
        },
        {
          name: 'numpy',
          version: '1.24.3',
          description: 'Fundamental package for scientific computing with Python',
          downloads: 2500000,
          dependencies: [],
        },
        {
          name: 'pandas',
          version: '2.0.3',
          description: 'Powerful data structures for data analysis, time series, and statistics',
          downloads: 2000000,
          dependencies: ['numpy', 'python-dateutil', 'pytz', 'tzdata'],
        },
      ],
      cargo: [
        {
          name: 'serde',
          version: '1.0.163',
          description: 'Serialization framework for Rust',
          downloads: 1500000,
          dependencies: ['serde_derive', 'serde_json'],
        },
        {
          name: 'tokio',
          version: '1.28.2',
          description: 'An event-driven, non-blocking I/O platform for writing async applications',
          downloads: 1200000,
          dependencies: ['tokio-util', 'tokio-stream'],
        },
        {
          name: 'actix-web',
          version: '4.3.1',
          description: 'Actix Web is a powerful, pragmatic, and extremely fast web framework for Rust',
          downloads: 800000,
          dependencies: ['actix', 'actix-http', 'awc'],
        },
      ],
    };

    const packages = popularPackages[manager] || [];
    return packages.slice(0, limit);
  }
}