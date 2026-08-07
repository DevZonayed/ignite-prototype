import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum MediaType {
  MP4 = 'mp4',
  PDF = 'pdf',
  PNG = 'png',
  GIF = 'gif',
  SB3 = 'sb3',
  JPG = 'jpg',
}

@Entity('lesson_media')
export class LessonMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  lessonId: string;

  @Column({ type: 'varchar', enum: MediaType })
  type: MediaType;

  @Column({ type: 'varchar', nullable: true })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  fileName: string;

  @Column({ type: 'varchar', nullable: true })
  duration: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne('Lesson', 'media', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lessonId' })
  lesson: any;
}
