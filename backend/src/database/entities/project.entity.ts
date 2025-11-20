import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Task } from './task.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: ['frontend', 'backend', 'fullstack', 'desktop'],
    default: 'fullstack',
  })
  type: 'frontend' | 'backend' | 'fullstack' | 'desktop';

  @Column({ type: 'jsonb' })
  settings: any;

  @Column({ type: 'text' })
  code: string;

  @Column({
    type: 'enum',
    enum: ['planning', 'coding', 'reviewing', 'testing', 'deploying', 'completed'],
    default: 'planning',
  })
  status: 'planning' | 'coding' | 'reviewing' | 'testing' | 'deploying' | 'completed';

  @Column({ nullable: true })
  currentAgent: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];
}