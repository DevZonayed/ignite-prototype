import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('certificates')
export class Certificate {
  @PrimaryColumn()
  id: string; // e.g. 'IGN-2026-0148'

  @Column({ type: 'varchar' })
  learnerId: string;

  @Column({ type: 'varchar', nullable: true })
  course: string;

  @Column({ type: 'varchar', nullable: true })
  term: string;

  @Column({ type: 'varchar', nullable: true })
  school: string;

  @Column({ type: 'date', nullable: true })
  issueDate: string;

  @Column({ type: 'varchar', nullable: true })
  verifiedId: string;

  @Column({ type: 'text', nullable: true })
  templateHtml: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne('User', 'certificates', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'learnerId' })
  learner: any;
}
