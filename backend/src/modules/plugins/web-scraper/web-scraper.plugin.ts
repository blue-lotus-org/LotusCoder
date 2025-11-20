import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Plugin, WebScrapingResult } from '../interfaces/plugin.interface';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class WebScraperPlugin implements Plugin {
  readonly name = 'web_scraper';
  readonly version = '1.0.0';
  readonly description = 'Web Scraper Plugin - Extract content from websites and documentation';
  readonly author = 'LotusAGI Team';
  enabled = true;

  private readonly logger = new Logger(WebScraperPlugin.name);
  private config: any = {};
  private readonly allowedDomains = new Set<string>();

  constructor(private readonly configService: ConfigService) {}

  async initialize(): Promise<void> {
    this.config = this.configService.get('plugins.available.web_scraper.config') || {};
    
    // Initialize allowed domains
    const domains = this.config.allowed_domains || [];
    this.allowedDomains.add(...domains);
    
    this.logger.log('Web Scraper Plugin initialized');
  }

  async activate(): Promise<void> {
    this.logger.log('Web Scraper Plugin activated');
  }

  async deactivate(): Promise<void> {
    this.logger.log('Web Scraper Plugin deactivated');
  }

  async dispose(): Promise<void> {
    this.logger.log('Web Scraper Plugin disposed');
  }

  getCapabilities(): string[] {
    return [
      'scrape_webpage',
      'extract_text',
      'extract_code',
      'extract_links',
      'extract_images',
      'get_page_metadata'
    ];
  }

  getDependencies(): string[] {
    return [];
  }

  getDefaultConfig(): Record<string, any> {
    return {
      user_agent: 'LotusAGI/1.0',
      timeout: 15000,
      max_content_length: 100000,
      allowed_domains: [
        '*.github.com',
        '*.stackoverflow.com',
        '*.mdn.mozilla.org',
        '*.reactjs.org',
        '*.angular.io',
        '*.vuejs.org',
        '*.nodejs.org',
        '*.python.org',
        '*.rust-lang.org',
        '*.go.dev',
        '*.go-lang.org',
      ],
    };
  }

  async updateConfig(config: Record<string, any>): Promise<void> {
    this.config = { ...this.config, ...config };
    
    if (config.allowed_domains) {
      this.allowedDomains.clear();
      this.allowedDomains.add(...config.allowed_domains);
    }
  }

  validate(params: Record<string, any>): boolean {
    const required = ['url'];
    return required.every(key => params[key] !== undefined && params[key] !== '');
  }

  async execute(action: string, params: Record<string, any>): Promise<any> {
    switch (action) {
      case 'scrape':
        return this.scrapeWebpage(params.url, params);
      case 'extract_text':
        return this.extractText(params.url, params);
      case 'extract_code':
        return this.extractCode(params.url, params);
      case 'get_metadata':
        return this.getPageMetadata(params.url, params);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private isDomainAllowed(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      
      for (const allowedDomain of this.allowedDomains) {
        if (this.matchesPattern(domain, allowedDomain)) {
          return true;
        }
      }
      
      return false;
    } catch {
      return false;
    }
  }

  private matchesPattern(domain: string, pattern: string): boolean {
    // Simple wildcard matching for domain patterns
    if (pattern.startsWith('*.') && domain.endsWith(pattern.slice(2))) {
      return true;
    }
    if (pattern.startsWith('www.') && domain.startsWith(pattern.slice(4))) {
      return true;
    }
    return domain === pattern;
  }

  private async scrapeWebpage(url: string, options: any = {}): Promise<WebScrapingResult> {
    try {
      if (!this.isDomainAllowed(url)) {
        throw new Error(`Domain not allowed: ${url}`);
      }

      const startTime = Date.now();
      const userAgent = this.config.user_agent || 'LotusAGI/1.0';
      const timeout = options.timeout || this.config.timeout;

      // In a real implementation, this would make an actual HTTP request
      // For demo purposes, we'll simulate the scraping
      const mockContent = this.generateMockContent(url, options.selector);
      
      const extractionTime = Date.now() - startTime;
      
      const result: WebScrapingResult = {
        content: mockContent,
        url,
        title: this.extractTitleFromUrl(url),
        extractionTime,
        contentType: 'text/html',
      };

      this.logger.debug(`Webpage scraped: ${url} (${extractionTime}ms)`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to scrape webpage ${url}:`, error);
      throw error;
    }
  }

  private async extractText(url: string, options: any = {}): Promise<string> {
    const scrapingResult = await this.scrapeWebpage(url, options);
    return this.cleanText(scrapingResult.content);
  }

  private async extractCode(url: string, options: any = {}): Promise<string[]> {
    try {
      const scrapingResult = await this.scrapeWebpage(url, options);
      
      // Extract code blocks from HTML content
      const codeBlocks: string[] = [];
      
      // This would use actual HTML parsing in a real implementation
      // For demo, we'll generate some mock code blocks
      if (url.includes('github.com')) {
        codeBlocks.push('// Sample code from GitHub');
        codeBlocks.push('function example() { return "Hello World"; }');
      } else if (url.includes('stackoverflow.com')) {
        codeBlocks.push('// Code example from Stack Overflow');
        codeBlocks.push('console.log("Example solution");');
      }

      return codeBlocks;
    } catch (error) {
      this.logger.error(`Failed to extract code from ${url}:`, error);
      throw error;
    }
  }

  private async getPageMetadata(url: string, options: any = {}): Promise<any> {
    try {
      const scrapingResult = await this.scrapeWebpage(url, options);
      
      return {
        url,
        title: scrapingResult.title,
        contentLength: scrapingResult.content.length,
        contentType: scrapingResult.contentType,
        extractionTime: scrapingResult.extractionTime,
        domain: new URL(url).hostname,
        isSecure: url.startsWith('https://'),
      };
    } catch (error) {
      this.logger.error(`Failed to get metadata from ${url}:`, error);
      throw error;
    }
  }

  private generateMockContent(url: string, selector?: string): string {
    // Generate mock content based on URL pattern
    if (url.includes('github.com')) {
      return `
        <html>
          <head><title>GitHub Repository</title></head>
          <body>
            <h1>Sample Repository</h1>
            <pre><code class="language-javascript">
              const express = require('express');
              const app = express();
              
              app.get('/', (req, res) => {
                res.send('Hello World!');
              });
              
              app.listen(3000);
            </code></pre>
            <p>This is a sample code repository with Express.js examples.</p>
          </body>
        </html>
      `;
    } else if (url.includes('stackoverflow.com')) {
      return `
        <html>
          <head><title>Stack Overflow Question</title></head>
          <body>
            <h1>How to fix JavaScript error?</h1>
            <div class="question-body">
              <p>I'm getting an undefined error when calling this function...</p>
              <pre><code>function test() {
  return this.value;
}</code></pre>
            </div>
            <div class="answers">
              <div class="answer">
                <p>You need to bind the context properly:</p>
                <pre><code>const bound = test.bind({ value: 'test' });
console.log(bound());</code></pre>
              </div>
            </div>
          </body>
        </html>
      `;
    } else {
      return `
        <html>
          <head><title>Documentation Page</title></head>
          <body>
            <h1>API Documentation</h1>
            <p>This is sample documentation content.</p>
            <pre><code>// Basic usage example
fetch('/api/data')
  .then(response => response.json())
  .then(data => console.log(data));</code></pre>
            <ul>
              <li>Point 1: Basic setup</li>
              <li>Point 2: Configuration</li>
              <li>Point 3: Advanced usage</li>
            </ul>
          </body>
        </html>
      `;
    }
  }

  private extractTitleFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');
      
      if (domain.includes('github.com')) return 'GitHub Repository';
      if (domain.includes('stackoverflow.com')) return 'Stack Overflow';
      if (domain.includes('mdn')) return 'MDN Web Docs';
      if (domain.includes('reactjs.org')) return 'React Documentation';
      
      return domain.replace('.com', '').replace('.org', '').toUpperCase();
    } catch {
      return 'Web Page';
    }
  }

  private cleanText(content: string): string {
    // Remove HTML tags and clean up content
    return content
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}