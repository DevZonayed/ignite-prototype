import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { TIMESTAMP } from '../column-types';

@Entity('assessments')
export class Assessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  learnerId: string;

  @Column({ type: 'varchar' })
  lessonId: string;

  @Column({ type: 'varchar', nullable: true })
  lessonSessionId: string;

  @Column({ type: 'int' })
  score: number;

  @Column({ type: TIMESTAMP, nullable: true })
  savedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne('User', 'assessments', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'learnerId' })
  learner: any;

  @ManyToOne('Lesson', 'assessments', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lessonId' })
  lesson: any;

  @ManyToOne('LessonSession', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'lessonSessionId' })
  lessonSession: any;
}
