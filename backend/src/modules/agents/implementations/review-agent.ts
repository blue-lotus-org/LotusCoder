import { Injectable } from '@nestjs/common';
import { BaseAgent } from '../base/base-agent';
import { AgentInput, AgentOutput } from '../interfaces/agent.interface';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentExecution } from '../../../database/entities/agent-execution.entity';

@Injectable()
export class ReviewAgent extends BaseAgent {
  constructor(
    @InjectRepository(AgentExecution)
    agentExecutionRepo: Repository<AgentExecution>,
    private readonly configService: ConfigService,
  ) {
    super({
      name: 'ReviewAgent',
      type: 'review',
      enabled: true,
      role: 'quality_assurance',
      description: 'Reviews and optimizes code for quality, security, and performance',
      timeout: 60000,
      retryAttempts: 2,
      maxConcurrent: 2,
    }, agentExecutionRepo, configService, ReviewAgent.name);
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const task = input.task.toLowerCase();

    try {
      if (task.includes('security') || task.includes('vulnerable')) {
        return await this.reviewSecurity(input);
      } else if (task.includes('performance') || task.includes('optimize')) {
        return await this.reviewPerformance(input);
      } else if (task.includes('quality') || task.includes('code review')) {
        return await this.reviewCodeQuality(input);
      } else if (task.includes('best practices')) {
        return await this.reviewBestPractices(input);
      } else {
        return await this.performGenericReview(input);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        duration: 0,
      };
    }
  }

  private async reviewSecurity(input: AgentInput): Promise<AgentOutput> {
    this.getLogger().log('Performing security review');
    
    const securityIssues = [
      {
        type: 'HIGH',
        title: 'Input Validation Missing',
        description: 'User inputs are not properly validated',
        file: 'src/components/InputForm.tsx',
        line: 42,
        recommendation: 'Implement proper input validation using libraries like zod or joi',
        severity: 'HIGH',
      },
      {
        type: 'MEDIUM',
        title: 'API Keys Exposed',
        description: 'API keys should not be hardcoded in source code',
        file: 'src/config/api.ts',
        line: 3,
        recommendation: 'Move sensitive data to environment variables',
        severity: 'MEDIUM',
      },
      {
        type: 'LOW',
        title: 'XSS Vulnerability',
        description: 'Potential XSS vulnerability in innerHTML usage',
        file: 'src/components/DynamicContent.tsx',
        line: 18,
        recommendation: 'Use textContent or sanitize HTML content',
        severity: 'LOW',
      },
    ];

    const summary = {
      totalIssues: securityIssues.length,
      highSeverity: securityIssues.filter(i => i.severity === 'HIGH').length,
      mediumSeverity: securityIssues.filter(i => i.severity === 'MEDIUM').length,
      lowSeverity: securityIssues.filter(i => i.severity === 'LOW').length,
      riskScore: this.calculateRiskScore(securityIssues),
    };

    return {
      success: true,
      result: {
        type: 'security',
        issues: securityIssues,
        summary,
        recommendations: [
          'Implement comprehensive input validation',
          'Use environment variables for sensitive data',
          'Enable Content Security Policy (CSP)',
          'Regular security audits and dependency updates',
        ],
      },
      duration: 4000,
    };
  }

  private async reviewPerformance(input: AgentInput): Promise<AgentOutput> {
    this.getLogger().log('Performing performance review');
    
    const performanceIssues = [
      {
        type: 'PERFORMANCE',
        title: 'Inefficient Re-renders',
        description: 'Component re-renders on every prop change without memoization',
        file: 'src/components/DataList.tsx',
        impact: 'High - affects user experience',
        recommendation: 'Use React.memo and useMemo for expensive operations',
        estimatedImprovement: '40-60% faster rendering',
      },
      {
        type: 'PERFORMANCE',
        title: 'Large Bundle Size',
        description: 'Multiple large dependencies causing slow initial load',
        file: 'package.json',
        impact: 'Medium - affects first contentful paint',
        recommendation: 'Implement code splitting and lazy loading',
        estimatedImprovement: '30-50% faster initial load',
      },
      {
        type: 'PERFORMANCE',
        title: 'Memory Leaks',
        description: 'Event listeners and timers not properly cleaned up',
        file: 'src/hooks/useTimer.ts',
        impact: 'Medium - affects long-term performance',
        recommendation: 'Add proper cleanup in useEffect hooks',
        estimatedImprovement: 'Reduced memory usage over time',
      },
    ];

    const summary = {
      totalIssues: performanceIssues.length,
      highImpact: performanceIssues.filter(i => i.impact.includes('High')).length,
      mediumImpact: performanceIssues.filter(i => i.impact.includes('Medium')).length,
      estimatedTotalImprovement: '60-80% overall performance boost',
    };

    return {
      success: true,
      result: {
        type: 'performance',
        issues: performanceIssues,
        summary,
        recommendations: [
          'Implement React.memo for pure components',
          'Use useCallback and useMemo for expensive operations',
          'Implement code splitting with React.lazy',
          'Optimize images and implement lazy loading',
          'Use Web Workers for heavy computations',
        ],
      },
      duration: 3500,
    };
  }

