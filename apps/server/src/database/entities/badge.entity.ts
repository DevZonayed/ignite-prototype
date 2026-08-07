import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('badges')
export class Badge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  iconType: string;

  @Column({ type: 'varchar', nullable: true })
  triggerRule: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @OneToMany('BadgeAward', 'badge')
  awards: any[];
}
