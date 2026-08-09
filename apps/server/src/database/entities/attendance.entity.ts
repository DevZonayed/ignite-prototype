import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
}

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  lessonSessionId: string;

  @Column({ type: 'varchar' })
  learnerId: string;

  @Column({ type: 'varchar' })
  classId: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'varchar', enum: AttendanceStatus })
  status: AttendanceStatus;

  @Column({ type: 'timestamp', nullable: true })
  markedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne('LessonSession', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lessonSessionId' })
  lessonSession: any;

  @ManyToOne('User', 'attendanceRecords', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'learnerId' })
  learner: any;

  @ManyToOne('Class', 'attendanceRecords', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classId' })
  class: any;
}
