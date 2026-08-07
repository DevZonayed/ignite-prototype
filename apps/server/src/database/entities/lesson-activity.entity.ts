import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('lesson_activities')
export class LessonActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  lessonId: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'int', default: 0 })
  orderIndex: number;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne('Lesson', 'activities', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lessonId' })
  lesson: any;
}
