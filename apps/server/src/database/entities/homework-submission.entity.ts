import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

export enum ReviewStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
}

@Entity('homework_submissions')
export class HomeworkSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  homeworkId: string;

  @Column({ type: 'varchar' })
  learnerId: string;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  fileType: string;

  @Column({ type: 'varchar', nullable: true })
  fileUrl: string;

  @Column({ type: 'varchar', nullable: true })
  fileName: string;

  @Column({ type: 'decimal', nullable: true })
  fileSizeMb: number;

  @Column({ type: 'varchar', enum: ReviewStatus, default: ReviewStatus.PENDING })
  reviewStatus: ReviewStatus;

  @Column({ type: 'timestamp', nullable: true })
  feedbackPublishedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne('Homework', 'submissions', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'homeworkId' })
  homework: any;

  @ManyToOne('User', 'homeworkSubmissions', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'learnerId' })
  learner: any;

  @OneToMany('HomeworkMessage', 'submission')
  messages: any[];
}
