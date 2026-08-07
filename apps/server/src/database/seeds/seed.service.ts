import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import {
  User,
  UserRole,
  UserStatus,
  School,
  SchoolRegion,
  SchoolStatus,
  Class,
  CurriculumVersion,
  CurriculumVersionStatus,
  Unit,
  UnitStatus,
  Lesson,
  LessonStatus,
  LessonMedia,
  MediaType,
  LessonActivity,
  LqsDimension,
  LqsScore,
  Badge,
  BadgeAward,
  Certificate,
  Project,
  ProjectFileType,
  ParentChild,
  VerificationStatus,
  Homework,
  HomeworkStatus,
  HomeworkSubmission,
  ReviewStatus,
  HomeworkMessage,
  SenderType,
  ProgressReport,
  ProgressReportStatus,
  GeneratedBy,
  AiConfig,
  ModelTier,
  AuditLog,
  AuditResult,
  Announcement,
  AnnouncementAudience,
} from '../../database/entities/index';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(School) private readonly schoolRepo: Repository<School>,
    @InjectRepository(Class) private readonly classRepo: Repository<Class>,
    @InjectRepository(CurriculumVersion) private readonly curriculumVersionRepo: Repository<CurriculumVersion>,
    @InjectRepository(Unit) private readonly unitRepo: Repository<Unit>,
    @InjectRepository(Lesson) private readonly lessonRepo: Repository<Lesson>,
    @InjectRepository(LessonMedia) private readonly lessonMediaRepo: Repository<LessonMedia>,
    @InjectRepository(LessonActivity) private readonly lessonActivityRepo: Repository<LessonActivity>,
    @InjectRepository(LqsDimension) private readonly lqsDimensionRepo: Repository<LqsDimension>,
    @InjectRepository(LqsScore) private readonly lqsScoreRepo: Repository<LqsScore>,
    @InjectRepository(Badge) private readonly badgeRepo: Repository<Badge>,
    @InjectRepository(BadgeAward) private readonly badgeAwardRepo: Repository<BadgeAward>,
    @InjectRepository(Certificate) private readonly certificateRepo: Repository<Certificate>,
    @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
    @InjectRepository(ParentChild) private readonly parentChildRepo: Repository<ParentChild>,
    @InjectRepository(Homework) private readonly homeworkRepo: Repository<Homework>,
    @InjectRepository(HomeworkSubmission) private readonly homeworkSubmissionRepo: Repository<HomeworkSubmission>,
    @InjectRepository(HomeworkMessage) private readonly homeworkMessageRepo: Repository<HomeworkMessage>,
    @InjectRepository(ProgressReport) private readonly progressReportRepo: Repository<ProgressReport>,
    @InjectRepository(AiConfig) private readonly aiConfigRepo: Repository<AiConfig>,
    @InjectRepository(AuditLog) private readonly auditLogRepo: Repository<AuditLog>,
    @InjectRepository(Announcement) private readonly announcementRepo: Repository<Announcement>,
  ) {}

  async seed(): Promise<void> {
    const userCount = await this.userRepo.count();
    if (userCount > 0) {
      this.logger.log('Database already seeded — skipping.');
      return;
    }

    this.logger.log('Seeding database...');
    const passwordHash = await bcrypt.hash('ignite123', 10);

    // ── 1. Curriculum Version ──────────────────────────────────────────
    this.logger.log('Seeding curriculum version...');
    const curriculumV4 = await this.curriculumVersionRepo.save(
      this.curriculumVersionRepo.create({
        name: 'IGNITE Curriculum',
        version: 4,
        status: CurriculumVersionStatus.PUBLISHED,
        publishedAt: new Date('2026-03-01'),
        isImmutable: true,
      }),
    );

    // ── 2. Schools ─────────────────────────────────────────────────────
    this.logger.log('Seeding schools...');
    const schoolData: { name: string; region: SchoolRegion }[] = [
      { name: 'Bright Future Academy', region: SchoolRegion.LAGOS },
      { name: 'Unity College', region: SchoolRegion.ABUJA },
      { name: 'Hillcrest Schools', region: SchoolRegion.LAGOS },
      { name: 'Greenfield Model', region: SchoolRegion.KANO },
      { name: 'Sunrise International', region: SchoolRegion.RIVERS },
      { name: 'Cornerstone Academy', region: SchoolRegion.LAGOS },
      { name: 'Royal Heritage', region: SchoolRegion.ABUJA },
      { name: 'Peace Model School', region: SchoolRegion.OYO },
      { name: 'New Era College', region: SchoolRegion.LAGOS },
      { name: 'Little Stars School', region: SchoolRegion.ENUGU },
      { name: 'Excel Academy', region: SchoolRegion.LAGOS },
      { name: 'Trinity International', region: SchoolRegion.ABUJA },
      { name: 'Grace Foundation', region: SchoolRegion.KANO },
      { name: 'Kings & Queens', region: SchoolRegion.LAGOS },
      { name: 'Pathfinder School', region: SchoolRegion.RIVERS },
      { name: 'Beacon Light', region: SchoolRegion.LAGOS },
      { name: 'Crown Academy', region: SchoolRegion.ABUJA },
      { name: 'Harmony Schools', region: SchoolRegion.LAGOS },
      { name: 'Nobel Model', region: SchoolRegion.OYO },
      { name: 'Zenith College', region: SchoolRegion.LAGOS },
    ];

    const schools: School[] = [];
    for (const s of schoolData) {
      const school = await this.schoolRepo.save(
        this.schoolRepo.create({
          name: s.name,
          region: s.region,
          status: SchoolStatus.ACTIVE,
          curriculumVersionId: curriculumV4.id,
          timezone: 'Africa/Lagos',
          academicYear: '2025/2026',
          currentTerm: 'T3',
          subject: 'Coding & Robotics',
          lastSyncAt: new Date('2026-07-30T08:00:00Z'),
        }),
      );
      schools.push(school);
    }

    const schoolByName = (name: string): School => {
      const found = schools.find((s) => s.name === name);
      if (!found) throw new Error(`School not found: ${name}`);
      return found;
    };

    const brightFuture = schoolByName('Bright Future Academy');
    const unityCollege = schoolByName('Unity College');
    const hillcrest = schoolByName('Hillcrest Schools');
    const greenfield = schoolByName('Greenfield Model');

    // ── 3. Users ───────────────────────────────────────────────────────
    this.logger.log('Seeding users...');

    const makeUser = async (data: {
      firstName: string;
      lastName: string;
      email: string;
      role: UserRole;
      schoolId?: string | null;
      status?: UserStatus;
      initials?: string;
      avatarBg?: string;
      avatarColor?: string;
    }): Promise<User> => {
      return this.userRepo.save(
        this.userRepo.create({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          passwordHash,
          role: data.role,
          schoolId: data.schoolId ?? null,
          status: data.status ?? UserStatus.ACTIVE,
          initials: data.initials ?? `${data.firstName[0]}${data.lastName[0]}`,
          avatarBg: data.avatarBg ?? '#6366F1',
          avatarColor: data.avatarColor ?? '#FFFFFF',
          acceptedTermsAt: new Date('2026-01-15'),
          lastLoginAt: new Date('2026-07-30T09:00:00Z'),
          lastActiveAt: new Date('2026-07-30T09:30:00Z'),
        }),
      );
    };

    // Platform & curriculum admins
    const zonayed = await makeUser({
      firstName: 'Zonayed',
      lastName: 'Ahamad',
      email: 'zonayed@ignite.edu.ng',
      role: UserRole.PLATFORM_ADMIN,
      avatarBg: '#DC2626',
    });

    const emeka = await makeUser({
      firstName: 'Emeka',
      lastName: 'Obi',
      email: 'emeka.obi@ignite.edu.ng',
      role: UserRole.CURRICULUM_ADMIN,
      avatarBg: '#7C3AED',
    });

    // Teachers
    const funke = await makeUser({
      firstName: 'Funke',
      lastName: 'Okafor',
      email: 'funke.okafor@ignite.edu.ng',
      role: UserRole.TEACHER,
      schoolId: brightFuture.id,
      avatarBg: '#16A34A',
    });

    const adewale = await makeUser({
      firstName: 'Adewale',
      lastName: 'Balogun',
      email: 'adewale.balogun@ignite.edu.ng',
      role: UserRole.TEACHER,
      schoolId: brightFuture.id,
      avatarBg: '#2563EB',
    });

    const chineduTeacher = await makeUser({
      firstName: 'Chinedu',
      lastName: 'Nwosu',
      email: 'chinedu.nwosu@ignite.edu.ng',
      role: UserRole.TEACHER,
      schoolId: hillcrest.id,
      status: UserStatus.SUSPENDED,
      avatarBg: '#DC2626',
    });

    const aisha = await makeUser({
      firstName: 'Aisha',
      lastName: 'Bello',
      email: 'aisha.bello@ignite.edu.ng',
      role: UserRole.TEACHER,
      schoolId: greenfield.id,
      avatarBg: '#EC4899',
    });

    const ibrahim = await makeUser({
      firstName: 'Ibrahim',
      lastName: 'Musa',
      email: 'ibrahim.musa@ignite.edu.ng',
      role: UserRole.TEACHER,
      schoolId: brightFuture.id,
      status: UserStatus.INACTIVE,
      avatarBg: '#F59E0B',
    });

    // Principal
    const ngoziBello = await makeUser({
      firstName: 'Ngozi',
      lastName: 'Bello',
      email: 'ngozi.bello@ignite.edu.ng',
      role: UserRole.PRINCIPAL,
      schoolId: unityCollege.id,
      avatarBg: '#0891B2',
    });

    // Parent
    const tundeEze = await makeUser({
      firstName: 'Tunde',
      lastName: 'Eze',
      email: 'tunde.eze@parent.ignite.edu.ng',
      role: UserRole.PARENT,
      avatarBg: '#14B8A6',
    });

    // Learners
    const amaraEze = await makeUser({
      firstName: 'Amara',
      lastName: 'Eze',
      email: 'amara.eze@learner.ignite.edu.ng',
      role: UserRole.LEARNER,
      schoolId: brightFuture.id,
      avatarBg: '#EC4899',
    });

    const chidiOkonkwo = await makeUser({
      firstName: 'Chidi',
      lastName: 'Okonkwo',
      email: 'chidi.okonkwo@learner.ignite.edu.ng',
      role: UserRole.LEARNER,
      schoolId: brightFuture.id,
      avatarBg: '#2563EB',
    });

    const ngoziAdeyemi = await makeUser({
      firstName: 'Ngozi',
      lastName: 'Adeyemi',
      email: 'ngozi.adeyemi@learner.ignite.edu.ng',
      role: UserRole.LEARNER,
      schoolId: brightFuture.id,
      avatarBg: '#7C3AED',
    });

    const emekaNwosu = await makeUser({
      firstName: 'Emeka',
      lastName: 'Nwosu',
      email: 'emeka.nwosu@learner.ignite.edu.ng',
      role: UserRole.LEARNER,
      schoolId: brightFuture.id,
      avatarBg: '#16A34A',
    });

    const fatimaSani = await makeUser({
      firstName: 'Fatima',
      lastName: 'Sani',
      email: 'fatima.sani@learner.ignite.edu.ng',
      role: UserRole.LEARNER,
      schoolId: brightFuture.id,
      avatarBg: '#F59E0B',
    });

    const tundeAdeyemi = await makeUser({
      firstName: 'Tunde',
      lastName: 'Adeyemi',
      email: 'tunde.adeyemi@learner.ignite.edu.ng',
      role: UserRole.LEARNER,
      schoolId: brightFuture.id,
      avatarBg: '#0891B2',
    });

    const zainabYusuf = await makeUser({
      firstName: 'Zainab',
      lastName: 'Yusuf',
      email: 'zainab.yusuf@learner.ignite.edu.ng',
      role: UserRole.LEARNER,
      schoolId: brightFuture.id,
      avatarBg: '#14B8A6',
    });

    const kelechiEze = await makeUser({
      firstName: 'Kelechi',
      lastName: 'Eze',
      email: 'kelechi.eze@learner.ignite.edu.ng',
      role: UserRole.LEARNER,
      schoolId: brightFuture.id,
      avatarBg: '#6366F1',
    });

    // ── 4. Classes ─────────────────────────────────────────────────────
    this.logger.log('Seeding classes...');

    const classJSS1 = await this.classRepo.save(
      this.classRepo.create({
        name: 'JSS 1',
        gradeLevel: 'JSS 1',
        subject: 'Coding & Robotics',
        schoolId: brightFuture.id,
        teacherId: funke.id,
        learnerCount: 32,
        curriculumCoveragePercent: 78,
      }),
    );

    const classJSS2 = await this.classRepo.save(
      this.classRepo.create({
        name: 'JSS 2',
        gradeLevel: 'JSS 2',
        subject: 'Coding & Robotics',
        schoolId: brightFuture.id,
        teacherId: adewale.id,
        learnerCount: 28,
        curriculumCoveragePercent: 65,
      }),
    );

    const classJSS3 = await this.classRepo.save(
      this.classRepo.create({
        name: 'JSS 3',
        gradeLevel: 'JSS 3',
        subject: 'Coding & Robotics',
        schoolId: brightFuture.id,
        teacherId: funke.id,
        learnerCount: 30,
        curriculumCoveragePercent: 52,
      }),
    );

    const classP4 = await this.classRepo.save(
      this.classRepo.create({
        name: 'P 4',
        gradeLevel: 'Primary 4',
        subject: 'Coding & Robotics',
        schoolId: brightFuture.id,
        teacherId: adewale.id,
        learnerCount: 35,
        curriculumCoveragePercent: 80,
      }),
    );

    const classP5 = await this.classRepo.save(
      this.classRepo.create({
        name: 'P 5',
        gradeLevel: 'Primary 5',
        subject: 'Coding & Robotics',
        schoolId: brightFuture.id,
        teacherId: ibrahim.id,
        learnerCount: 30,
        curriculumCoveragePercent: 72,
      }),
    );

    const classP6 = await this.classRepo.save(
      this.classRepo.create({
        name: 'P 6',
        gradeLevel: 'Primary 6',
        subject: 'Coding & Robotics',
        schoolId: brightFuture.id,
        teacherId: funke.id,
        learnerCount: 27,
        curriculumCoveragePercent: 85,
      }),
    );

    // ── 5. Units & Lessons ─────────────────────────────────────────────
    this.logger.log('Seeding units and lessons...');

    // Unit 1: Getting Started with Scratch (4 lessons, done)
    const unit1 = await this.unitRepo.save(
      this.unitRepo.create({
        curriculumVersionId: curriculumV4.id,
        order: 1,
        title: 'Getting Started with Scratch',
        status: UnitStatus.DONE,
      }),
    );

    const unit1Lessons = [
      'What is Scratch?',
      'The Scratch Interface',
      'Your First Sprite',
      'Saving & Sharing Projects',
    ];
    for (let i = 0; i < unit1Lessons.length; i++) {
      await this.lessonRepo.save(
        this.lessonRepo.create({
          unitId: unit1.id,
          order: i + 1,
          title: unit1Lessons[i],
          status: LessonStatus.DONE,
          progressPercent: 100,
        }),
      );
    }

    // Unit 2: Sprites & Events (4 lessons, done)
    const unit2 = await this.unitRepo.save(
      this.unitRepo.create({
        curriculumVersionId: curriculumV4.id,
        order: 2,
        title: 'Sprites & Events',
        status: UnitStatus.DONE,
      }),
    );

    const unit2Lessons = [
      'Adding Multiple Sprites',
      'Costume Changes',
      'Events & Broadcasts',
      'Interactive Stories',
    ];
    for (let i = 0; i < unit2Lessons.length; i++) {
      await this.lessonRepo.save(
        this.lessonRepo.create({
          unitId: unit2.id,
          order: i + 1,
          title: unit2Lessons[i],
          status: LessonStatus.DONE,
          progressPercent: 100,
        }),
      );
    }

    // Unit 3: Loops & Motion (6 lessons, done)
    const unit3 = await this.unitRepo.save(
      this.unitRepo.create({
        curriculumVersionId: curriculumV4.id,
        order: 3,
        title: 'Loops & Motion',
        status: UnitStatus.DONE,
      }),
    );

    const unit3Lessons = [
      'Repeat Blocks',
      'Forever Loops',
      'Glide & Move',
      'Pen Drawing',
      'Maze Navigation',
      'Loop Challenges',
    ];
    for (let i = 0; i < unit3Lessons.length; i++) {
      await this.lessonRepo.save(
        this.lessonRepo.create({
          unitId: unit3.id,
          order: i + 1,
          title: unit3Lessons[i],
          status: LessonStatus.DONE,
          progressPercent: 100,
        }),
      );
    }

    // Unit 4: Intro to Python (4 lessons, done)
    const unit4 = await this.unitRepo.save(
      this.unitRepo.create({
        curriculumVersionId: curriculumV4.id,
        order: 4,
        title: 'Intro to Python',
        status: UnitStatus.DONE,
      }),
    );

    const unit4Lessons = [
      'Hello World in Python',
      'Variables & Input',
      'If-Else Decisions',
      'Simple Loops in Python',
    ];
    for (let i = 0; i < unit4Lessons.length; i++) {
      await this.lessonRepo.save(
        this.lessonRepo.create({
          unitId: unit4.id,
          order: i + 1,
          title: unit4Lessons[i],
          status: LessonStatus.DONE,
          progressPercent: 100,
        }),
      );
    }

    // Unit 5: Robotics - Little Genius Lab (6 lessons, 5 done + 1 current)
    const unit5 = await this.unitRepo.save(
      this.unitRepo.create({
        curriculumVersionId: curriculumV4.id,
        order: 5,
        title: 'Robotics · Little Genius Lab™',
        status: UnitStatus.CURRENT,
      }),
    );

    // Lessons 1-4 (done)
    const unit5DoneTitles = [
      'Meet Your Arduino',
      'LED Blink Challenge',
      'Sensors & Input',
      'Servo Motor Control',
    ];
    for (let i = 0; i < unit5DoneTitles.length; i++) {
      await this.lessonRepo.save(
        this.lessonRepo.create({
          unitId: unit5.id,
          order: i + 1,
          title: unit5DoneTitles[i],
          status: LessonStatus.DONE,
          progressPercent: 100,
          programme: 'Little Genius Robotics Lab™',
        }),
      );
    }

    // Lesson 5 (current) — Build a Smart Reading Lamp — full detail
    const smartLampLesson = await this.lessonRepo.save(
      this.lessonRepo.create({
        unitId: unit5.id,
        order: 5,
        title: 'Build a Smart Reading Lamp',
        status: LessonStatus.CURRENT,
        programme: 'Little Genius Robotics Lab™',
        gradeLevel: 'Primary 3',
        term: 'T3',
        week: '5',
        missionNumber: '5',
        durationMinutes: 90,
        essentialQuestion: 'How can we design a lamp that responds to light levels?',
        kitComponents: [
          { name: 'Arduino UNO', qty: 1 },
          { name: 'Breadboard', qty: 1 },
          { name: 'USB cable', qty: 1 },
          { name: 'LED', qty: 1 },
          { name: '220Ω resistor', qty: 1 },
          { name: 'LDR sensor', qty: 1 },
          { name: 'Push-button switch', qty: 1 },
        ],
        progressPercent: 40,
      }),
    );

    // 6 media items for the Smart Reading Lamp lesson
    const mediaItems: { title: string; duration: string; type: MediaType; order: number }[] = [
      { title: 'Components overview', duration: '2:40', type: MediaType.MP4, order: 1 },
      { title: 'Wiring the breadboard', duration: '3:15', type: MediaType.MP4, order: 2 },
      { title: 'Writing PictoBlox program', duration: '4:05', type: MediaType.MP4, order: 3 },
      { title: 'Uploading to Arduino', duration: '1:50', type: MediaType.MP4, order: 4 },
      { title: 'Testing your lamp', duration: '2:20', type: MediaType.MP4, order: 5 },
      { title: 'Challenge: 5-second timer', duration: '2:35', type: MediaType.MP4, order: 6 },
    ];
    for (const m of mediaItems) {
      await this.lessonMediaRepo.save(
        this.lessonMediaRepo.create({
          lessonId: smartLampLesson.id,
          type: m.type,
          title: m.title,
          duration: m.duration,
          order: m.order,
        }),
      );
    }

    // 4 activities for the Smart Reading Lamp lesson
    const activityTitles = [
      'Build working loop',
      'Run sprite',
      'Add costume change',
      'Save .sb3 project',
    ];
    for (let a = 0; a < activityTitles.length; a++) {
      await this.lessonActivityRepo.save(
        this.lessonActivityRepo.create({
          lessonId: smartLampLesson.id,
          title: activityTitles[a],
          orderIndex: a + 1,
        }),
      );
    }

    // Lesson 6 (locked)
    await this.lessonRepo.save(
      this.lessonRepo.create({
        unitId: unit5.id,
        order: 6,
        title: 'Robotics Showcase Prep',
        status: LessonStatus.LOCKED,
        progressPercent: 0,
        programme: 'Little Genius Robotics Lab™',
      }),
    );

    // ── 6. LQS Dimensions ─────────────────────────────────────────────
    this.logger.log('Seeding LQS dimensions...');

    const dimensionData: { name: string; color: string; weight: number }[] = [
      { name: 'Coding', color: '#2563EB', weight: 15 },
      { name: 'Creativity', color: '#7C3AED', weight: 10 },
      { name: 'Collaboration', color: '#14B8A6', weight: 10 },
      { name: 'Communication', color: '#EC4899', weight: 10 },
      { name: 'Critical Thinking', color: '#0891B2', weight: 10 },
      { name: 'Problem Solving', color: '#16A34A', weight: 10 },
      { name: 'Attendance', color: '#F59E0B', weight: 10 },
      { name: 'Digital Literacy', color: '#6366F1', weight: 10 },
      { name: 'Robotics', color: '#E11D48', weight: 8 },
      { name: 'STEAM', color: '#059669', weight: 7 },
    ];

    const dimensions: LqsDimension[] = [];
    for (const d of dimensionData) {
      const dim = await this.lqsDimensionRepo.save(
        this.lqsDimensionRepo.create({
          name: d.name,
          color: d.color,
          weight: d.weight,
        }),
      );
      dimensions.push(dim);
    }

    const dimByName = (name: string): LqsDimension => {
      const found = dimensions.find((d) => d.name === name);
      if (!found) throw new Error(`Dimension not found: ${name}`);
      return found;
    };

    // ── 7. LQS Scores for Amara Eze ───────────────────────────────────
    this.logger.log('Seeding LQS scores for Amara Eze...');

    const amaraScores: { dimensionName: string; score: number }[] = [
      { dimensionName: 'Coding', score: 85 },
      { dimensionName: 'Creativity', score: 90 },
      { dimensionName: 'Collaboration', score: 70 },
      { dimensionName: 'Communication', score: 75 },
      { dimensionName: 'Critical Thinking', score: 65 },
      { dimensionName: 'Problem Solving', score: 80 },
      { dimensionName: 'Attendance', score: 95 },
      { dimensionName: 'Digital Literacy', score: 85 },
      { dimensionName: 'Robotics', score: 60 },
      { dimensionName: 'STEAM', score: 70 },
    ];

    for (const s of amaraScores) {
      await this.lqsScoreRepo.save(
        this.lqsScoreRepo.create({
          learnerId: amaraEze.id,
          dimensionId: dimByName(s.dimensionName).id,
          score: s.score,
          term: 'T2',
          savedAt: new Date('2026-06-15'),
        }),
      );
    }

    // ── 8. Badges ──────────────────────────────────────────────────────
    this.logger.log('Seeding badges...');

    const badgeFirstScratch = await this.badgeRepo.save(
      this.badgeRepo.create({
        name: 'First Scratch',
        description: '1st .sb3 saved',
        iconType: 'scratch',
        triggerRule: 'first_sb3_save',
      }),
    );

    const badgeLoopMaster = await this.badgeRepo.save(
      this.badgeRepo.create({
        name: 'Loop Master',
        description: 'Loops project done',
        iconType: 'loop',
        triggerRule: 'loops_project_complete',
      }),
    );

    const badgeRoboticsRookie = await this.badgeRepo.save(
      this.badgeRepo.create({
        name: 'Robotics Rookie',
        description: '1st robotics build',
        iconType: 'robotics',
        triggerRule: 'first_robotics_build',
      }),
    );

    const badgePythonStarter = await this.badgeRepo.save(
      this.badgeRepo.create({
        name: 'Python Starter',
        description: '1st .py program',
        iconType: 'python',
        triggerRule: 'first_py_program',
      }),
    );

    // ── 9. Projects for Amara ──────────────────────────────────────────
    this.logger.log('Seeding projects for Amara Eze...');

    const projectMazeGame = await this.projectRepo.save(
      this.projectRepo.create({
        title: 'Maze Game',
        learnerId: amaraEze.id,
        fileType: ProjectFileType.SCRATCH,
        fileName: 'maze.sb3',
        term: 'T1',
        gradientStyle: 'from-blue-500 to-purple-500',
      }),
    );

    const projectNumberGuesser = await this.projectRepo.save(
      this.projectRepo.create({
        title: 'Number Guesser',
        learnerId: amaraEze.id,
        fileType: ProjectFileType.PYTHON,
        fileName: 'guess.py',
        term: 'T2',
        gradientStyle: 'from-green-500 to-teal-500',
      }),
    );

    const projectLineRobot = await this.projectRepo.save(
      this.projectRepo.create({
        title: 'Line Robot',
        learnerId: amaraEze.id,
        fileType: ProjectFileType.ROBOTICS,
        fileName: 'build',
        term: 'T2',
        gradientStyle: 'from-red-500 to-orange-500',
      }),
    );

    const projectDigitalHero = await this.projectRepo.save(
      this.projectRepo.create({
        title: 'My Digital Hero',
        learnerId: amaraEze.id,
        fileType: ProjectFileType.DESIGN,
        fileName: 'poster',
        term: 'T1',
        gradientStyle: 'from-pink-500 to-rose-500',
      }),
    );

    const projectCatchStar = await this.projectRepo.save(
      this.projectRepo.create({
        title: 'Catch the Star',
        learnerId: amaraEze.id,
        fileType: ProjectFileType.SCRATCH,
        fileName: 'game.sb3',
        term: 'T2',
        gradientStyle: 'from-yellow-500 to-amber-500',
      }),
    );

    const projectRobotDemo = await this.projectRepo.save(
      this.projectRepo.create({
        title: 'Robot Demo',
        learnerId: amaraEze.id,
        fileType: ProjectFileType.VIDEO,
        fileName: 'demo.mp4',
        term: 'T3',
        gradientStyle: 'from-cyan-500 to-blue-500',
      }),
    );

    // ── 10. Badge Awards for Amara ─────────────────────────────────────
    this.logger.log('Seeding badge awards for Amara Eze...');

    await this.badgeAwardRepo.save(
      this.badgeAwardRepo.create({
        badgeId: badgeFirstScratch.id,
        learnerId: amaraEze.id,
        linkedProjectId: projectMazeGame.id,
        awardedAt: new Date('2026-02-10'),
      }),
    );

    await this.badgeAwardRepo.save(
      this.badgeAwardRepo.create({
        badgeId: badgeLoopMaster.id,
        learnerId: amaraEze.id,
        linkedProjectId: projectCatchStar.id,
        awardedAt: new Date('2026-04-22'),
      }),
    );

    await this.badgeAwardRepo.save(
      this.badgeAwardRepo.create({
        badgeId: badgeRoboticsRookie.id,
        learnerId: amaraEze.id,
        linkedProjectId: projectLineRobot.id,
        awardedAt: new Date('2026-05-15'),
      }),
    );

    await this.badgeAwardRepo.save(
      this.badgeAwardRepo.create({
        badgeId: badgePythonStarter.id,
        learnerId: amaraEze.id,
        linkedProjectId: projectNumberGuesser.id,
        awardedAt: new Date('2026-03-28'),
      }),
    );

    // ── 11. Certificate for Amara ──────────────────────────────────────
    this.logger.log('Seeding certificate for Amara Eze...');

    await this.certificateRepo.save(
      this.certificateRepo.create({
        id: 'IGN-2026-0148',
        learnerId: amaraEze.id,
        course: 'Digital Innovation',
        term: 'Term 2',
        school: 'Bright Future Academy',
        issueDate: '2026-06-28',
        verifiedId: 'IGN-2026-0148',
      }),
    );

    // ── 12. Parent-Child Links ─────────────────────────────────────────
    this.logger.log('Seeding parent-child links...');

    await this.parentChildRepo.save(
      this.parentChildRepo.create({
        parentId: tundeEze.id,
        childId: amaraEze.id,
        verificationStatus: VerificationStatus.VERIFIED,
      }),
    );

    await this.parentChildRepo.save(
      this.parentChildRepo.create({
        parentId: tundeEze.id,
        childId: kelechiEze.id,
        verificationStatus: VerificationStatus.VERIFIED,
      }),
    );

    // ── 13. Homework ───────────────────────────────────────────────────
    this.logger.log('Seeding homework...');

    const homework = await this.homeworkRepo.save(
      this.homeworkRepo.create({
        lessonId: smartLampLesson.id,
        classId: classJSS1.id,
        title: 'Smart Reading Lamp',
        instructions:
          'Build the Smart Reading Lamp circuit using your Arduino kit. Take a photo of your completed build and upload a short video showing the LDR sensor reacting to light changes.',
        dueDate: '2026-07-18',
        publishedAt: new Date('2026-07-11T08:00:00Z'),
        status: HomeworkStatus.PUBLISHED,
      }),
    );

    // Submission from Amara
    const submission = await this.homeworkSubmissionRepo.save(
      this.homeworkSubmissionRepo.create({
        homeworkId: homework.id,
        learnerId: amaraEze.id,
        submittedAt: new Date('2026-07-15T14:30:00Z'),
        fileType: 'mp4',
        fileName: 'amara_smart_lamp.mp4',
        fileSizeMb: 12.4,
        reviewStatus: ReviewStatus.REVIEWED,
        feedbackPublishedAt: new Date('2026-07-16T09:00:00Z'),
      }),
    );

    // Messages on the submission
    await this.homeworkMessageRepo.save(
      this.homeworkMessageRepo.create({
        submissionId: submission.id,
        senderType: SenderType.TEACHER,
        senderName: 'Mrs. Okafor',
        body: 'Great work, Amara! Your LDR sensor placement is perfect. Try adding a 5-second delay before the LED turns off for a bonus challenge.',
      }),
    );

    await this.homeworkMessageRepo.save(
      this.homeworkMessageRepo.create({
        submissionId: submission.id,
        senderType: SenderType.PARENT,
        senderName: 'Mr. Eze',
        body: 'Thank you, Mrs. Okafor. Amara really enjoyed this project. She has been explaining how sensors work to her younger brother!',
      }),
    );

    // ── 14. Progress Report for Amara ──────────────────────────────────
    this.logger.log('Seeding progress report for Amara Eze...');

    await this.progressReportRepo.save(
      this.progressReportRepo.create({
        childId: amaraEze.id,
        term: 'Term 2',
        programme: 'IGNITE Coding & Robotics',
        status: ProgressReportStatus.PUBLISHED,
        reviewedBy: 'Mrs. Okafor',
        reviewedByRole: 'teacher',
        whatWentWell:
          'Amara builds Scratch loops confidently and explains her code clearly.',
        skillsGrowing: ['Coding', 'Creativity', 'Digital Literacy'],
        nextSteps: 'Try a simple robotics motor loop at home.',
        generatedBy: GeneratedBy.AI,
        publishedAt: new Date('2026-06-30'),
      }),
    );

    // ── 15. AI Config ──────────────────────────────────────────────────
    this.logger.log('Seeding AI config...');

    await this.aiConfigRepo.save(
      this.aiConfigRepo.create({
        schoolId: brightFuture.id,
        modelTier: ModelTier.SMALL,
        monthlyCallCap: 80000,
        callsThisMonth: 42180,
        estimatedSpend: 186,
        reportsPublished: 312,
        teacherReviewRate: 98,
        requireTeacherReview: true,
        voiceToTextEnabled: false,
        lessonAssistantScope: 'curriculum_only',
      }),
    );

    // ── 16. Audit Logs ─────────────────────────────────────────────────
    this.logger.log('Seeding audit logs...');

    const auditEntries: {
      event: string;
      actorName: string;
      target: string;
      result: AuditResult;
      timestamp: Date;
    }[] = [
      {
        event: 'user.login',
        actorName: 'Zonayed Ahamad',
        target: 'Platform Admin Dashboard',
        result: AuditResult.OK,
        timestamp: new Date('2026-07-30T08:15:00Z'),
      },
      {
        event: 'curriculum.publish',
        actorName: 'Emeka Obi',
        target: 'Curriculum v4',
        result: AuditResult.OK,
        timestamp: new Date('2026-07-29T14:22:00Z'),
      },
      {
        event: 'user.suspend',
        actorName: 'Zonayed Ahamad',
        target: 'Chinedu Nwosu',
        result: AuditResult.OK,
        timestamp: new Date('2026-07-28T10:05:00Z'),
      },
      {
        event: 'school.sync',
        actorName: 'System',
        target: 'Bright Future Academy',
        result: AuditResult.FAILED,
        timestamp: new Date('2026-07-27T23:00:00Z'),
      },
    ];

    for (const entry of auditEntries) {
      await this.auditLogRepo.save(
        this.auditLogRepo.create({
          event: entry.event,
          actorId: entry.actorName === 'Zonayed Ahamad' ? zonayed.id : entry.actorName === 'Emeka Obi' ? emeka.id : undefined,
          actorName: entry.actorName,
          target: entry.target,
          result: entry.result,
          timestamp: entry.timestamp,
        }),
      );
    }

    // ── 17. Announcements ──────────────────────────────────────────────
    this.logger.log('Seeding announcements...');

    await this.announcementRepo.save(
      this.announcementRepo.create({
        title: 'Term 3 kits ready for collection',
        message:
          'All Term 3 robotics kits are now available for collection at the school admin office. Please pick up your kit before lessons begin next week.',
        audience: AnnouncementAudience.ALL_PARENTS,
        postedById: funke.id,
        postedAt: new Date('2026-07-10T09:00:00Z'),
      }),
    );

    await this.announcementRepo.save(
      this.announcementRepo.create({
        title: 'Robotics showcase — 30 July',
        message:
          'We are excited to announce the end-of-term Robotics Showcase on 30 July. Learners will present their Smart Reading Lamp projects. Parents are welcome to attend.',
        audience: AnnouncementAudience.ALL_PARENTS,
        postedById: funke.id,
        postedAt: new Date('2026-07-20T08:00:00Z'),
      }),
    );

    this.logger.log('Database seeding complete.');
  }
}
