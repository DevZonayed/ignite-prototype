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

export enum LessonStatus {
  DONE = 'done',
  CURRENT = 'current',
  LOCKED = 'locked',
  PENDING = 'pending',
}

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  unitId: string;

  @Column({ type: 'int' })
  order: number;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar', enum: LessonStatus, default: LessonStatus.LOCKED })
  status: LessonStatus;

  @Column({ type: 'varchar', nullable: true })
  programme: string;

  @Column({ type: 'varchar', nullable: true })
  gradeLevel: string;

  @Column({ type: 'varchar', nullable: true })
  term: string;

  @Column({ type: 'varchar', nullable: true })
  week: string;

  @Column({ type: 'varchar', nullable: true })
  missionNumber: string;

  @Column({ type: 'int', nullable: true })
  durationMinutes: number;

  @Column({ type: 'varchar', nullable: true })
  theme: string;

  @Column({ type: 'text', nullable: true })
  realWorldProblem: string;

  @Column({ type: 'text', nullable: true })
  bigIdea: string;

  @Column({ type: 'text', nullable: true })
  essentialQuestion: string;

  @Column({ type: 'simple-json', nullable: true })
  learningOutcomes: string[];

  @Column({ type: 'simple-json', nullable: true })
  successCriteria: string[];

  @Column({ type: 'simple-json', nullable: true })
  keyVocabulary: any[];

  // NERDC fields
  @Column({ type: 'varchar', nullable: true })
  nerdcTheme: string;

  @Column({ type: 'varchar', nullable: true })
  nerdcTopic: string;

  @Column({ type: 'simple-json', nullable: true })
  nerdcObjectives: string[];

  // Component fields
  @Column({ type: 'text', nullable: true })
  inputComponent: string;

  @Column({ type: 'text', nullable: true })
  brainComponent: string;

  @Column({ type: 'text', nullable: true })
  outputComponent: string;

  @Column({ type: 'simple-json', nullable: true })
  kitComponents: any[];

  // Materials
  @Column({ type: 'simple-json', nullable: true })
  teacherMaterials: any[];

  @Column({ type: 'simple-json', nullable: true })
  learnerMaterials: any[];

  // Teaching content
  @Column({ type: 'text', nullable: true })
  introText: string;

  @Column({ type: 'simple-json', nullable: true })
  teachingPoints: any[];

  @Column({ type: 'simple-json', nullable: true })
  classActivities: any[];

  @Column({ type: 'text', nullable: true })
  infographicManual: string;

  // Engineering design
  @Column({ type: 'text', nullable: true })
  engineeringProblem: string;

  @Column({ type: 'text', nullable: true })
  engineeringInput: string;

  @Column({ type: 'text', nullable: true })
  engineeringBrain: string;

  @Column({ type: 'text', nullable: true })
  engineeringOutput: string;

  @Column({ type: 'text', nullable: true })
  engineeringSolution: string;

  // Home challenge
  @Column({ type: 'simple-json', nullable: true })
  homeChallenge: any;

  // Assessment
  @Column({ type: 'varchar', nullable: true })
  assessmentType: string;

  @Column({ type: 'varchar', nullable: true })
  assessmentScale: string;

  @Column({ type: 'varchar', nullable: true })
  assessmentDimension: string;

  @Column({ type: 'varchar', nullable: true })
  assessmentEvidenceType: string;

  @Column({ type: 'simple-json', nullable: true })
  assessmentQuestions: any[];

  @Column({ type: 'simple-json', nullable: true })
  observationChecklist: any[];

  @Column({ type: 'text', nullable: true })
  portfolioDescription: string;

  @Column({ type: 'varchar', nullable: true })
  portfolioLabel: string;

  // Other
  @Column({ type: 'text', nullable: true })
  coachingNotes: string;

  @Column({ type: 'int', default: 0 })
  progressPercent: number;

  @Column({ type: 'varchar', nullable: true })
  tools: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne('Unit', 'lessons', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'unitId' })
  unit: any;

  @OneToMany('LessonMedia', 'lesson')
  media: any[];

  @OneToMany('LessonStep', 'lesson')
  steps: any[];

  @OneToMany('LessonActivity', 'lesson')
  activities: any[];

  @OneToMany('LessonSession', 'lesson')
  sessions: any[];

  @OneToMany('Homework', 'lesson')
  homeworks: any[];

  @OneToMany('LqsScore', 'lesson')
  lqsScores: any[];

  @OneToMany('Assessment', 'lesson')
  assessments: any[];

  @OneToMany('Evidence', 'lesson')
  evidence: any[];

  @OneToMany('AiMessage', 'lesson')
  aiMessages: any[];
}
