import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum SenderType {
  TEACHER = 'teacher',
  PARENT = 'parent',
}

@Entity('homework_messages')
export class HomeworkMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  submissionId: string;

  @Column({ type: 'varchar', enum: SenderType })
  senderType: SenderType;

  @Column({ type: 'varchar', nullable: true })
  senderName: string;

  @Column({ type: 'text' })
  body: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne('HomeworkSubmission', 'messages', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'submissionId' })
  submission: any;
}
