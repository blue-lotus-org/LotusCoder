import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PluginManagerService } from './plugin-manager.service';

@Controller('plugins')
export class PluginRegistryController {
  constructor(private readonly pluginManager: PluginManagerService) {}

  @Get()
  async getAllPlugins() {
    try {
      const plugins = this.pluginManager.getAllPlugins();
      return {
        success: true,
        data: plugins,
        total: plugins.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('active')
  async getActivePlugins() {
    try {
      const plugins = this.pluginManager.getActivePlugins();
      return {
        success: true,
        data: plugins,
        total: plugins.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get(':pluginName')
  async getPlugin(@Param('pluginName') pluginName: string) {
    try {
      const manifest = this.pluginManager.getPluginManifest(pluginName);
      if (!manifest) {
        return {
          success: false,
          error: `Plugin ${pluginName} not found`,
        };
      }
      
      return {
        success: true,
        data: manifest,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post(':pluginName/execute')
  async executePlugin(
    @Param('pluginName') pluginName: string,
    @Body() body: { action: string; params: Record<string, any> }
  ) {
    try {
      const { action, params } = body;
      
      if (!action) {
        return {
          success: false,
          error: 'Action is required',
        };
      }
      
      const result = await this.pluginManager.executePlugin(pluginName, action, params || {});
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post(':pluginName/enable')
  async enablePlugin(@Param('pluginName') pluginName: string) {
    try {
      await this.pluginManager.enablePlugin(pluginName);
      return {
        success: true,
        message: `Plugin ${pluginName} enabled`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post(':pluginName/disable')
  async disablePlugin(@Param('pluginName') pluginName: string) {
    try {
      await this.pluginManager.disablePlugin(pluginName);
      return {
        success: true,
        message: `Plugin ${pluginName} disabled`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post(':pluginName/reload')
  async reloadPlugin(@Param('pluginName') pluginName: string) {
    try {
      await this.pluginManager.reloadPlugin(pluginName);
      return {
        success: true,
        message: `Plugin ${pluginName} reloaded`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Plugin-specific endpoints
  @Get('web-search/search')
  async webSearch(
    @Query('q') query: string,
    @Query('provider') provider?: string,
    @Query('limit') limit?: string
  ) {
    try {
      const result = await this.pluginManager.executePlugin('web_search', 'search', {
        query,
        provider,
        limit: parseInt(limit || '10'),
      });
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('web-scraper/scrape')
  async scrapeWebpage(@Body() body: { url: string; selector?: string }) {
    try {
      const result = await this.pluginManager.executePlugin('web_scraper', 'scrape', body);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('language-references/:language')
  async getLanguageReference(
    @Param('language') language: string,
    @Query('topic') topic?: string
  ) {
    try {
      const result = await this.pluginManager.executePlugin('language_references', 'get_syntax', {
        language,
        topic,
      });
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('package-manager/:manager/search')
  async searchPackages(
    @Param('manager') manager: string,
    @Query('q') query: string,
    @Query('limit') limit?: string
  ) {
    try {
      const result = await this.pluginManager.executePlugin('package_manager', 'search', {
        query,
        manager,
        limit: parseInt(limit || '10'),
      });
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('code-formatter/format')
  async formatCode(
    @Body() body: { code: string; language: string; options?: any }
  ) {
    try {
      const result = await this.pluginManager.executePlugin('code_formatter', 'format', body);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('documentation-generator/generate')
  async generateDocumentation(
    @Body() body: { 
      source_files: string[]; 
      format: string; 
      options?: any;
    }
  ) {
    try {
      const result = await this.pluginManager.executePlugin('documentation_generator', 'generate', body);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('git-integration/commit')
  async gitCommit(
    @Body() body: { repository_path: string; message: string }
  ) {
    try {
      const result = await this.pluginManager.executePlugin('git_integration', 'commit', body);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}