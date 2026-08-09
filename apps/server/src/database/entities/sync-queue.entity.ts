import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum SyncQueueStatus {
  QUEUED = 'queued',
  SYNCING = 'syncing',
  SYNCED = 'synced',
  FAILED = 'failed',
}

@Entity('sync_queue')
export class SyncQueue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  teacherId: string;

  @Column({ type: 'varchar', nullable: true })
  entityType: string;

  @Column({ type: 'varchar', nullable: true })
  entityId: string;

  @Column({ type: 'int', nullable: true })
  fileSizeKb: number;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'int', default: 1 })
  attempts: number;

  @Column({ type: 'varchar', enum: SyncQueueStatus, default: SyncQueueStatus.QUEUED })
  status: SyncQueueStatus;

  @Column({ type: 'timestamp', nullable: true })
  queuedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacherId' })
  teacher: any;
}
