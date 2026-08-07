import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum AuditResult {
  OK = 'ok',
  BLOCKED = 'blocked',
  FAILED = 'failed',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  event: string;

  @Column({ type: 'varchar', nullable: true })
  actorId: string;

  @Column({ type: 'varchar', nullable: true })
  actorName: string;

  @Column({ type: 'varchar', nullable: true })
  target: string;

  @Column({ type: 'varchar', enum: AuditResult, nullable: true })
  result: AuditResult;

  @Column({ type: 'datetime', nullable: true })
  timestamp: Date;

  @CreateDateColumn()
  createdAt: Date;
}
