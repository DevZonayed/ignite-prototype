import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('lqs_scores')
export class LqsScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  learnerId: string;

  @Column({ type: 'varchar', nullable: true })
  lessonId: string;

  @Column({ type: 'varchar' })
  dimensionId: string;

  @Column({ type: 'int' })
  score: number;

  @Column({ type: 'varchar', nullable: true })
  term: string;

  @Column({ type: 'datetime', nullable: true })
  savedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne('User', 'lqsScores', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'learnerId' })
  learner: any;

  @ManyToOne('Lesson', 'lqsScores', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'lessonId' })
  lesson: any;

  @ManyToOne('LqsDimension', 'scores', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dimensionId' })
  dimension: any;
}
