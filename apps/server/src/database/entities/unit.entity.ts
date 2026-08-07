import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

export enum UnitStatus {
  DONE = 'done',
  CURRENT = 'current',
  LOCKED = 'locked',
}

@Entity('units')
export class Unit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  curriculumVersionId: string;

  @Column({ type: 'int' })
  order: number;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar', enum: UnitStatus, default: UnitStatus.LOCKED })
  status: UnitStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne('CurriculumVersion', 'units', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'curriculumVersionId' })
  curriculumVersion: any;

  @OneToMany('Lesson', 'unit')
  lessons: any[];
}
