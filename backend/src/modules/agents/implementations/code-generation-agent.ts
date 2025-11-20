import { Injectable } from '@nestjs/common';
import { BaseAgent } from '../base/base-agent';
import { AgentInput, AgentOutput } from '../interfaces/agent.interface';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentExecution } from '../../../database/entities/agent-execution.entity';

@Injectable()
export class CodeGenerationAgent extends BaseAgent {
  constructor(
    @InjectRepository(AgentExecution)
    agentExecutionRepo: Repository<AgentExecution>,
    private readonly configService: ConfigService,
  ) {
    super({
      name: 'CodeGenerationAgent',
      type: 'code_generation',
      enabled: true,
      role: 'developer',
      description: 'Generates frontend and backend code based on specifications',
      timeout: 120000,
      retryAttempts: 2,
      maxConcurrent: 3,
    }, agentExecutionRepo, configService, CodeGenerationAgent.name);
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const task = input.task.toLowerCase();

    try {
      if (task.includes('react') || task.includes('frontend')) {
        return await this.generateReactCode(input);
      } else if (task.includes('nest') || task.includes('backend')) {
        return await this.generateNestCode(input);
      } else if (task.includes('component')) {
        return await this.generateComponent(input);
      } else if (task.includes('api') || task.includes('endpoint')) {
        return await this.generateApiCode(input);
      } else {
        return await this.generateGenericCode(input);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        duration: 0,
      };
    }
  }

  private async generateReactCode(input: AgentInput): Promise<AgentOutput> {
    this.getLogger().log('Generating React code');
    
    const componentName = this.extractComponentName(input.task) || 'Component';
    
    const reactCode = `import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ${componentName}Props {
  title: string;
  children?: React.ReactNode;
}

export const ${componentName}: React.FC<${componentName}Props> = ({ 
  title, 
  children 
}) => {
  const [isActive, setIsActive] = useState(false);

  const handleToggle = () => {
    setIsActive(!isActive);
  };

  return (
    <motion.div 
      className={cn(
        "p-6 rounded-lg border transition-all duration-300",
        isActive ? "bg-primary-50 border-primary-200" : "bg-dark-800 border-dark-700"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-dark-100">
          {title}
        </h2>
        <button
          onClick={handleToggle}
          className="p-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition-colors"
        >
          {isActive ? 'Active' : 'Inactive'}
        </button>
      </div>
      
      <div className="text-dark-300">
        {children || 'Content area for ' + title}
      </div>
    </motion.div>
  );
};

export default ${componentName};`;

    const cssCode = `.${componentName.toLowerCase()} {
  display: flex;
  flex-direction: column;
  min-height: 200px;
}

.${componentName.toLowerCase()}-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: var(--dark-700);
}

.${componentName.toLowerCase()}-content {
  flex: 1;
  padding: 1rem;
  background-color: var(--dark-800);
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.${componentName.toLowerCase()}-content:hover {
  background-color: var(--dark-750);
}`;

    const testCode = `import { render, screen, fireEvent } from '@testing-library/react';
import { ${componentName} } from './${componentName}';

describe('${componentName}', () => {
  it('renders the component with title', () => {
    render(<${componentName} title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('toggles active state when button is clicked', () => {
    render(<${componentName} title="Test Title" />);
    const button = screen.getByRole('button');
    
    expect(button).toHaveTextContent('Inactive');
    
    fireEvent.click(button);
    expect(button).toHaveTextContent('Active');
  });
});`;

    return {
      success: true,
      result: {
        files: [
          {
            name: `${componentName}.tsx`,
            path: `src/components/${componentName}.tsx`,
            language: 'typescript',
            content: reactCode,
          },
          {
            name: `${componentName}.module.css`,
            path: `src/components/${componentName}.module.css`,
            language: 'css',
            content: cssCode,
          },
          {
            name: `${componentName}.test.tsx`,
            path: `src/components/${componentName}.test.tsx`,
            language: 'typescript',
            content: testCode,
          },
        ],
        summary: `Generated React component: ${componentName}`,
        dependencies: ['react', 'framer-motion'],
      },
      duration: 3000,
    };
  }

