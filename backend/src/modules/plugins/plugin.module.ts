import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PluginManagerService } from './plugin-manager.service';
import { WebSearchPlugin } from './web-search/web-search.plugin';
import { WebScraperPlugin } from './web-scraper/web-scraper.plugin';
import { LanguageReferencesPlugin } from './language-references/language-references.plugin';
import { PackageManagerPlugin } from './package-manager/package-manager.plugin';
import { GitIntegrationPlugin } from './git-integration/git-integration.plugin';
import { CodeFormatterPlugin } from './code-formatter/code-formatter.plugin';
import { DocumentationGeneratorPlugin } from './documentation-generator/documentation-generator.plugin';
import { PluginRegistryController } from './plugin-registry.controller';

@Module({
  imports: [ConfigModule],
  controllers: [PluginRegistryController],
  providers: [
    PluginManagerService,
    WebSearchPlugin,
    WebScraperPlugin,
    LanguageReferencesPlugin,
    PackageManagerPlugin,
    GitIntegrationPlugin,
    CodeFormatterPlugin,
    DocumentationGeneratorPlugin,
  ],
  exports: [PluginManagerService],
})
export class PluginModule {}