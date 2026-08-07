import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum VerificationStatus {
  VERIFIED = 'verified',
  UNVERIFIED = 'unverified',
}

@Entity('parent_children')
export class ParentChild {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  parentId: string;

  @Column({ type: 'varchar' })
  childId: string;

  @Column({ type: 'varchar', enum: VerificationStatus, default: VerificationStatus.UNVERIFIED })
  verificationStatus: VerificationStatus;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne('User', 'parentLinks', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent: any;

  @ManyToOne('User', 'childLinks', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'childId' })
  child: any;
}
