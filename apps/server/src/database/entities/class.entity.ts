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

@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  gradeLevel: string;

  @Column({ type: 'varchar', nullable: true })
  subject: string;

  @Column({ type: 'varchar' })
  schoolId: string;

  // Nullable so a class outlives the teacher who led it: deleting a user sets
  // this to NULL (ON DELETE SET NULL) and the class shows as unassigned.
  @Column({ type: 'varchar', nullable: true })
  teacherId: string | null;

  @Column({ type: 'int', default: 0 })
  learnerCount: number;

  @Column({ type: 'decimal', default: 0 })
  curriculumCoveragePercent: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne('School', 'classes', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'schoolId' })
  school: any;

  @ManyToOne('User', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'teacherId' })
  teacher: any;

  @OneToMany('User', 'class')
  learners: any[];

  @OneToMany('LessonSession', 'class')
  lessonSessions: any[];

  @OneToMany('Attendance', 'class')
  attendanceRecords: any[];

  @OneToMany('Homework', 'class')
  homeworks: any[];

  @OneToMany('Evidence', 'class')
  evidence: any[];
}
