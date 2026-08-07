import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

export enum ModelTier {
  SMALL = 'small',
  LARGE = 'large',
}

@Entity('ai_configs')
export class AiConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  schoolId: string;

  @Column({ type: 'varchar', enum: ModelTier, default: ModelTier.SMALL })
  modelTier: ModelTier;

  @Column({ type: 'int', default: 1000 })
  monthlyCallCap: number;

  @Column({ type: 'int', default: 0 })
  callsThisMonth: number;

  @Column({ type: 'decimal', default: 0 })
  estimatedSpend: number;

  @Column({ type: 'int', default: 0 })
  reportsPublished: number;

  @Column({ type: 'decimal', default: 0 })
  teacherReviewRate: number;

  @Column({ type: 'boolean', default: true })
  requireTeacherReview: boolean;

  @Column({ type: 'boolean', default: false })
  voiceToTextEnabled: boolean;

  @Column({ type: 'text', nullable: true })
  lessonAssistantScope: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne('School', 'aiConfig', { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'schoolId' })
  school: any;
}
