import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('evidence_tags')
export class EvidenceTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  evidenceId: string;

  @Column({ type: 'varchar' })
  learnerId: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne('Evidence', 'tags', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evidenceId' })
  evidence: any;

  @ManyToOne('User', 'evidenceTags', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'learnerId' })
  learner: any;
}
