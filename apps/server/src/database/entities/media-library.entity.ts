import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { TIMESTAMP } from '../column-types';

export enum MediaLibraryType {
  MP4 = 'mp4',
  PDF = 'pdf',
  SB3 = 'sb3',
  PNG = 'png',
}

@Entity('media_library')
export class MediaLibrary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', enum: MediaLibraryType })
  type: MediaLibraryType;

  @Column({ type: 'varchar', nullable: true })
  fileName: string;

  // Where the bytes actually live, relative to the storage root. Null means the
  // record predates file storage (uploads used to be discarded entirely).
  @Column({ type: 'varchar', nullable: true })
  storageKey: string | null;

  @Column({ type: 'varchar', nullable: true })
  mimeType: string | null;

  @Column({ type: 'int', nullable: true })
  sizeBytes: number | null;

  @Column({ type: 'varchar', nullable: true })
  uploadedById: string | null;

  @Column({ type: 'varchar', nullable: true })
  unitId: string;

  @Column({ type: TIMESTAMP, nullable: true })
  uploadedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne('Unit', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'unitId' })
  unit: any;
}
