import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum SchoolReportType {
  COVERAGE_SUMMARY = 'coverage_summary',
  ATTENDANCE_REGISTER = 'attendance_register',
  PROJECT_COMPLETION = 'project_completion',
  TEACHER_ACTIVITY = 'teacher_activity',
}

@Entity('school_reports')
export class SchoolReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  schoolId: string;

  @Column({ type: 'varchar', enum: SchoolReportType })
  type: SchoolReportType;

  @Column({ type: 'varchar', nullable: true })
  term: string;

  @Column({ type: 'simple-json', nullable: true })
  data: any;

  @Column({ type: 'varchar', nullable: true })
  generatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne('School', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'schoolId' })
  school: any;
}
