import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

export enum EvidenceMediaType {
  PHOTO = 'photo',
  VIDEO = 'video',
  CODE = 'code',
}

export enum EvidenceSyncStatus {
  QUEUED = 'queued',
  SYNCING = 'syncing',
  SYNCED = 'synced',
  FAILED = 'failed',
}

@Entity('evidence')
export class Evidence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  lessonId: string;

  @Column({ type: 'varchar' })
  classId: string;

  @Column({ type: 'varchar' })
  teacherId: string;

  @Column({ type: 'varchar', enum: EvidenceMediaType })
  mediaType: EvidenceMediaType;

  @Column({ type: 'varchar', nullable: true })
  fileUrl: string;

  @Column({ type: 'boolean', default: false })
  consentChecked: boolean;

  @Column({ type: 'varchar', enum: EvidenceSyncStatus, default: EvidenceSyncStatus.QUEUED })
  syncStatus: EvidenceSyncStatus;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne('Lesson', 'evidence', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lessonId' })
  lesson: any;

  @ManyToOne('Class', 'evidence', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classId' })
  class: any;

  @ManyToOne('User', 'evidence', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacherId' })
  teacher: any;

  @OneToMany('EvidenceTag', 'evidence')
  tags: any[];
}
