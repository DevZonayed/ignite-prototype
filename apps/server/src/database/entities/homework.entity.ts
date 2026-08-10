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

import { TIMESTAMP } from '../column-types';

export enum HomeworkStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Entity('homeworks')
export class Homework {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  lessonId: string;

  @Column({ type: 'varchar' })
  classId: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @Column({ type: 'date', nullable: true })
  dueDate: string;

  @Column({ type: TIMESTAMP, nullable: true })
  publishedAt: Date;

  @Column({ type: 'varchar', enum: HomeworkStatus, default: HomeworkStatus.DRAFT })
  status: HomeworkStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne('Lesson', 'homeworks', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lessonId' })
  lesson: any;

  @ManyToOne('Class', 'homeworks', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classId' })
  class: any;

  @OneToMany('HomeworkSubmission', 'homework')
  submissions: any[];
}
