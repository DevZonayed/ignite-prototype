import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

import { TIMESTAMP } from '../column-types';

export enum AuditResult {
  OK = 'ok',
  BLOCKED = 'blocked',
  FAILED = 'failed',
}

/**
 * One row per action taken against the API, by anybody, from any app.
 *
 * Written by `AuditInterceptor` rather than by each service, so a new endpoint
 * is covered the day it is added and nobody has to remember to log. The
 * request-shaped columns below are what makes an entry answerable after the
 * fact: "who did this, from where, what did they send, and what came back".
 */
@Entity('audit_logs')
@Index(['createdAt'])
@Index(['actorId', 'createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Human-readable action, derived from method + route, e.g. `user.create`. */
  @Column({ type: 'varchar' })
  event: string;

  @Column({ type: 'varchar', nullable: true })
  actorId: string;

  @Column({ type: 'varchar', nullable: true })
  actorName: string;

  @Column({ type: 'varchar', nullable: true })
  actorEmail: string;

  @Column({ type: 'varchar', nullable: true })
  actorRole: string;

  /** The actor's school at the time of the action, for tenancy questions. */
  @Column({ type: 'varchar', nullable: true })
  actorSchoolId: string;

  /** Which app the call came from, resolved from Origin, else from the role. */
  @Column({ type: 'varchar', nullable: true })
  source: string;

  @Column({ type: 'varchar', nullable: true })
  target: string;

  /** Resource kind touched, taken from the first path segment, e.g. `users`. */
  @Column({ type: 'varchar', nullable: true })
  targetType: string;

  /** The id in the path, when the route carries one. */
  @Column({ type: 'varchar', nullable: true })
  targetId: string;

  @Column({ type: 'varchar', nullable: true })
  method: string;

  @Column({ type: 'varchar', nullable: true })
  path: string;

  @Column({ type: 'int', nullable: true })
  statusCode: number;

  @Column({ type: 'int', nullable: true })
  durationMs: number;

  @Column({ type: 'varchar', nullable: true })
  ip: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  /** Query string as JSON. Secrets are redacted before it is stored. */
  @Column({ type: 'text', nullable: true })
  requestQuery: string;

  /** Request body as JSON, redacted and truncated. Never holds a password. */
  @Column({ type: 'text', nullable: true })
  requestBody: string;

  /** Failure message when the request did not succeed. */
  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'varchar', enum: AuditResult, nullable: true })
  result: AuditResult;

  @Column({ type: TIMESTAMP, nullable: true })
  timestamp: Date;

  @CreateDateColumn()
  createdAt: Date;
}
