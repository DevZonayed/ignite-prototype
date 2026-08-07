import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('lesson_steps')
export class LessonStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  lessonId: string;

  @Column({ type: 'int' })
  stepNumber: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne('Lesson', 'steps', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lessonId' })
  lesson: any;
}
