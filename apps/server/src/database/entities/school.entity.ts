import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum SchoolRegion {
  LAGOS = 'Lagos',
  ABUJA = 'Abuja',
  KANO = 'Kano',
  RIVERS = 'Rivers',
  OYO = 'Oyo',
  ENUGU = 'Enugu',
}

export enum SchoolStatus {
  ACTIVE = 'active',
  NEEDS_ATTENTION = 'needs_attention',
}

@Entity('schools')
export class School {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', enum: SchoolRegion })
  region: SchoolRegion;

  @Column({ type: 'varchar', enum: SchoolStatus, default: SchoolStatus.ACTIVE })
  status: SchoolStatus;

  @Column({ type: 'varchar', nullable: true })
  curriculumVersionId: string;

  @Column({ type: 'timestamp', nullable: true })
  lastSyncAt: Date;

  @Column({ type: 'varchar', nullable: true })
  timezone: string;

  @Column({ type: 'varchar', nullable: true })
  academicYear: string;

  @Column({ type: 'varchar', nullable: true })
  currentTerm: string;

  @Column({ type: 'varchar', nullable: true })
  subject: string;

  @Column({ type: 'decimal', default: 0 })
  aiCapUsedPercent: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne('CurriculumVersion', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'curriculumVersionId' })
  curriculumVersion: any;

  @OneToMany('User', 'school')
  users: any[];

  @OneToMany('Class', 'school')
  classes: any[];

  @OneToOne('AiConfig', 'school')
  aiConfig: any;
}
