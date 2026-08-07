import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum ProjectFileType {
  SCRATCH = 'scratch',
  PYTHON = 'python',
  ROBOTICS = 'robotics',
  DESIGN = 'design',
  VIDEO = 'video',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  lessonId: string;

  @Column({ type: 'varchar' })
  learnerId: string;

  @Column({ type: 'varchar', enum: ProjectFileType })
  fileType: ProjectFileType;

  @Column({ type: 'varchar', nullable: true })
  fileName: string;

  @Column({ type: 'varchar', nullable: true })
  fileUrl: string;

  @Column({ type: 'text', nullable: true })
  codeSnippet: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  skills: string;

  @Column({ type: 'varchar', nullable: true })
  term: string;

  @Column({ type: 'varchar', nullable: true })
  gradientStyle: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne('Lesson', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'lessonId' })
  lesson: any;

  @ManyToOne('User', 'projects', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'learnerId' })
  learner: any;
}
