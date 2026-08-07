import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum ProgressReportStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

export enum GeneratedBy {
  AI = 'ai',
  MANUAL = 'manual',
}

@Entity('progress_reports')
export class ProgressReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  childId: string;

  @Column({ type: 'varchar', nullable: true })
  term: string;

  @Column({ type: 'varchar', nullable: true })
  programme: string;

  @Column({ type: 'varchar', enum: ProgressReportStatus, default: ProgressReportStatus.DRAFT })
  status: ProgressReportStatus;

  @Column({ type: 'varchar', nullable: true })
  reviewedBy: string;

  @Column({ type: 'varchar', nullable: true })
  reviewedByRole: string;

  @Column({ type: 'text', nullable: true })
  whatWentWell: string;

  @Column({ type: 'simple-json', nullable: true })
  skillsGrowing: any[];

  @Column({ type: 'text', nullable: true })
  nextSteps: string;

  @Column({ type: 'varchar', enum: GeneratedBy, nullable: true })
  generatedBy: GeneratedBy;

  @Column({ type: 'datetime', nullable: true })
  publishedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne('User', 'progressReports', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'childId' })
  child: any;
}
