import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum AnnouncementAudience {
  ALL_PARENTS = 'all_parents',
  BY_SCHOOL = 'by_school',
  BY_CLASS = 'by_class',
}

@Entity('announcements')
export class Announcement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', enum: AnnouncementAudience })
  audience: AnnouncementAudience;

  @Column({ type: 'varchar', nullable: true })
  schoolId: string;

  @Column({ type: 'varchar', nullable: true })
  classId: string;

  @Column({ type: 'varchar' })
  postedById: string;

  @Column({ type: 'timestamp', nullable: true })
  postedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne('School', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'schoolId' })
  school: any;

  @ManyToOne('Class', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'classId' })
  class: any;

  @ManyToOne('User', 'announcements', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postedById' })
  postedBy: any;
}
