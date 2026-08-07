import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('badge_awards')
export class BadgeAward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  badgeId: string;

  @Column({ type: 'varchar' })
  learnerId: string;

  @Column({ type: 'varchar', nullable: true })
  linkedProjectId: string;

  @Column({ type: 'datetime' })
  awardedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne('Badge', 'awards', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'badgeId' })
  badge: any;

  @ManyToOne('User', 'badgeAwards', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'learnerId' })
  learner: any;

  @ManyToOne('Project', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'linkedProjectId' })
  linkedProject: any;
}
