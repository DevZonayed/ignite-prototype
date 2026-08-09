import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum SyncStatus {
  SYNCING = 'syncing',
  SYNCED = 'synced',
}

@Entity('lesson_sessions')
export class LessonSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  lessonId: string;

  @Column({ type: 'varchar' })
  classId: string;

  @Column({ type: 'varchar' })
  teacherId: string;

  @Column({ type: 'timestamp' })
  startedAt: Date;

  @Column({ type: 'int', default: 0 })
  pausedDurationSeconds: number;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'int', default: 0 })
  elapsedSeconds: number;

  @Column({ type: 'varchar', nullable: true })
  reflection: string | null;

  @Column({ type: 'varchar', nullable: true })
  sentiment: string | null;

  @Column({ type: 'varchar', enum: SyncStatus, default: SyncStatus.SYNCING })
  syncStatus: SyncStatus;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne('Lesson', 'sessions', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lessonId' })
  lesson: any;

  @ManyToOne('Class', 'lessonSessions', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classId' })
  class: any;

  @ManyToOne('User', 'lessonSessions', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacherId' })
  teacher: any;
}
