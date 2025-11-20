import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Plugin, PluginManifest, PluginExecutionResult } from './interfaces/plugin.interface';

@Injectable()
export class PluginManagerService {
  private readonly logger = new Logger(PluginManagerService.name);
  private readonly plugins = new Map<string, Plugin>();
  private readonly pluginManifests = new Map<string, PluginManifest>();

  constructor(private readonly configService: ConfigService) {
    this.initializePlugins();
  }

  private async initializePlugins(): Promise<void> {
    try {
      this.logger.log('Initializing plugin system...');
      
      const pluginConfig = this.configService.get('plugins');
      if (!pluginConfig?.enabled) {
        this.logger.warn('Plugin system is disabled');
        return;
      }

      const availablePlugins = pluginConfig.available || {};
      
      for (const [pluginName, config] of Object.entries(availablePlugins)) {
        if (config.enabled) {
          await this.loadPlugin(pluginName, config);
        }
      }

      this.logger.log(`Plugin system initialized with ${this.plugins.size} plugins`);
    } catch (error) {
      this.logger.error('Failed to initialize plugins:', error);
    }
  }

  private async loadPlugin(pluginName: string, config: any): Promise<void> {
    try {
      // This would typically load from a plugin registry or filesystem
      // For now, we'll assume plugins are injected via dependency injection
      
      const plugin = this.getPluginInstance(pluginName);
      if (!plugin) {
        this.logger.warn(`Plugin ${pluginName} not found in dependency injection`);
        return;
      }

      const manifest: PluginManifest = {
        name: config.name,
        version: config.version,
        description: config.description,
        author: config.author,
        capabilities: [config.description],
        dependencies: [],
        config: config.config || {},
        enabled: config.enabled,
      };

      await plugin.initialize();
      
      if (manifest.enabled) {
        await plugin.activate();
      }

      this.plugins.set(pluginName, plugin);
      this.pluginManifests.set(pluginName, manifest);

      this.logger.log(`Plugin ${pluginName} loaded successfully`);
    } catch (error) {
      this.logger.error(`Failed to load plugin ${pluginName}:`, error);
    }
  }

  private getPluginInstance(pluginName: string): Plugin | null {
    // In a real implementation, this would resolve from DI container
    // For now, this is a placeholder that would be replaced by actual DI resolution
    return null;
  }

  async executePlugin(pluginName: string, action: string, params: Record<string, any>): Promise<PluginExecutionResult> {
    const startTime = Date.now();
    
    try {
      const plugin = this.plugins.get(pluginName);
      if (!plugin) {
        throw new Error(`Plugin ${pluginName} not found or not loaded`);
      }

      if (!plugin.enabled) {
        throw new Error(`Plugin ${pluginName} is disabled`);
      }

      if (!plugin.validate(params)) {
        throw new Error(`Invalid parameters for plugin ${pluginName}`);
      }

      const data = await plugin.execute(action, params);
      
      const executionTime = Date.now() - startTime;
      
      this.logger.debug(`Plugin ${pluginName} executed action ${action} in ${executionTime}ms`);

      return {
        success: true,
        data,
        metadata: {
          executionTime,
          plugin: pluginName,
          action,
        },
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      this.logger.error(`Plugin ${pluginName} failed to execute action ${action}:`, error);
      
      return {
        success: false,
        error: error.message,
        metadata: {
          executionTime,
          plugin: pluginName,
          action,
        },
      };
    }
  }

  async enablePlugin(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (plugin) {
      plugin.enabled = true;
      await plugin.activate();
      this.logger.log(`Plugin ${pluginName} enabled`);
    }
  }

  async disablePlugin(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (plugin) {
      plugin.enabled = false;
      await plugin.deactivate();
      this.logger.log(`Plugin ${pluginName} disabled`);
    }
  }

  getPluginManifest(pluginName: string): PluginManifest | undefined {
    return this.pluginManifests.get(pluginName);
  }

  getAllPlugins(): PluginManifest[] {
    return Array.from(this.pluginManifests.values());
  }

  getActivePlugins(): PluginManifest[] {
    return Array.from(this.pluginManifests.values()).filter(plugin => plugin.enabled);
  }

  async reloadPlugin(pluginName: string): Promise<void> {
    await this.disablePlugin(pluginName);
    await this.enablePlugin(pluginName);
    this.logger.log(`Plugin ${pluginName} reloaded`);
  }

  async dispose(): Promise<void> {
    this.logger.log('Disposing plugin system...');
    
    for (const [pluginName, plugin] of this.plugins.entries()) {
      try {
        await plugin.deactivate();
        await plugin.dispose();
        this.logger.log(`Plugin ${pluginName} disposed`);
      } catch (error) {
        this.logger.error(`Failed to dispose plugin ${pluginName}:`, error);
      }
    }

    this.plugins.clear();
    this.pluginManifests.clear();
  }
}