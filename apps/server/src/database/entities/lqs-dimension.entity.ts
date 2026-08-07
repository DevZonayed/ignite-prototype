import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('lqs_dimensions')
export class LqsDimension {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  color: string;

  @Column({ type: 'decimal', default: 1 })
  weight: number;

  @Column({ type: 'int', default: 1 })
  rubricVersion: number;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @OneToMany('LqsScore', 'dimension')
  scores: any[];
}
