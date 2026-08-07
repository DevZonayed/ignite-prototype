import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum BulkImportStatus {
  TEMPLATE = 'template',
  UPLOAD = 'upload',
  MAP = 'map',
  VALIDATE = 'validate',
  IMPORT = 'import',
  DONE = 'done',
}

@Entity('bulk_imports')
export class BulkImport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  schoolId: string;

  @Column({ type: 'varchar', enum: BulkImportStatus, default: BulkImportStatus.TEMPLATE })
  status: BulkImportStatus;

  @Column({ type: 'int', default: 0 })
  totalRows: number;

  @Column({ type: 'int', default: 0 })
  validRows: number;

  @Column({ type: 'int', default: 0 })
  errorCount: number;

  @Column({ type: 'simple-json', nullable: true })
  columnMapping: any;

  @Column({ type: 'simple-json', nullable: true })
  errors: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne('School', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'schoolId' })
  school: any;
}
