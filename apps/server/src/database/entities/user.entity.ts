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

export enum UserRole {
  PLATFORM_ADMIN = 'platform_admin',
  CURRICULUM_ADMIN = 'curriculum_admin',
  PRINCIPAL = 'principal',
  TEACHER = 'teacher',
  LEARNER = 'learner',
  PARENT = 'parent',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive',
  INVITED = 'invited',
  DEACTIVATED = 'deactivated',
}

export enum ThemePreference {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', nullable: true })
  passwordHash: string | null;

  @Column({ type: 'varchar' })
  role: UserRole;

  @Column({ type: 'varchar' })
  firstName: string;

  @Column({ type: 'varchar' })
  lastName: string;

  @Column({ type: 'varchar', nullable: true })
  initials: string | null;

  @Column({ type: 'varchar', nullable: true })
  avatarBg: string | null;

  @Column({ type: 'varchar', nullable: true })
  avatarColor: string | null;

  @Column({ type: 'varchar', nullable: true })
  schoolId: string | null;

  @Column({ type: 'varchar', default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ type: 'varchar', unique: true, nullable: true })
  inviteCode: string | null;

  @Column({ type: 'varchar', nullable: true })
  otpCode: string | null;

  @Column({ type: 'datetime', nullable: true })
  otpExpiresAt: Date | null;

  // Password-reset OTP is kept separate from the step-up `otpCode` above so a
  // reset in progress cannot be clobbered by a step-up challenge (or vice versa).
  @Column({ type: 'varchar', nullable: true })
  passwordResetOtp: string | null;

  @Column({ type: 'datetime', nullable: true })
  passwordResetOtpExpiresAt: Date | null;

  @Column({ type: 'int', default: 0 })
  passwordResetOtpAttempts: number;

  @Column({ type: 'varchar', nullable: true })
  rememberToken: string | null;

  @Column({ type: 'varchar', nullable: true })
  resetToken: string | null;

  @Column({ type: 'datetime', nullable: true })
  resetTokenExpiresAt: Date | null;

  @Column({ type: 'varchar', default: ThemePreference.SYSTEM })
  themePreference: ThemePreference;

  @Column({ type: 'datetime', nullable: true })
  lastActiveAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  lastLoginAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  acceptedTermsAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne('School', 'users', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'schoolId' })
  school: any;

  @OneToMany('LessonSession', 'teacher')
  lessonSessions: any[];

  @OneToMany('Attendance', 'learner')
  attendanceRecords: any[];

  @OneToMany('HomeworkSubmission', 'learner')
  homeworkSubmissions: any[];

  @OneToMany('LqsScore', 'learner')
  lqsScores: any[];

  @OneToMany('Assessment', 'learner')
  assessments: any[];

  @OneToMany('Project', 'learner')
  projects: any[];

  @OneToMany('BadgeAward', 'learner')
  badgeAwards: any[];

  @OneToMany('Certificate', 'learner')
  certificates: any[];

  @OneToMany('Notification', 'user')
  notifications: any[];

  @OneToMany('AiMessage', 'user')
  aiMessages: any[];

  @OneToMany('Evidence', 'teacher')
  evidence: any[];

  @OneToMany('EvidenceTag', 'learner')
  evidenceTags: any[];

  @OneToMany('ParentChild', 'parent')
  parentLinks: any[];

  @OneToMany('ParentChild', 'child')
  childLinks: any[];

  @OneToMany('ProgressReport', 'child')
  progressReports: any[];

  @OneToMany('Announcement', 'postedBy')
  announcements: any[];
}