  private async generateNestCode(input: AgentInput): Promise<AgentOutput> {
    this.getLogger().log('Generating NestJS code');
    
    const serviceName = this.extractServiceName(input.task) || 'Service';
    
    const controllerCode = `import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ${serviceName}Service } from './${serviceName.toLowerCase()}.service';

@ApiTags('${serviceName.toLowerCase()}')
@Controller('api/${serviceName.toLowerCase()}')
export class ${serviceName}Controller {
  constructor(private readonly ${serviceName.toLowerCase()}Service: ${serviceName}Service) {}

  @Get()
  @ApiOperation({ summary: 'Get all ${serviceName.toLowerCase()}s' })
  @ApiResponse({ status: 200, description: 'Returns all ${serviceName.toLowerCase()}s' })
  async findAll() {
    return this.${serviceName.toLowerCase()}Service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ${serviceName.toLowerCase()} by ID' })
  @ApiResponse({ status: 200, description: 'Returns the ${serviceName.toLowerCase()}' })
  @ApiResponse({ status: 404, description: '${serviceName.toLowerCase()} not found' })
  async findOne(@Param('id') id: string) {
    return this.${serviceName.toLowerCase()}Service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new ${serviceName.toLowerCase()}' })
  @ApiResponse({ status: 201, description: '${serviceName.toLowerCase()} created successfully' })
  async create(@Body() create${serviceName}Dto: any) {
    return this.${serviceName.toLowerCase()}Service.create(create${serviceName}Dto);
  }
}`;

    const serviceCode = `import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ${serviceName}Service {
  constructor(
    @InjectRepository(${serviceName})
    private ${serviceName.toLowerCase()}Repository: Repository<${serviceName}>,
  ) {}

  async findAll(): Promise<${serviceName}[]> {
    return this.${serviceName.toLowerCase()}Repository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<${serviceName}> {
    const ${serviceName.toLowerCase()} = await this.${serviceName.toLowerCase()}Repository.findOne({
      where: { id },
    });

    if (!${serviceName.toLowerCase()}) {
      throw new NotFoundException(\`\${'${serviceName.toLowerCase()}'} with ID '\${id}' not found\`);
    }

    return ${serviceName.toLowerCase()};
  }

  async create(create${serviceName}Dto: any): Promise<${serviceName}> {
    const ${serviceName.toLowerCase()} = this.${serviceName.toLowerCase()}Repository.create(create${serviceName}Dto);
    return this.${serviceName.toLowerCase()}Repository.save(${serviceName.toLowerCase()});
  }

  async update(id: string, update${serviceName}Dto: any): Promise<${serviceName}> {
    const ${serviceName.toLowerCase()} = await this.findOne(id);
    Object.assign(${serviceName.toLowerCase()}, update${serviceName}Dto);
    return this.${serviceName.toLowerCase()}Repository.save(${serviceName.toLowerCase()});
  }

  async remove(id: string): Promise<void> {
    const ${serviceName.toLowerCase()} = await this.findOne(id);
    await this.${serviceName.toLowerCase()}Repository.remove(${serviceName.toLowerCase()});
  }
}`;

    return {
      success: true,
      result: {
        files: [
          {
            name: `${serviceName}Controller.ts`,
            path: `src/modules/${serviceName.toLowerCase()}/${serviceName.toLowerCase()}.controller.ts`,
            language: 'typescript',
            content: controllerCode,
          },
          {
            name: `${serviceName}Service.ts`,
            path: `src/modules/${serviceName.toLowerCase()}/${serviceName.toLowerCase()}.service.ts`,
            language: 'typescript',
            content: serviceCode,
          },
        ],
        summary: `Generated NestJS ${serviceName} with controller and service`,
        dependencies: ['@nestjs/common', '@nestjs/swagger', 'typeorm'],
      },
      duration: 2500,
    };
  }

  private async generateComponent(input: AgentInput): Promise<AgentOutput> {
    this.getLogger().log('Generating component');
    
    return await this.generateReactCode(input);
  }

  private async generateApiCode(input: AgentInput): Promise<AgentOutput> {
    this.getLogger().log('Generating API code');
    
    return await this.generateNestCode(input);
  }

  private async generateGenericCode(input: AgentInput): Promise<AgentOutput> {
    this.getLogger().log('Generating generic code');
    
    const genericCode = `// Generated code based on: ${input.task}
// This is a placeholder for generic code generation

export function generatedFunction() {
  console.log('Generated code for:', '${input.task}');
  return 'success';
}

// TODO: Customize this generated code based on specific requirements
`;

    return {
      success: true,
      result: {
        files: [
          {
            name: 'generated-code.ts',
            path: 'src/generated/generated-code.ts',
            language: 'typescript',
            content: genericCode,
          },
        ],
        summary: 'Generated generic code structure',
        recommendations: [
          'Provide more specific requirements',
          'Specify target framework or language',
          'Include component or service name',
        ],
      },
      duration: 1000,
    };
  }

  private extractComponentName(task: string): string | null {
    const match = task.match(/(?:create|generate|build)\s+(\w+)(?:\s+component)?/i);
    return match ? match[1] : null;
  }

  private extractServiceName(task: string): string | null {
    const match = task.match(/(?:create|generate|build)\s+(\w+)(?:\s+service)?/i);
    return match ? match[1] : null;
  }
}