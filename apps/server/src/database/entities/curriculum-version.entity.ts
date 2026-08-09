import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum CurriculumVersionStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Entity('curriculum_versions')
export class CurriculumVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'varchar', enum: CurriculumVersionStatus, default: CurriculumVersionStatus.DRAFT })
  status: CurriculumVersionStatus;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @Column({ type: 'boolean', default: false })
  isImmutable: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany('Unit', 'curriculumVersion')
  units: any[];
}
