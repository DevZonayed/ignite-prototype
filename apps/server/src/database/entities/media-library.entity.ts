import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

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

  @Column({ type: 'varchar', nullable: true })
  unitId: string;

  @Column({ type: 'timestamp', nullable: true })
  uploadedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne('Unit', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'unitId' })
  unit: any;
}
