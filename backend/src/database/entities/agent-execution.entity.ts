import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('agent_executions')
export class AgentExecution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  agentType: string;

  @Column()
  agentName: string;

  @Column({
    type: 'enum',
    enum: ['queued', 'running', 'completed', 'failed', 'timeout'],
    default: 'queued',
  })
  status: 'queued' | 'running' | 'completed' | 'failed' | 'timeout';

  @Column('text')
  input: string;

  @Column('text', { nullable: true })
  output: string;

  @Column({ type: 'text', nullable: true })
  error: string;

  @Column()
  taskId: string;

  @Column({ nullable: true })
  projectId: string;

  @Column({ type: 'int', nullable: true })
  duration: number;

  @Column({ type: 'int', nullable: true })
  tokensUsed: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn()
  startedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;
}