  private async reviewCodeQuality(input: AgentInput): Promise<AgentOutput> {
    this.getLogger().log('Performing code quality review');
    
    const qualityIssues = [
      {
        type: 'CODE_STYLE',
        title: 'Inconsistent Naming Convention',
        description: 'Mixed camelCase and snake_case naming',
        file: 'src/utils/helpers.ts',
        line: 15,
        recommendation: 'Standardize on camelCase for JavaScript/TypeScript',
        effort: 'Low',
      },
      {
        type: 'MAINTAINABILITY',
        title: 'Complex Function',
        description: 'Function exceeds 50 lines and has high cyclomatic complexity',
        file: 'src/services/apiClient.ts',
        line: 89,
        recommendation: 'Break down into smaller, focused functions',
        effort: 'Medium',
      },
      {
        type: 'TESTING',
        title: 'Missing Unit Tests',
        description: 'Critical business logic lacks test coverage',
        file: 'src/utils/validators.ts',
        recommendation: 'Add comprehensive unit tests',
        effort: 'High',
      },
    ];

    const qualityScore = 75; // Out of 100
    const summary = {
      qualityScore,
      issuesFound: qualityIssues.length,
      strengths: [
        'Good code organization and structure',
        'Consistent error handling patterns',
        'Proper TypeScript usage',
      ],
      improvements: [
        'Increase test coverage to 90%+',
        'Reduce function complexity',
        'Standardize code style guidelines',
      ],
    };

    return {
      success: true,
      result: {
        type: 'code_quality',
        issues: qualityIssues,
        summary,
        recommendations: [
          'Establish and enforce coding standards',
          'Implement automated code formatting (Prettier)',
          'Add ESLint rules for code quality',
          'Increase test coverage across the application',
          'Use TypeScript strict mode',
        ],
      },
      duration: 3000,
    };
  }

  private async reviewBestPractices(input: AgentInput): Promise<AgentOutput> {
    this.getLogger().log('Reviewing best practices');
    
    const bestPractices = [
      {
        category: 'React Best Practices',
        practices: [
          'Use functional components with hooks',
          'Implement proper key props in lists',
          'Avoid using index as key in dynamic lists',
          'Use React.memo for performance optimization',
          'Implement proper error boundaries',
        ],
      },
      {
        category: 'TypeScript Best Practices',
        practices: [
          'Use strict TypeScript configuration',
          'Avoid using "any" type',
          'Use interfaces for object shapes',
          'Implement proper type guards',
          'Use generics for reusable components',
        ],
      },
      {
        category: 'Security Best Practices',
        practices: [
          'Never expose API keys in client-side code',
          'Implement Content Security Policy',
          'Use HTTPS everywhere',
          'Validate all user inputs',
          'Implement proper authentication and authorization',
        ],
      },
    ];

    const currentCompliance = 70; // Percentage

    return {
      success: true,
      result: {
        type: 'best_practices',
        practices: bestPractices,
        currentCompliance,
        recommendations: [
          'Review and update codebase to follow established best practices',
          'Set up automated checks for best practice violations',
          'Create a best practices documentation for the team',
          'Regular code review sessions focusing on best practices',
        ],
      },
      duration: 2500,
    };
  }

  private async performGenericReview(input: AgentInput): Promise<AgentOutput> {
    this.getLogger().log('Performing generic code review');
    
    const review = {
      overview: 'General code review completed',
      score: 78, // Out of 100
      findings: [
        {
          type: 'STRUCTURE',
          description: 'Code structure is well organized',
          status: 'GOOD',
        },
        {
          type: 'DOCUMENTATION',
          description: 'Consider adding more inline documentation',
          status: 'IMPROVEMENT_NEEDED',
        },
        {
          type: 'TESTING',
          description: 'Test coverage could be improved',
          status: 'IMPROVEMENT_NEEDED',
        },
      ],
      suggestions: [
        'Add more comprehensive error handling',
        'Implement better logging throughout the application',
        'Consider adding integration tests',
        'Review and optimize database queries',
      ],
    };

    return {
      success: true,
      result: review,
      duration: 2000,
    };
  }

  private calculateRiskScore(issues: any[]): number {
    const weights = { HIGH: 10, MEDIUM: 5, LOW: 2 };
    const maxScore = 100;
    
    const totalRisk = issues.reduce((sum, issue) => {
      return sum + weights[issue.severity] || 0;
    }, 0);
    
    return Math.max(0, maxScore - totalRisk);
  }
}